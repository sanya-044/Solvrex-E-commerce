import { ObjectId, type Collection } from "mongodb";

import { isValidObjectIdString } from "@/lib/order-status";
import { toOrder } from "@/lib/order-view";
import type { Order, OrderDocument } from "@/types/order";

/**
 * User-scoped order queries over an injected collection.
 *
 * Every function here REQUIRES a userId and always includes it in the Mongo
 * filter, so a customer-facing caller can never read another user's order.
 */

export async function findOrdersForUser(
  orders: Collection<OrderDocument>,
  userId: string
): Promise<Order[]> {
  if (!isValidObjectIdString(userId)) return [];

  const docs = await orders
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(toOrder);
}

export async function findOrderForUser(
  orders: Collection<OrderDocument>,
  orderId: string,
  userId: string
): Promise<Order | null> {
  if (!isValidObjectIdString(orderId) || !isValidObjectIdString(userId)) {
    return null;
  }

  const doc = await orders.findOne({
    _id: new ObjectId(orderId),
    userId: new ObjectId(userId),
  });

  return doc ? toOrder(doc) : null;
}
