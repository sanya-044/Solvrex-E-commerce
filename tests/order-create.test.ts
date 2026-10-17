import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { ObjectId } from "mongodb";

import { handleCreateOrder, type CreateOrderDeps } from "@/lib/order-create";

import { getBackends, type OrdersStore } from "./helpers/orders-store";

const payload = {
  items: [
    {
      product: { id: 7, name: "Linen Shirt", price: 899, image: "/img/shirt.jpg" },
      size: "M",
      quantity: 2,
    },
  ],
  customer: { name: "Asha Rao", email: "Asha@Example.com", phone: "9999999999" },
  shippingAddress: { address: "12 MG Road", city: "Pune", state: "MH", pincode: "411001" },
  subtotal: 1798,
  shipping: 0,
  total: 1798,
  paymentMethod: "COD",
};

function post(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

for (const backend of getBackends()) {
  describe(`order creation — ${backend.name}`, () => {
    let store: OrdersStore;
    const userId = new ObjectId().toString();
    let razorpayCalls: number[];
    let deps: CreateOrderDeps;

    beforeEach(async () => {
      store = await backend.open();
      razorpayCalls = [];
      deps = {
        getUserId: async () => userId,
        createRazorpayOrder: async (paise) => {
          razorpayCalls.push(paise);
          return "order_rzp_test_1";
        },
        getOrders: async () => store.orders,
      };
    });

    afterEach(async () => {
      await store.close();
    });

    it("scenario 1: a valid COD order is inserted as pending_approval / payment pending", async () => {
      const res = await handleCreateOrder(post(payload), deps);
      const body = await res.json();

      assert.equal(res.status, 201);

      const saved = await store.raw(body.orderId);
      assert.ok(saved);
      assert.equal(saved.status, "pending_approval");
      assert.equal(saved.paymentStatus, "pending");
      assert.equal(saved.paymentMethod, "COD");
      assert.equal(String(saved.userId), userId);
      assert.equal(saved.customer?.email, "asha@example.com");
      assert.equal(saved.total, 1798);
      assert.equal(saved.shippingAddress?.pincode, "411001");
      assert.equal(saved.items?.[0].name, "Linen Shirt");
      assert.ok(saved.createdAt instanceof Date);
      assert.ok(saved.updatedAt instanceof Date);
      assert.equal(saved.statusHistory?.length, 1);
      assert.equal(saved.statusHistory?.[0].from, null);
      assert.equal(saved.statusHistory?.[0].to, "pending_approval");
      assert.equal(razorpayCalls.length, 0);
    });

    it("scenario 1: an ONLINE order keeps its Razorpay id and is NOT paid or approved", async () => {
      const res = await handleCreateOrder(
        post({ ...payload, paymentMethod: "ONLINE" }),
        deps
      );
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.razorpayOrderId, "order_rzp_test_1");
      assert.deepEqual(razorpayCalls, [179800]);

      const saved = await store.raw(body.orderId);
      assert.equal(saved?.status, "pending_approval");
      assert.equal(saved?.paymentStatus, "pending");
      assert.equal(saved?.razorpayOrderId, "order_rzp_test_1");
    });

    it("ignores any status / paymentStatus sent by the browser", async () => {
      const res = await handleCreateOrder(
        post({ ...payload, status: "accepted", paymentStatus: "paid", decisionBy: { email: "x" } }),
        deps
      );
      const saved = await store.raw((await res.json()).orderId);

      assert.equal(saved?.status, "pending_approval");
      assert.equal(saved?.paymentStatus, "pending");
      assert.equal(saved?.decisionBy, undefined);
    });

    it("scenario 2: a guest cannot submit an order and nothing is stored", async () => {
      const res = await handleCreateOrder(post(payload), {
        ...deps,
        getUserId: async () => null,
      });

      assert.equal(res.status, 401);
      assert.equal(await store.orders.findOne({}), null);
    });

    it("keeps existing validation (empty cart, customer, address, amounts, payment method)", async () => {
      const cases: Array<[string, Record<string, unknown>]> = [
        ["empty cart", { items: [] }],
        ["customer", { customer: { name: "A" } }],
        ["address", { shippingAddress: { address: "x" } }],
        ["amount", { total: "abc" }],
        ["payment method", { paymentMethod: "BITCOIN" }],
      ];

      for (const [label, override] of cases) {
        const res = await handleCreateOrder(post({ ...payload, ...override }), deps);
        assert.equal(res.status, 400, label);
      }

      assert.equal(await store.orders.findOne({}), null);
    });

    it("does not store an order when Razorpay initialisation fails", async () => {
      const res = await handleCreateOrder(
        post({ ...payload, paymentMethod: "ONLINE" }),
        {
          ...deps,
          createRazorpayOrder: async () => {
            throw new Error("bad keys");
          },
        }
      );

      assert.equal(res.status, 400);
      assert.equal(await store.orders.findOne({}), null);
    });
  });
}
