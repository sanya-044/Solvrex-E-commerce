import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ObjectId } from "mongodb";

import {
  isAwaitingDecision,
  isValidObjectIdString,
  normalizeOrderStatus,
  normalizePaymentStatus,
  parseRejectionReason,
} from "@/lib/order-status";
import { toAdminOrder, toOrder } from "@/lib/order-view";
import type { OrderDocument } from "@/types/order";

import { storedOrder } from "./helpers/orders-store";

const userId = new ObjectId();

function doc(overrides: Record<string, unknown> = {}): OrderDocument {
  return { _id: new ObjectId(), ...storedOrder(userId, overrides) } as OrderDocument;
}

describe("status normalisation & legacy compatibility (scenario 13)", () => {
  it("treats every legacy value as awaiting a decision, never accepted/rejected", () => {
    for (const legacy of ["placed", "pending_payment", "pending", "PAID"]) {
      assert.equal(normalizeOrderStatus(legacy), "pending_approval", legacy);
      assert.equal(isAwaitingDecision(legacy), true, legacy);
    }
  });

  it("never infers approval from PAID, but keeps the payment fact", () => {
    assert.equal(normalizeOrderStatus("PAID"), "pending_approval");
    assert.equal(normalizePaymentStatus(undefined, "PAID"), "paid");
    assert.equal(normalizePaymentStatus(undefined, "placed"), "pending");
    assert.equal(normalizePaymentStatus(undefined, "pending_payment"), "pending");
  });

  it("prefers an explicit paymentStatus over the legacy status", () => {
    assert.equal(normalizePaymentStatus("pending", "accepted"), "pending");
    assert.equal(normalizePaymentStatus("paid", "pending_approval"), "paid");
    assert.equal(normalizePaymentStatus("garbage", "PAID"), "pending");
  });

  it("only treats exact decidable values as decidable", () => {
    for (const value of ["accepted", "rejected", "shipped", "delivered", "cancelled", "processing", "weird", "paid", "", undefined, null, 5]) {
      assert.equal(isAwaitingDecision(value), false, String(value));
    }
  });

  it("keeps supported statuses unchanged and degrades unknown ones safely", () => {
    for (const status of ["accepted", "rejected", "processing", "shipped", "delivered", "cancelled", "pending_approval"]) {
      assert.equal(normalizeOrderStatus(status), status);
    }
    assert.equal(normalizeOrderStatus(undefined), "pending_approval");
    assert.equal(normalizeOrderStatus("???"), "pending_approval");
  });
});

describe("toOrder / toAdminOrder never crash on old or sparse documents", () => {
  it("maps the real stored shape (address/pincode, no tax/currency)", () => {
    const order = toOrder(doc());

    assert.equal(order.status, "pending_approval");
    assert.equal(order.paymentStatus, "pending");
    assert.equal(order.currency, "INR");
    assert.equal(order.tax, 0);
    assert.equal(order.shippingAddress.line1, "12 MG Road");
    assert.equal(order.shippingAddress.postalCode, "411001");
    assert.equal(order.shippingAddress.fullName, "Asha Rao");
    assert.equal(order.items[0].name, "Linen Shirt");
    assert.equal(order.items[0].quantity, 2);
  });

  it("renders legacy statuses without crashing", () => {
    for (const status of ["placed", "pending_payment", "PAID", "pending", "mystery"]) {
      const order = toOrder(
        doc({ status, paymentStatus: undefined, statusHistory: undefined })
      );
      assert.equal(order.status, "pending_approval");
      assert.deepEqual(order.statusHistory, []);
    }

    assert.equal(
      toOrder(doc({ status: "PAID", paymentStatus: undefined })).paymentStatus,
      "paid"
    );
  });

  it("survives a nearly empty document", () => {
    const sparse = { _id: new ObjectId(), userId, status: "placed" } as OrderDocument;
    const order = toOrder(sparse);
    const admin = toAdminOrder(sparse);

    assert.deepEqual(order.items, []);
    assert.equal(order.total, 0);
    assert.ok(Number.isFinite(Date.parse(order.createdAt)));
    assert.equal(admin.canDecide, true);
    assert.equal(admin.legacyStatus, "placed");
  });

  it("does not leak admin identity to customers but does to admins", () => {
    const decided = doc({
      status: "rejected",
      rejectionReason: "Out of stock",
      decisionBy: { adminId: "a1", email: "admin@velmori.test" },
      rejectedAt: new Date(),
    });

    assert.equal(JSON.stringify(toOrder(decided)).includes("admin@velmori.test"), false);
    assert.equal(toAdminOrder(decided).decidedBy, "admin@velmori.test");
    assert.equal(toOrder(decided).rejectionReason, "Out of stock");
  });

  it("flags a paid-then-rejected order as refund unresolved, not refunded", () => {
    const rejectedPaid = doc({ status: "rejected", paymentStatus: "paid" });

    assert.equal(toOrder(rejectedPaid).paymentStatus, "paid");
    assert.equal(toOrder(rejectedPaid).refundUnresolved, true);
    assert.equal(toAdminOrder(rejectedPaid).refundUnresolved, true);
    assert.equal(toOrder(doc({ status: "accepted", paymentStatus: "paid" })).refundUnresolved, false);
  });

  it("only offers decisions for undecided orders", () => {
    assert.equal(toAdminOrder(doc()).canDecide, true);
    for (const status of ["accepted", "rejected", "delivered", "cancelled", "shipped"]) {
      assert.equal(toAdminOrder(doc({ status })).canDecide, false, status);
    }
  });
});

describe("input validation helpers (scenario 8)", () => {
  it("accepts only 24-hex ids", () => {
    assert.equal(isValidObjectIdString(new ObjectId().toString()), true);
    for (const bad of ["", "abc", "not-an-object-id!!!!!!", "aaaaaaaaaaaa", "zzzzzzzzzzzzzzzzzzzzzzzz", 123, null, undefined, {}]) {
      assert.equal(isValidObjectIdString(bad), false, String(bad));
    }
  });

  it("validates the optional rejection reason", () => {
    assert.deepEqual(parseRejectionReason(undefined), { ok: true });
    assert.deepEqual(parseRejectionReason("   "), { ok: true });
    assert.deepEqual(parseRejectionReason("  Out of stock  "), { ok: true, reason: "Out of stock" });
    assert.equal(parseRejectionReason(42).ok, false);
    assert.equal(parseRejectionReason({ a: 1 }).ok, false);
    assert.equal(parseRejectionReason("x".repeat(501)).ok, false);
    assert.equal(parseRejectionReason("x".repeat(500)).ok, true);
  });
});
