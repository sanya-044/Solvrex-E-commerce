import assert from "node:assert/strict";
import crypto from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";

import { ObjectId } from "mongodb";

import { handleVerifyPayment, type VerifyPaymentDeps } from "@/lib/payment-verification";

import { getBackends, storedOrder, type OrdersStore } from "./helpers/orders-store";

const SECRET = "test_razorpay_secret";

function sign(razorpayOrderId: string, paymentId: string, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
}

function post(body: unknown) {
  return new Request("http://localhost/api/varify-payment", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

for (const backend of getBackends()) {
  describe(`payment verification — ${backend.name}`, () => {
    let store: OrdersStore;
    let deps: VerifyPaymentDeps;
    const customerId = new ObjectId();
    const otherCustomerId = new ObjectId();
    let currentUser: string | null;

    async function seedOnline(overrides: Record<string, unknown> = {}, owner = customerId) {
      return (
        await store.seed(
          storedOrder(owner, {
            paymentMethod: "ONLINE",
            razorpayOrderId: "order_rzp_1",
            ...overrides,
          })
        )
      ).toString();
    }

    const validBody = (orderId: string) => ({
      orderId,
      razorpay_order_id: "order_rzp_1",
      razorpay_payment_id: "pay_1",
      razorpay_signature: sign("order_rzp_1", "pay_1"),
    });

    beforeEach(async () => {
      store = await backend.open();
      currentUser = customerId.toString();
      deps = {
        getUserId: async () => currentUser,
        getOrders: async () => store.orders,
        getSecret: () => SECRET,
      };
    });

    afterEach(async () => {
      await store.close();
    });

    it("marks only the payment as paid and leaves approval status untouched", async () => {
      const id = await seedOnline();

      const res = await handleVerifyPayment(post(validBody(id)), deps);
      assert.equal(res.status, 200);
      assert.equal((await res.json()).success, true);

      const saved = await store.raw(id);
      assert.equal(saved?.paymentStatus, "paid");
      assert.equal(saved?.razorpayPaymentId, "pay_1");
      assert.ok(saved?.paidAt instanceof Date);
      assert.equal(saved?.status, "pending_approval");
    });

    it("scenario 12: payment never overwrites an accepted or rejected decision", async () => {
      for (const status of ["accepted", "rejected"]) {
        const id = await seedOnline({ status });
        const res = await handleVerifyPayment(post(validBody(id)), deps);

        assert.equal(res.status, 200, status);

        const saved = await store.raw(id);
        assert.equal(saved?.status, status);
        assert.equal(saved?.paymentStatus, "paid");
      }
    });

    it("scenario 11: cannot verify (or alter) another customer's order", async () => {
      const id = await seedOnline({}, otherCustomerId);

      const res = await handleVerifyPayment(post(validBody(id)), deps);
      assert.equal(res.status, 404);

      const saved = await store.raw(id);
      assert.equal(saved?.paymentStatus, "pending");
      assert.equal(saved?.razorpayPaymentId, undefined);
      assert.equal(saved?.status, "pending_approval");
    });

    it("a guest cannot verify payments", async () => {
      const id = await seedOnline();
      currentUser = null;

      assert.equal((await handleVerifyPayment(post(validBody(id)), deps)).status, 401);
      assert.equal((await store.raw(id))?.paymentStatus, "pending");
    });

    it("missing signature / payment details cannot mark an order paid", async () => {
      const id = await seedOnline();
      const full = validBody(id);

      for (const missing of ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"] as const) {
        const body: Record<string, unknown> = { ...full };
        delete body[missing];
        assert.equal((await handleVerifyPayment(post(body), deps)).status, 400, missing);
      }

      // Only an orderId (what the old endpoint accepted) is not enough.
      assert.equal((await handleVerifyPayment(post({ orderId: id }), deps)).status, 400);
      assert.equal((await handleVerifyPayment(post({ ...full, razorpay_signature: "" }), deps)).status, 400);

      const saved = await store.raw(id);
      assert.equal(saved?.paymentStatus, "pending");
      assert.equal(saved?.status, "pending_approval");
    });

    it("an invalid signature is rejected", async () => {
      const id = await seedOnline();

      for (const razorpay_signature of [sign("order_rzp_1", "pay_1", "wrong-secret"), "deadbeef", "x".repeat(64)]) {
        const res = await handleVerifyPayment(post({ ...validBody(id), razorpay_signature }), deps);
        assert.equal(res.status, 400);
      }

      assert.equal((await store.raw(id))?.paymentStatus, "pending");
    });

    it("a valid payment for a DIFFERENT Razorpay order cannot be replayed onto this order", async () => {
      const id = await seedOnline();

      const res = await handleVerifyPayment(
        post({
          orderId: id,
          razorpay_order_id: "order_rzp_other",
          razorpay_payment_id: "pay_9",
          razorpay_signature: sign("order_rzp_other", "pay_9"),
        }),
        deps
      );

      assert.equal(res.status, 400);
      assert.equal((await store.raw(id))?.paymentStatus, "pending");
    });

    it("invalid / unknown order ids and malformed bodies are controlled errors", async () => {
      for (const orderId of ["nope", "aaaaaaaaaaaa", 123]) {
        assert.equal((await handleVerifyPayment(post({ ...validBody("x"), orderId }), deps)).status, 400);
      }

      assert.equal((await handleVerifyPayment(post(validBody(new ObjectId().toString())), deps)).status, 404);
      assert.equal((await handleVerifyPayment(post("{broken"), deps)).status, 400);
      assert.equal((await handleVerifyPayment(post("null"), deps)).status, 400);
    });

    it("fails closed when the Razorpay secret is not configured", async () => {
      const id = await seedOnline();
      const res = await handleVerifyPayment(post(validBody(id)), { ...deps, getSecret: () => "" });

      assert.equal(res.status, 500);
      assert.equal((await store.raw(id))?.paymentStatus, "pending");
    });

    it("refuses COD orders", async () => {
      const id = (await store.seed(storedOrder(customerId))).toString();
      const res = await handleVerifyPayment(post(validBody(id)), deps);

      assert.equal(res.status, 400);
      assert.equal((await store.raw(id))?.paymentStatus, "pending");
    });

    it("is idempotent and keeps the first payment id", async () => {
      const id = await seedOnline();

      assert.equal((await handleVerifyPayment(post(validBody(id)), deps)).status, 200);

      const replay = {
        ...validBody(id),
        razorpay_payment_id: "pay_2",
        razorpay_signature: sign("order_rzp_1", "pay_2"),
      };
      assert.equal((await handleVerifyPayment(post(replay), deps)).status, 200);
      assert.equal((await store.raw(id))?.razorpayPaymentId, "pay_1");
    });

    it("legacy orders (status carried PAID / pending_payment) keep working", async () => {
      const legacy = await seedOnline({ status: "pending_payment", paymentStatus: undefined });
      if (backend.name.startsWith("real")) {
        await store.orders.updateOne({ _id: new ObjectId(legacy) }, { $unset: { paymentStatus: "" } });
      }

      assert.equal((await handleVerifyPayment(post(validBody(legacy)), deps)).status, 200);

      const saved = await store.raw(legacy);
      assert.equal(saved?.paymentStatus, "paid");
      assert.equal(saved?.status, "pending_payment");
    });
  });
}
