import "server-only";

import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import type { Order, OrderDocument } from "@/types/order";

function toOrder(doc: OrderDocument): Order {
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    userId: String(doc.userId),
    items: doc.items,
    subtotal: doc.subtotal,
    shipping: doc.shipping,
    tax: doc.tax,
    total: doc.total,
    currency: doc.currency ?? "USD",
    status: doc.status,
    shippingAddress: doc.shippingAddress,
    trackingNumber: doc.trackingNumber,
    trackingUrl: doc.trackingUrl,
    statusHistory: doc.statusHistory ?? [],
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

async function getOrdersCollection() {
  const client = await clientPromise;
  const db = client.db("fabrice");
  return db.collection<OrderDocument>("orders");
}

/**
 * All orders belonging to a user, newest first.
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  if (!ObjectId.isValid(userId)) return [];

  const orders = await getOrdersCollection();

  const docs = await orders
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(toOrder);
}

/**
 * A single order, scoped to the requesting user so one user can never
 * load another user's order by guessing/incrementing an id.
 */
export async function getOrderByIdForUser(
  orderId: string,
  userId: string
): Promise<Order | null> {
  if (!ObjectId.isValid(orderId) || !ObjectId.isValid(userId)) return null;

  const orders = await getOrdersCollection();

  const doc = await orders.findOne({
    _id: new ObjectId(orderId),
    userId: new ObjectId(userId),
  });

  return doc ? toOrder(doc) : null;
}
