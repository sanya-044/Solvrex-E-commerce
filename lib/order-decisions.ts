import { ObjectId, type Collection, type Filter } from "mongodb";

import {
  isAwaitingDecision,
  isValidObjectIdString,
  normalizeOrderStatus,
  normalizePaymentStatus,
  parseRejectionReason,
} from "@/lib/order-status";
import type {
  AdminIdentity,
  OrderDecisionAction,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
  StoredStatusEvent,
} from "@/types/order";

const MAX_DECISION_ATTEMPTS = 3;

export type DecisionResult =
  | {
      ok: true;
      orderId: string;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      decidedAt: string;
    }
  | {
      ok: false;
      code: 400 | 404 | 409;
      message: string;
      currentStatus?: OrderStatus;
    };

export interface DecideOrderInput {
  orderId: string;
  action: OrderDecisionAction;
  /** Verified identity from the admin session, never from the request body. */
  admin: AdminIdentity;
  /** Only used for `reject`; must already be validated. */
  reason?: string;
  now?: Date;
}

const DECISION_STATUS: Record<OrderDecisionAction, OrderStatus> = {
  accept: "accepted",
  reject: "rejected",
};

/**
 * Atomically accept or reject an order that is awaiting a decision.
 *
 * Concurrency: the update filter matches BOTH the order id and the exact
 * status value that was just read. Of two racing decisions only one can
 * match; the loser re-reads, sees a decided order and gets a 409.
 *
 * Payment is never overwritten. For legacy orders whose `PAID` status is
 * being replaced, the payment state is first persisted to `paymentStatus`
 * (guarded by `$exists: false` so a concurrent payment update is not lost).
 */
export async function decideOrder(
  orders: Collection<OrderDocument>,
  input: DecideOrderInput
): Promise<DecisionResult> {
  if (!isValidObjectIdString(input.orderId)) {
    return { ok: false, code: 400, message: "Invalid order ID." };
  }

  const _id = new ObjectId(input.orderId);
  const toStatus = DECISION_STATUS[input.action];

  for (let attempt = 0; attempt < MAX_DECISION_ATTEMPTS; attempt += 1) {
    const order = await orders.findOne({ _id });

    if (!order) {
      return { ok: false, code: 404, message: "Order not found." };
    }

    if (!isAwaitingDecision(order.status)) {
      const currentStatus = normalizeOrderStatus(order.status);

      return {
        ok: false,
        code: 409,
        message:
          currentStatus === "accepted" || currentStatus === "rejected"
            ? `This order has already been ${currentStatus}.`
            : `This order cannot be ${toStatus} because its status is "${currentStatus}".`,
        currentStatus,
      };
    }

    const now = input.now ?? new Date();
    const filter: Filter<OrderDocument> = { _id, status: order.status };
    const set: Partial<OrderDocument> = {
      status: toStatus,
      updatedAt: now,
      decisionBy: { adminId: input.admin.adminId, email: input.admin.email },
    };

    if (input.action === "accept") {
      set.acceptedAt = now;
    } else {
      set.rejectedAt = now;

      if (input.reason) {
        set.rejectionReason = input.reason;
      }
    }

    if (order.paymentStatus === undefined) {
      // Legacy record: keep the payment fact that `status` used to carry.
      set.paymentStatus = normalizePaymentStatus(undefined, order.status);
      filter.paymentStatus = { $exists: false };
    }

    const event: StoredStatusEvent = {
      from: order.status,
      to: toStatus,
      at: now,
      by: { adminId: input.admin.adminId, email: input.admin.email },
      ...(input.action === "reject" && input.reason
        ? { reason: input.reason }
        : {}),
    };

    const result = await orders.updateOne(filter, {
      $set: set,
      $push: { statusHistory: event },
    });

    if (result.matchedCount === 1) {
      return {
        ok: true,
        orderId: input.orderId,
        status: toStatus,
        paymentStatus: normalizePaymentStatus(
          set.paymentStatus ?? order.paymentStatus,
          order.status
        ),
        decidedAt: now.toISOString(),
      };
    }

    // Lost a race (or payment changed underneath us): re-read and re-evaluate.
  }

  return {
    ok: false,
    code: 409,
    message:
      "This order was changed by another request. Refresh and try again.",
  };
}

export interface AdminDecisionDeps {
  getAdmin: () => Promise<AdminIdentity | null>;
  getOrders: () => Promise<Collection<OrderDocument>>;
}

async function readJsonBody(
  request: Request
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  const text = await request.text();

  if (!text.trim()) return { ok: true, body: undefined };

  try {
    return { ok: true, body: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/**
 * HTTP-level handler shared by the accept/reject routes.
 * Authentication is checked first; the actor comes only from the session.
 */
export async function handleAdminOrderDecision(
  request: Request,
  orderId: string,
  action: OrderDecisionAction,
  deps: AdminDecisionDeps
): Promise<Response> {
  try {
    const admin = await deps.getAdmin();

    if (!admin) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    let reason: string | undefined;

    if (action === "reject") {
      const parsed = await readJsonBody(request);

      if (!parsed.ok) {
        return Response.json(
          { message: "Request body must be valid JSON." },
          { status: 400 }
        );
      }

      const body = parsed.body;
      const rawReason =
        body && typeof body === "object"
          ? (body as { reason?: unknown }).reason
          : undefined;
      const reasonResult = parseRejectionReason(rawReason);

      if (!reasonResult.ok) {
        return Response.json(
          { message: reasonResult.message },
          { status: 400 }
        );
      }

      reason = reasonResult.reason;
    }

    const result = await decideOrder(await deps.getOrders(), {
      orderId,
      action,
      admin,
      reason,
    });

    if (!result.ok) {
      return Response.json(
        { message: result.message, currentStatus: result.currentStatus },
        { status: result.code }
      );
    }

    return Response.json({
      message:
        action === "accept"
          ? "Order accepted successfully."
          : "Order rejected successfully.",
      order: {
        id: result.orderId,
        status: result.status,
        paymentStatus: result.paymentStatus,
        decidedAt: result.decidedAt,
      },
    });
  } catch (error) {
    console.error(`Admin order ${action} error:`, error);

    return Response.json(
      { message: `Failed to ${action} the order.` },
      { status: 500 }
    );
  }
}
