import crypto from "crypto";
import { ObjectId, type Collection } from "mongodb";

import {
  isValidObjectIdString,
  normalizePaymentStatus,
} from "@/lib/order-status";
import type { OrderDocument } from "@/types/order";

export interface VerifyPaymentDeps {
  /** Authenticated customer id from the NextAuth session, or null for guests. */
  getUserId: () => Promise<string | null>;
  getOrders: () => Promise<Collection<OrderDocument>>;
  /** Razorpay key secret (existing env conventions). */
  getSecret: () => string;
  now?: () => Date;
}

function fail(message: string, status: number) {
  return Response.json({ success: false, message }, { status });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Razorpay payment for the authenticated customer's own order.
 *
 * Only payment fields are written. The approval `status` is never touched,
 * so a payment can neither accept an order nor overwrite an admin decision.
 */
export async function handleVerifyPayment(
  request: Request,
  deps: VerifyPaymentDeps
): Promise<Response> {
  try {
    const userId = await deps.getUserId();

    if (!userId || !isValidObjectIdString(userId)) {
      return fail("You must be logged in to verify a payment.", 401);
    }

    let body: Record<string, unknown>;

    try {
      const parsed: unknown = await request.json();

      if (!parsed || typeof parsed !== "object") {
        return fail("Invalid request body.", 400);
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return fail("Invalid request body.", 400);
    }

    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = body;

    if (!orderId) {
      return fail("Order ID is missing.", 400);
    }

    if (!isValidObjectIdString(orderId)) {
      return fail("Invalid order ID.", 400);
    }

    // All three Razorpay fields are mandatory: no signature, no payment.
    if (
      !isNonEmptyString(razorpayOrderId) ||
      !isNonEmptyString(razorpayPaymentId) ||
      !isNonEmptyString(razorpaySignature)
    ) {
      return fail("Payment details are incomplete.", 400);
    }

    const secret = deps.getSecret();

    if (!secret) {
      console.error("Payment verification: Razorpay secret is not configured.");
      return fail("Payment verification is not configured.", 500);
    }

    const orders = await deps.getOrders();
    const filter = {
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    };

    // Ownership is part of the query: another customer's order is "not found".
    const order = await orders.findOne(filter);

    if (!order) {
      return fail("Order not found.", 404);
    }

    if (order.paymentMethod !== "ONLINE" || !order.razorpayOrderId) {
      return fail("This order does not require online payment.", 400);
    }

    // The signed Razorpay order must be the one created for THIS order,
    // otherwise a valid payment for a different order could be replayed.
    if (order.razorpayOrderId !== razorpayOrderId) {
      return fail("Payment does not match this order.", 400);
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return fail("Payment signature mismatch.", 400);
    }

    if (normalizePaymentStatus(order.paymentStatus, order.status) === "paid") {
      return Response.json({
        success: true,
        message: "Payment was already verified.",
      });
    }

    const now = (deps.now ?? (() => new Date()))();

    const result = await orders.updateOne(
      {
        ...filter,
        paymentStatus: { $ne: "paid" },
        // Legacy orders stored `PAID` in `status` instead of paymentStatus.
        status: { $ne: "PAID" },
      },
      {
        $set: {
          paymentStatus: "paid",
          razorpayPaymentId,
          paidAt: now,
          updatedAt: now,
        },
      }
    );

    if (result.matchedCount === 0) {
      // Paid concurrently by an identical request.
      return Response.json({
        success: true,
        message: "Payment was already verified.",
      });
    }

    return Response.json({
      success: true,
      message: "Payment verified.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return fail("Internal server error.", 500);
  }
}
