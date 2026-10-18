import {
  isAwaitingDecision,
  normalizeOrderStatus,
  normalizePaymentMethod,
  normalizePaymentStatus,
} from "@/lib/order-status";
import type {
  AdminOrder,
  Order,
  OrderDocument,
  OrderItem,
  OrderStatusEvent,
  ShippingAddress,
  StoredOrderItem,
  StoredShippingAddress,
  StoredStatusEvent,
} from "@/types/order";

/**
 * Pure mappers from raw MongoDB documents to serialisable view models.
 * They tolerate every historical document shape and never throw on missing
 * fields.
 */

function toIso(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  const date = value instanceof Date ? value : new Date(value as string);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toOrderItem(item: StoredOrderItem): OrderItem {
  return {
    productId: item.productId,
    name: toText(item.name) || toText(item.title) || "Product",
    image: item.image || item.img || item.imageUrl || undefined,
    price: toNumber(item.price),
    quantity: toNumber(item.quantity),
    size: item.size || undefined,
    color: item.color || undefined,
  };
}

function toShippingAddress(
  address: StoredShippingAddress | undefined,
  customerName: string
): ShippingAddress {
  return {
    fullName: address?.fullName || customerName || undefined,
    line1: address?.line1 ?? address?.address ?? "",
    line2: address?.line2 || undefined,
    city: address?.city ?? "",
    state: address?.state || undefined,
    postalCode: address?.postalCode ?? address?.pincode ?? "",
    country: address?.country || undefined,
    phone: address?.phone || undefined,
  };
}

function toStatusEvent(event: StoredStatusEvent): OrderStatusEvent | null {
  const at = toIso(event?.at);

  if (!at) return null;

  return {
    from: event.from ? normalizeOrderStatus(event.from) : null,
    to: normalizeOrderStatus(event.to),
    at,
    reason: event.reason || undefined,
  };
}

function resolveCreatedAt(doc: OrderDocument): string {
  return (
    toIso(doc.createdAt) ??
    (doc._id && typeof doc._id.getTimestamp === "function"
      ? doc._id.getTimestamp().toISOString()
      : new Date(0).toISOString())
  );
}

/** Customer-facing view. Never includes admin identity. */
export function toOrder(doc: OrderDocument): Order {
  const status = normalizeOrderStatus(doc.status);
  const paymentStatus = normalizePaymentStatus(doc.paymentStatus, doc.status);
  const createdAt = resolveCreatedAt(doc);

  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber ?? String(doc._id).slice(-6).toUpperCase(),
    userId: String(doc.userId),
    items: Array.isArray(doc.items) ? doc.items.map(toOrderItem) : [],
    subtotal: toNumber(doc.subtotal),
    shipping: toNumber(doc.shipping),
    tax: toNumber(doc.tax),
    total: toNumber(doc.total),
    // Checkout charges in INR; older tracking-page documents may set it.
    currency: doc.currency ?? "INR",
    status,
    paymentStatus,
    paymentMethod: normalizePaymentMethod(doc.paymentMethod),
    shippingAddress: toShippingAddress(
      doc.shippingAddress,
      toText(doc.customer?.name)
    ),
    trackingNumber: doc.trackingNumber || undefined,
    trackingUrl: doc.trackingUrl || undefined,
    rejectionReason:
      status === "rejected" ? doc.rejectionReason || undefined : undefined,
    acceptedAt: toIso(doc.acceptedAt),
    rejectedAt: toIso(doc.rejectedAt),
    refundUnresolved: status === "rejected" && paymentStatus === "paid",
    statusHistory: (Array.isArray(doc.statusHistory) ? doc.statusHistory : [])
      .map(toStatusEvent)
      .filter((event): event is OrderStatusEvent => event !== null),
    createdAt,
    updatedAt: toIso(doc.updatedAt) ?? createdAt,
  };
}

/** Admin-facing row, including who made the decision. */
export function toAdminOrder(doc: OrderDocument): AdminOrder {
  const status = normalizeOrderStatus(doc.status);
  const paymentStatus = normalizePaymentStatus(doc.paymentStatus, doc.status);
  const items = Array.isArray(doc.items) ? doc.items : [];

  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber ?? String(doc._id).slice(-6).toUpperCase(),
    customer: {
      name: toText(doc.customer?.name),
      email: toText(doc.customer?.email),
      phone: toText(doc.customer?.phone),
    },
    items: items.map((item) => ({
      name: toText(item.name) || "Product",
      size: item.size || undefined,
      quantity: toNumber(item.quantity),
    })),
    itemCount: items.reduce((sum, item) => sum + toNumber(item.quantity), 0),
    total: toNumber(doc.total),
    paymentMethod: normalizePaymentMethod(doc.paymentMethod),
    paymentStatus,
    status,
    legacyStatus: doc.status !== status ? String(doc.status) : undefined,
    canDecide: isAwaitingDecision(doc.status),
    rejectionReason:
      status === "rejected" ? doc.rejectionReason || undefined : undefined,
    decidedBy: doc.decisionBy?.email || undefined,
    acceptedAt: toIso(doc.acceptedAt),
    rejectedAt: toIso(doc.rejectedAt),
    refundUnresolved: status === "rejected" && paymentStatus === "paid",
    createdAt: resolveCreatedAt(doc),
  };
}
