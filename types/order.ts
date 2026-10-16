import type { ObjectId } from "mongodb";

/**
 * Order lifecycle / approval status.
 *
 * Payment is a separate concept (see PaymentStatus) and must never be
 * encoded in this status.
 */
export const ORDER_STATUSES = [
  "pending_approval",
  "accepted",
  "rejected",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type PaymentMethod = "COD" | "ONLINE";

export type OrderDecisionAction = "accept" | "reject";

/** Verified admin identity taken from the admin session cookie. */
export interface AdminIdentity {
  adminId: string;
  email: string;
}

/* ------------------------------------------------------------------ */
/* Stored shape (MongoDB `VELMORI.orders`)                             */
/* ------------------------------------------------------------------ */

/**
 * Item snapshot as written by POST /api/orders. Every field is optional
 * because older / hand-edited documents may be missing any of them.
 */
export interface StoredOrderItem {
  productId?: string | number;
  name?: string;
  /** Alternate field names tolerated for older documents. */
  title?: string;
  image?: string;
  img?: string;
  imageUrl?: string;
  price?: number;
  quantity?: number;
  size?: string;
  color?: string;
}

/**
 * Shipping address as written by POST /api/orders (`address`, `pincode`).
 * The `line1` / `postalCode` / `fullName` / `country` fields are kept so
 * documents created by the earlier tracking-page model remain readable.
 */
export interface StoredShippingAddress {
  address?: string;
  pincode?: string;
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface StoredStatusEvent {
  /** Previous status; `null` for the creation event. */
  from: string | null;
  to: OrderStatus;
  at: Date;
  by?: AdminIdentity;
  reason?: string;
}

/**
 * `status` and `paymentStatus` are intentionally plain strings: existing
 * records contain legacy values (`placed`, `pending_payment`, `PAID`) and
 * must never be blindly cast to the OrderStatus union.
 */
export interface OrderDocument {
  _id: ObjectId;
  userId: ObjectId;
  orderNumber?: string;
  items?: StoredOrderItem[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: StoredShippingAddress;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  currency?: string;

  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paidAt?: Date;

  acceptedAt?: Date;
  rejectedAt?: Date;
  decisionBy?: AdminIdentity;
  rejectionReason?: string;
  statusHistory?: StoredStatusEvent[];

  trackingNumber?: string;
  trackingUrl?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ------------------------------------------------------------------ */
/* View models (serialisable: ids and dates are strings)               */
/* ------------------------------------------------------------------ */

export interface OrderItem {
  productId?: string | number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  phone?: string;
}

/** Status history entry exposed to the customer (no admin identity). */
export interface OrderStatusEvent {
  from: OrderStatus | null;
  to: OrderStatus;
  at: string;
  reason?: string;
}

/** Customer-facing order. */
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  rejectionReason?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  /** Rejected after payment was captured and no refund workflow exists. */
  refundUnresolved: boolean;
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

/** Admin-facing order row. */
export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    size?: string;
    quantity: number;
  }>;
  itemCount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  /** Raw stored status, shown only when it differs from `status`. */
  legacyStatus?: string;
  canDecide: boolean;
  rejectionReason?: string;
  decidedBy?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  refundUnresolved: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Presentation constants                                              */
/* ------------------------------------------------------------------ */

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending_approval",
  "accepted",
  "processing",
  "shipped",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_approval: "Pending Approval",
  accepted: "Accepted",
  rejected: "Rejected",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending_approval:
    "Your order has been received and is awaiting confirmation.",
  accepted: "Your order has been accepted.",
  rejected: "Your order request was rejected.",
  processing: "Your order is being prepared.",
  shipped: "Your order has shipped.",
  delivered: "Your order has been delivered.",
  cancelled: "This order was cancelled and is no longer being processed.",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
};
