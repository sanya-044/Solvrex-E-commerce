import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { ObjectId } from "mongodb";

import { handleAdminOrderDecision, type AdminDecisionDeps } from "@/lib/order-decisions";
import { findOrderForUser, findOrdersForUser } from "@/lib/order-queries";
import { toAdminOrder } from "@/lib/order-view";
import type { AdminIdentity, OrderDecisionAction } from "@/types/order";

import { getBackends, storedOrder, type OrdersStore } from "./helpers/orders-store";

const ADMIN: AdminIdentity = { adminId: "admin-1", email: "admin@velmori.test" };

function patch(action: OrderDecisionAction, id: string, body?: unknown) {
  const request = new Request(`http://localhost/api/admin/orders/${id}/${action}`, {
    method: "PATCH",
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

  return request;
}

for (const backend of getBackends()) {
  describe(`admin accept / reject — ${backend.name}`, () => {
    let store: OrdersStore;
    let deps: AdminDecisionDeps;
    const customerId = new ObjectId();
    const otherCustomerId = new ObjectId();

    const call = (action: OrderDecisionAction, id: string, body?: unknown, d = deps) =>
      handleAdminOrderDecision(patch(action, id, body), id, action, d);

    beforeEach(async () => {
      store = await backend.open();
      deps = {
        getAdmin: async () => ADMIN,
        getOrders: async () => store.orders,
      };
    });

    afterEach(async () => {
      await store.close();
    });

    it("scenario 3: unauthenticated requests get 401 and change nothing", async () => {
      const id = await store.seed(storedOrder(customerId));
      const guest: AdminDecisionDeps = { ...deps, getAdmin: async () => null };

      for (const action of ["accept", "reject"] as const) {
        const res = await call(action, id.toString(), {}, guest);
        assert.equal(res.status, 401, action);
      }

      // Even an invalid id is 401 first: nothing is revealed without a session.
      assert.equal((await call("accept", "bad-id", undefined, guest)).status, 401);

      const saved = await store.raw(id);
      assert.equal(saved?.status, "pending_approval");
      assert.equal(saved?.acceptedAt, undefined);
      assert.equal(saved?.rejectedAt, undefined);
    });

    it("scenarios 4 & 6: admin accepts a pending order and the decision persists", async () => {
      const id = await store.seed(storedOrder(customerId));
      const before = Date.now();

      const res = await call("accept", id.toString());
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.order.status, "accepted");
      assert.equal(body.order.id, id.toString());

      const saved = await store.raw(id);
      assert.equal(saved?.status, "accepted");
      assert.ok(saved?.acceptedAt instanceof Date);
      assert.ok(saved.acceptedAt.getTime() >= before - 1000);
      assert.equal(saved.rejectedAt, undefined);
      assert.ok(saved.updatedAt instanceof Date);
      assert.ok(saved.updatedAt.getTime() > new Date("2026-01-01T10:00:00Z").getTime());
      assert.deepEqual(saved.decisionBy, ADMIN);

      assert.equal(saved.statusHistory?.length, 2);
      const event = saved.statusHistory?.[1];
      assert.equal(event?.from, "pending_approval");
      assert.equal(event?.to, "accepted");
      assert.deepEqual(event?.by, ADMIN);
      assert.ok(event?.at instanceof Date);
    });

    it("scenarios 5 & 6: admin rejects a pending order with a reason", async () => {
      const id = await store.seed(storedOrder(customerId));

      const res = await call("reject", id.toString(), { reason: "  Out of stock  " });
      assert.equal(res.status, 200);
      assert.equal((await res.json()).order.status, "rejected");

      const saved = await store.raw(id);
      assert.equal(saved?.status, "rejected");
      assert.ok(saved?.rejectedAt instanceof Date);
      assert.equal(saved.acceptedAt, undefined);
      assert.equal(saved.rejectionReason, "Out of stock");
      assert.deepEqual(saved.decisionBy, ADMIN);
      assert.equal(saved.statusHistory?.[1].reason, "Out of stock");
      assert.equal(saved.statusHistory?.[1].to, "rejected");
    });

    it("rejection works without a body or reason (reason is optional)", async () => {
      const a = await store.seed(storedOrder(customerId));
      const b = await store.seed(storedOrder(customerId));

      assert.equal((await call("reject", a.toString())).status, 200);
      assert.equal((await call("reject", b.toString(), { reason: "   " })).status, 200);

      assert.equal((await store.raw(a))?.rejectionReason, undefined);
      assert.equal((await store.raw(b))?.rejectionReason, undefined);
    });

    it("rejects invalid reasons / bodies with 400 and changes nothing", async () => {
      const id = await store.seed(storedOrder(customerId));

      assert.equal((await call("reject", id.toString(), { reason: 42 })).status, 400);
      assert.equal((await call("reject", id.toString(), { reason: "x".repeat(501) })).status, 400);
      assert.equal((await call("reject", id.toString(), "{not json")).status, 400);

      assert.equal((await store.raw(id))?.status, "pending_approval");
    });

    it("never trusts identity or status supplied by the browser", async () => {
      const id = await store.seed(storedOrder(customerId));

      const res = await call("accept", id.toString(), {
        status: "rejected",
        decisionBy: { adminId: "evil", email: "evil@example.com" },
        reason: "ignored",
      });
      assert.equal(res.status, 200);

      const saved = await store.raw(id);
      assert.equal(saved?.status, "accepted");
      assert.deepEqual(saved?.decisionBy, ADMIN);
      assert.equal(saved?.rejectionReason, undefined);
    });

    it("scenario 7: a second decision on a decided order returns 409 and changes nothing", async () => {
      const id = (await store.seed(storedOrder(customerId))).toString();
      await call("accept", id);
      const afterFirst = await store.raw(id);

      for (const action of ["accept", "reject"] as const) {
        const res = await call(action, id, { reason: "late" });
        assert.equal(res.status, 409, action);
        assert.equal((await res.json()).currentStatus, "accepted");
      }

      const afterSecond = await store.raw(id);
      assert.equal(afterSecond?.status, "accepted");
      assert.equal(afterSecond?.statusHistory?.length, 2);
      assert.equal(afterSecond?.updatedAt?.getTime(), afterFirst?.updatedAt?.getTime());
      assert.equal(afterSecond?.rejectedAt, undefined);

      const rejectedId = (await store.seed(storedOrder(customerId))).toString();
      await call("reject", rejectedId);
      assert.equal((await call("accept", rejectedId)).status, 409);
      assert.equal((await store.raw(rejectedId))?.status, "rejected");
    });

    it("cannot decide fulfilled / cancelled / unknown-status orders (409)", async () => {
      for (const status of ["shipped", "delivered", "cancelled", "processing", "mystery"]) {
        const id = await store.seed(storedOrder(customerId, { status }));
        const res = await call("accept", id.toString());
        assert.equal(res.status, 409, status);
        assert.equal((await store.raw(id))?.status, status);
      }
    });

    it("scenario 8: invalid ids give a controlled 400, unknown ids give 404", async () => {
      for (const bad of ["not-an-id", "aaaaaaaaaaaa", "123", "", "z".repeat(24)]) {
        const res = await call("accept", bad);
        assert.equal(res.status, 400, JSON.stringify(bad));
        assert.equal(typeof (await res.json()).message, "string");
      }

      assert.equal((await call("accept", new ObjectId().toString())).status, 404);
      assert.equal((await call("reject", new ObjectId().toString())).status, 404);
    });

    it("returns 500 (not a crash) when the database fails", async () => {
      const res = await call("accept", new ObjectId().toString(), undefined, {
        ...deps,
        getOrders: async () => {
          throw new Error("db down");
        },
      });
      assert.equal(res.status, 500);
    });

    it("concurrent accept + reject: exactly one wins, the other gets 409", async () => {
      for (let i = 0; i < 5; i += 1) {
        const id = (await store.seed(storedOrder(customerId))).toString();

        const results = await Promise.all([
          call("accept", id),
          call("reject", id, { reason: "race" }),
          call("accept", id),
          call("reject", id),
        ]);
        const statuses = results.map((r) => r.status).sort();

        assert.deepEqual(statuses, [200, 409, 409, 409]);

        const saved = await store.raw(id);
        const winner = results.findIndex((r) => r.status === 200);
        const winningAction = winner % 2 === 0 ? "accepted" : "rejected";

        assert.equal(saved?.status, winningAction);
        // Exactly one decision event was recorded; no mixed accepted+rejected state.
        assert.equal(saved?.statusHistory?.length, 2);
        assert.equal(Boolean(saved?.acceptedAt) !== Boolean(saved?.rejectedAt), true);
      }
    });

    it("scenario 12: payment and approval stay independent", async () => {
      const paid = (
        await store.seed(
          storedOrder(customerId, {
            paymentMethod: "ONLINE",
            paymentStatus: "paid",
            razorpayPaymentId: "pay_1",
          })
        )
      ).toString();

      await call("accept", paid);
      let saved = await store.raw(paid);
      assert.equal(saved?.status, "accepted");
      assert.equal(saved?.paymentStatus, "paid");
      assert.equal(saved?.razorpayPaymentId, "pay_1");

      const unpaid = (await store.seed(storedOrder(customerId))).toString();
      await call("accept", unpaid);
      saved = await store.raw(unpaid);
      assert.equal(saved?.status, "accepted");
      assert.equal(saved?.paymentStatus, "pending");
    });

    it("rejecting a paid order never fakes a refund", async () => {
      const id = (
        await store.seed(
          storedOrder(customerId, { paymentMethod: "ONLINE", paymentStatus: "paid" })
        )
      ).toString();

      const res = await call("reject", id, { reason: "Cannot fulfil" });
      assert.equal(res.status, 200);

      const saved = await store.raw(id);
      assert.equal(saved?.status, "rejected");
      assert.equal(saved?.paymentStatus, "paid");

      const row = toAdminOrder(saved!);
      assert.equal(row.paymentStatus, "paid");
      assert.equal(row.refundUnresolved, true);
    });

    it("legacy PAID order: accepting preserves the payment fact instead of losing it", async () => {
      const id = await store.seed(
        storedOrder(customerId, {
          paymentMethod: "ONLINE",
          status: "PAID",
          paymentStatus: undefined,
          statusHistory: undefined,
          razorpayPaymentId: "pay_legacy",
        })
      );
      // Mongo stores `undefined` as null; remove the keys like a truly old doc.
      if (backend.name.startsWith("real")) {
        await store.orders.updateOne({ _id: id }, { $unset: { paymentStatus: "", statusHistory: "" } });
      }

      const res = await call("accept", id.toString());
      assert.equal(res.status, 200);
      assert.equal((await res.json()).order.paymentStatus, "paid");

      const saved = await store.raw(id);
      assert.equal(saved?.status, "accepted");
      assert.equal(saved?.paymentStatus, "paid");
      assert.equal(saved?.statusHistory?.length, 1);
      assert.equal(saved?.statusHistory?.[0].from, "PAID");
    });

    it("legacy placed / pending_payment orders can be decided", async () => {
      for (const status of ["placed", "pending_payment"]) {
        const id = await store.seed(
          storedOrder(customerId, { status, paymentStatus: undefined, statusHistory: undefined })
        );
        if (backend.name.startsWith("real")) {
          await store.orders.updateOne({ _id: id }, { $unset: { paymentStatus: "", statusHistory: "" } });
        }

        assert.equal((await call("reject", id.toString())).status, 200, status);
        const saved = await store.raw(id);
        assert.equal(saved?.status, "rejected");
        assert.equal(saved?.paymentStatus, "pending");
      }
    });

    it("scenarios 9 & 10: the customer sees the persisted decision, only for their own orders", async () => {
      const mine = (await store.seed(storedOrder(customerId, { orderNumber: "111111" }))).toString();
      const mineRejected = (await store.seed(storedOrder(customerId, { orderNumber: "222222" }))).toString();
      const theirs = (await store.seed(storedOrder(otherCustomerId, { orderNumber: "333333" }))).toString();

      let list = await findOrdersForUser(store.orders, customerId.toString());
      assert.equal(list.length, 2);
      assert.deepEqual(list.map((o) => o.status), ["pending_approval", "pending_approval"]);

      await call("accept", mine);
      await call("reject", mineRejected, { reason: "Address not serviceable" });
      await call("accept", theirs);

      list = await findOrdersForUser(store.orders, customerId.toString());
      const byNumber = Object.fromEntries(list.map((o) => [o.orderNumber, o]));

      assert.equal(list.length, 2);
      assert.equal(byNumber["111111"].status, "accepted");
      assert.equal(byNumber["222222"].status, "rejected");
      assert.equal(byNumber["222222"].rejectionReason, "Address not serviceable");
      assert.equal(byNumber["333333"], undefined);

      // Other customer's order is not reachable by id.
      assert.equal(await findOrderForUser(store.orders, theirs, customerId.toString()), null);
      assert.equal(
        (await findOrderForUser(store.orders, theirs, otherCustomerId.toString()))?.status,
        "accepted"
      );
      assert.equal(await findOrderForUser(store.orders, "bad", customerId.toString()), null);
      assert.deepEqual(await findOrdersForUser(store.orders, "bad"), []);

      // No admin identity ever reaches the customer view.
      assert.equal(JSON.stringify(list).includes("admin@velmori.test"), false);
    });
  });
}
