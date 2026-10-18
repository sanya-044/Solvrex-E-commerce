import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ObjectId } from "mongodb";
import { renderToStaticMarkup } from "react-dom/server";

import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTrackingStatus from "@/components/OrderTrackingStatus";
import { submitOrderDecision } from "@/lib/order-decision-client";
import { toOrder } from "@/lib/order-view";
import type { OrderDocument } from "@/types/order";

import { storedOrder } from "./helpers/orders-store";

function render(overrides: Record<string, unknown>) {
  const order = toOrder({
    _id: new ObjectId(),
    ...storedOrder(new ObjectId(), overrides),
  } as OrderDocument);

  return renderToStaticMarkup(<OrderTrackingStatus order={order} />);
}

describe("scenario 14: customer tracking view", () => {
  it("renders pending approval", () => {
    const html = render({});

    assert.match(html, /data-order-status="pending_approval"/);
    assert.match(html, /Pending Approval/);
    assert.match(html, /Your order has been received and is awaiting confirmation\./);
    assert.match(html, /Cash on Delivery/);
    assert.match(html, /Payment Pending/);
    assert.match(html, /aria-label="Order progress"/);
  });

  it("renders accepted with its date", () => {
    const html = render({
      status: "accepted",
      acceptedAt: new Date("2026-02-03T00:00:00Z"),
    });

    assert.match(html, /data-order-status="accepted"/);
    assert.match(html, /Your order has been accepted\./);
    assert.match(html, /Accepted on/);
    assert.doesNotMatch(html, /rejected/i);
  });

  it("renders rejected with the admin's reason, and no progress timeline", () => {
    const html = render({
      status: "rejected",
      rejectionReason: "Out of stock",
      rejectedAt: new Date("2026-02-03T00:00:00Z"),
    });

    assert.match(html, /data-order-status="rejected"/);
    assert.match(html, /Your order request was rejected\./);
    assert.match(html, /Reason:<\/span> Out of stock/);
    assert.doesNotMatch(html, /Order progress/);
  });

  it("omits the reason line when none was given", () => {
    assert.doesNotMatch(render({ status: "rejected" }), /Reason:/);
  });

  it("escapes the rejection reason", () => {
    const html = render({ status: "rejected", rejectionReason: "<script>alert(1)</script>" });

    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
  });

  it("shows unresolved refund instead of claiming a refund for a paid, rejected order", () => {
    const html = render({ status: "rejected", paymentStatus: "paid", paymentMethod: "ONLINE" });

    assert.match(html, /refund/i);
    assert.match(html, /has not been issued/);
    assert.doesNotMatch(html, />Refunded</);
  });

  it("renders fulfilment and cancelled states", () => {
    assert.match(render({ status: "processing" }), /Your order is being prepared\./);
    assert.match(render({ status: "shipped" }), /Your order has shipped\./);
    assert.match(render({ status: "delivered" }), /Your order has been delivered\./);
    assert.match(render({ status: "cancelled" }), /cancelled/i);
  });

  it("renders legacy records (placed / pending_payment / PAID) as awaiting confirmation", () => {
    for (const status of ["placed", "pending_payment", "PAID"]) {
      const html = render({ status, paymentStatus: undefined });
      assert.match(html, /awaiting confirmation/, status);
    }

    // PAID shows as paid, but is NOT accepted.
    const paid = render({ status: "PAID", paymentStatus: undefined });
    assert.match(paid, />Paid</);
    assert.doesNotMatch(paid, /has been accepted/);
  });

  it("badge shows a distinct label per status", () => {
    assert.match(renderToStaticMarkup(<OrderStatusBadge status="pending_approval" />), /Pending Approval/);
    assert.match(renderToStaticMarkup(<OrderStatusBadge status="accepted" />), /Accepted/);
    assert.match(renderToStaticMarkup(<OrderStatusBadge status="rejected" />), /Rejected/);
  });
});

function fakeFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return handler(String(input), init);
  }) as typeof fetch;

  return { impl, calls };
}

describe("scenario 15: admin decision client (errors / confirmed success)", () => {
  it("reports success only when the API confirms the new status", async () => {
    const { impl, calls } = fakeFetch(() =>
      Response.json({ message: "Order accepted successfully.", order: { id: "1", status: "accepted" } })
    );

    const outcome = await submitOrderDecision("abc", "accept", undefined, impl);

    assert.deepEqual(outcome, { ok: true, status: "accepted", message: "Order accepted successfully." });
    assert.equal(calls[0].url, "/api/admin/orders/abc/accept");
    assert.equal(calls[0].init?.method, "PATCH");
    assert.equal(calls[0].init?.body, undefined);
  });

  it("sends the optional reason only when rejecting", async () => {
    const { impl, calls } = fakeFetch(() =>
      Response.json({ message: "Order rejected successfully.", order: { status: "rejected" } })
    );

    assert.equal((await submitOrderDecision("abc", "reject", "Out of stock", impl)).ok, true);
    assert.equal(calls[0].url, "/api/admin/orders/abc/reject");
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { reason: "Out of stock" });

    await submitOrderDecision("abc", "reject", "", impl);
    assert.deepEqual(JSON.parse(String(calls[1].init?.body)), {});
  });

  it("surfaces API errors instead of pretending success", async () => {
    const conflict = fakeFetch(() =>
      Response.json({ message: "This order has already been accepted." }, { status: 409 })
    );
    assert.deepEqual(await submitOrderDecision("abc", "reject", "", conflict.impl), {
      ok: false,
      message: "This order has already been accepted.",
    });

    const unauthorized = fakeFetch(() => Response.json({ message: "Unauthorized." }, { status: 401 }));
    assert.equal((await submitOrderDecision("abc", "accept", undefined, unauthorized.impl)).ok, false);
  });

  it("does not claim success on a 200 that lacks the expected status", async () => {
    for (const body of [{}, { order: { status: "rejected" } }, { message: "ok" }]) {
      const { impl } = fakeFetch(() => Response.json(body));
      assert.equal((await submitOrderDecision("abc", "accept", undefined, impl)).ok, false);
    }
  });

  it("handles non-JSON error bodies and network failures", async () => {
    const html = fakeFetch(() => new Response("<html>Bad gateway</html>", { status: 502 }));
    const a = await submitOrderDecision("abc", "accept", undefined, html.impl);
    assert.equal(a.ok, false);
    assert.match(a.message, /502/);

    const offline = fakeFetch(() => {
      throw new TypeError("fetch failed");
    });
    const b = await submitOrderDecision("abc", "accept", undefined, offline.impl);
    assert.equal(b.ok, false);
    assert.match(b.message, /not updated/i);
  });
});
