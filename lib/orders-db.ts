import "server-only";

import clientPromise from "@/lib/mongodb";
import type { OrderDocument } from "@/types/order";

/** The existing `VELMORI.orders` collection. */
export async function getOrdersCollection() {
  const client = await clientPromise;
  const db = client.db("VELMORI");
  return db.collection<OrderDocument>("orders");
}
