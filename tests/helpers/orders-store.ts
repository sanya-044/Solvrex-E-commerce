import { MongoClient, ObjectId, type Collection } from "mongodb";

import type { OrderDocument } from "@/types/order";

/**
 * Test storage backends for the orders collection.
 *
 * - `memory`: an in-memory fake implementing the small subset of the MongoDB
 *   driver used by the order code (equality / $exists / $ne / $in filters,
 *   $set / $push updates). Each updateOne is atomic, like MongoDB's.
 * - `mongo`: a real MongoDB, enabled only when TEST_MONGODB_URI is set. It
 *   uses a throw-away database that is dropped afterwards, never VELMORI.
 */

type Doc = Record<string, unknown>;

function isObjectId(value: unknown): value is ObjectId {
  return value instanceof ObjectId;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (isObjectId(a) || isObjectId(b)) return String(a) === String(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

function matchesCondition(actual: unknown, condition: unknown): boolean {
  if (
    condition !== null &&
    typeof condition === "object" &&
    !isObjectId(condition) &&
    !(condition instanceof Date)
  ) {
    const ops = condition as Record<string, unknown>;

    return Object.entries(ops).every(([op, expected]) => {
      switch (op) {
        case "$exists":
          return (actual !== undefined) === Boolean(expected);
        case "$ne":
          return !valuesEqual(actual, expected);
        case "$in":
          return (expected as unknown[]).some((v) => valuesEqual(actual, v));
        default:
          throw new Error(`Unsupported operator in fake collection: ${op}`);
      }
    });
  }

  return valuesEqual(actual, condition);
}

function matches(doc: Doc, filter: Doc): boolean {
  return Object.entries(filter).every(([key, condition]) =>
    matchesCondition(doc[key], condition)
  );
}

export class FakeOrdersCollection {
  private docs: Doc[] = [];

  async insertOne(doc: Doc) {
    await Promise.resolve();
    const _id = (doc._id as ObjectId | undefined) ?? new ObjectId();
    this.docs.push({ ...doc, _id });
    return { acknowledged: true, insertedId: _id };
  }

  async findOne(filter: Doc) {
    // Yield so concurrent callers can interleave reads, like a real driver.
    await Promise.resolve();
    const found = this.docs.find((doc) => matches(doc, filter));
    return found ? { ...found } : null;
  }

  find(filter: Doc) {
    const results = this.docs.filter((doc) => matches(doc, filter));
    const cursor = {
      sort: (spec: Record<string, 1 | -1>) => {
        const [[key, dir]] = Object.entries(spec);
        results.sort((a, b) => {
          const av = (a[key] as Date | undefined)?.getTime?.() ?? 0;
          const bv = (b[key] as Date | undefined)?.getTime?.() ?? 0;
          return (av - bv) * dir;
        });
        return cursor;
      },
      toArray: async () => results.map((doc) => ({ ...doc })),
    };
    return cursor;
  }

  async updateOne(
    filter: Doc,
    update: { $set?: Doc; $push?: Record<string, unknown> }
  ) {
    await Promise.resolve();

    // The match + write below is synchronous, i.e. atomic.
    const target = this.docs.find((doc) => matches(doc, filter));

    if (!target) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };

    Object.assign(target, update.$set ?? {});

    for (const [key, value] of Object.entries(update.$push ?? {})) {
      const existing = target[key];
      target[key] = Array.isArray(existing) ? [...existing, value] : [value];
    }

    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }
}

export interface OrdersStore {
  orders: Collection<OrderDocument>;
  /** Insert a raw document exactly as given (e.g. a legacy shape). */
  seed: (doc: Record<string, unknown>) => Promise<ObjectId>;
  /** Read the raw stored document. */
  raw: (id: ObjectId | string) => Promise<OrderDocument | null>;
  close: () => Promise<void>;
}

export interface Backend {
  name: string;
  open: () => Promise<OrdersStore>;
}

function memoryBackend(): Backend {
  return {
    name: "in-memory fake",
    open: async () => {
      const fake = new FakeOrdersCollection();
      const orders = fake as unknown as Collection<OrderDocument>;

      return {
        orders,
        seed: async (doc) => {
          const result = await fake.insertOne(doc);
          return result.insertedId;
        },
        raw: (id) => orders.findOne({ _id: new ObjectId(String(id)) }),
        close: async () => {},
      };
    },
  };
}

function mongoBackend(uri: string): Backend {
  return {
    name: "real MongoDB (temporary database)",
    open: async () => {
      const client = await new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
      }).connect();
      const dbName = `velmori_test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      const db = client.db(dbName);
      const orders = db.collection<OrderDocument>("orders");

      return {
        orders,
        seed: async (doc) => {
          const result = await orders.insertOne(doc as unknown as OrderDocument);
          return result.insertedId;
        },
        raw: (id) => orders.findOne({ _id: new ObjectId(String(id)) }),
        close: async () => {
          await db.dropDatabase();
          await client.close();
        },
      };
    },
  };
}

export function getBackends(): Backend[] {
  const backends = [memoryBackend()];
  const uri = process.env.TEST_MONGODB_URI;

  if (uri) backends.push(mongoBackend(uri));

  return backends;
}

/** A realistic document as written by POST /api/orders (stored shape). */
export function storedOrder(
  userId: ObjectId,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const now = new Date("2026-01-01T10:00:00.000Z");

  return {
    userId,
    orderNumber: "123456",
    items: [
      {
        productId: 7,
        name: "Linen Shirt",
        price: 899,
        image: "/img/shirt.jpg",
        size: "M",
        quantity: 2,
      },
    ],
    customer: { name: "Asha Rao", email: "asha@example.com", phone: "9999999999" },
    shippingAddress: {
      address: "12 MG Road",
      city: "Pune",
      state: "MH",
      pincode: "411001",
    },
    subtotal: 1798,
    shipping: 0,
    total: 1798,
    paymentMethod: "COD",
    status: "pending_approval",
    paymentStatus: "pending",
    razorpayOrderId: null,
    statusHistory: [{ from: null, to: "pending_approval", at: now }],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
