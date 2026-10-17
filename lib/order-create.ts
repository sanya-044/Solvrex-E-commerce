import { ObjectId, type Collection } from "mongodb";

import { isValidObjectIdString } from "@/lib/order-status";
import type { OrderDocument } from "@/types/order";

type RequestItem = {
  product?: {
    id?: number | string;
    name?: string;
    price?: number | string;
    image?: string;
  };
  size?: string;
  quantity?: number | string;
};

export interface CreateOrderDeps {
  /** Authenticated customer id from the NextAuth session, or null for guests. */
  getUserId: () => Promise<string | null>;
  /** Creates a Razorpay order for `amountInPaise` and returns its id. */
  createRazorpayOrder: (amountInPaise: number) => Promise<string>;
  getOrders: () => Promise<Collection<OrderDocument>>;
  now?: () => Date;
}

function badRequest(message: string) {
  return Response.json({ message }, { status: 400 });
}

/**
 * POST /api/orders
 *
 * Initial approval/payment state is decided here, on the server. Any
 * `status` / `paymentStatus` sent by the browser is ignored.
 */
export async function handleCreateOrder(
  request: Request,
  deps: CreateOrderDeps
): Promise<Response> {
  try {
    const userId = await deps.getUserId();

    if (!userId || !isValidObjectIdString(userId)) {
      return Response.json(
        { message: "You must be logged in to place an order." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      items,
      customer,
      shippingAddress,
      subtotal,
      shipping,
      total,
      paymentMethod,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("Your cart is empty.");
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return badRequest("Customer information is incomplete.");
    }

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return badRequest("Shipping address is incomplete.");
    }

    if (
      !Number.isFinite(Number(subtotal)) ||
      !Number.isFinite(Number(shipping)) ||
      !Number.isFinite(Number(total))
    ) {
      return badRequest("Invalid order amount.");
    }

    const method = paymentMethod || "COD";

    if (method !== "COD" && method !== "ONLINE") {
      return badRequest("Invalid payment method.");
    }

    // If online payment is selected, create a Razorpay order first
    let razorpayOrderId: string | null = null;

    if (method === "ONLINE") {
      try {
        razorpayOrderId = await deps.createRazorpayOrder(
          Math.round(Number(total) * 100) // paise, e.g. ₹899 = 89900
        );
      } catch (razorpayErr) {
        console.error("Razorpay order creation failed:", razorpayErr);

        return badRequest(
          "Failed to initialize online payment order with Razorpay keys."
        );
      }
    }

    const now = (deps.now ?? (() => new Date()))();

    const order: Omit<OrderDocument, "_id"> = {
      userId: new ObjectId(userId),
      orderNumber: Math.floor(100000 + Math.random() * 900000).toString(),

      items: (items as RequestItem[]).map((item) => ({
        productId: item.product?.id,
        name: item.product?.name,
        price: Number(item.product?.price),
        image: item.product?.image,
        size: item.size,
        quantity: Number(item.quantity),
      })),

      customer: {
        name: String(customer.name).trim(),
        email: String(customer.email).trim().toLowerCase(),
        phone: String(customer.phone).trim(),
      },

      shippingAddress: {
        address: String(shippingAddress.address).trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },

      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),

      paymentMethod: method,
      // Approval and payment are separate: every new order awaits an admin
      // decision, and nothing is paid until the signature is verified.
      status: "pending_approval",
      paymentStatus: "pending",
      razorpayOrderId,
      statusHistory: [{ from: null, to: "pending_approval", at: now }],

      createdAt: now,
      updatedAt: now,
    };

    const orders = await deps.getOrders();
    const result = await orders.insertOne(order as OrderDocument);

    return Response.json(
      {
        message: "Order initialized successfully.",
        orderId: result.insertedId.toString(),
        razorpayOrderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      { message: "Unable to place your order." },
      { status: 500 }
    );
  }
}
