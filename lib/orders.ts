import "server-only";

import { getOrdersCollection } from "@/lib/orders-db";
import { findOrderForUser, findOrdersForUser } from "@/lib/order-queries";
import type { Order } from "@/types/order";

/**
 * All orders belonging to a user, newest first.
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return findOrdersForUser(await getOrdersCollection(), userId);
}

/**
 * A single order, scoped to the requesting user so one user can never
 * load another user's order by guessing/incrementing an id.
 */
export async function getOrderByIdForUser(
  orderId: string,
  userId: string
): Promise<Order | null> {
  return findOrderForUser(await getOrdersCollection(), orderId, userId);
}
