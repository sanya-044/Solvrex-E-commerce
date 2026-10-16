"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

import { submitOrderDecision } from "@/lib/order-decision-client";
import type { OrderDecisionAction } from "@/types/order";

const MAX_REASON_LENGTH = 500;

type Feedback = { type: "success" | "error"; text: string };

export default function OrderDecisionActions({
  orderId,
  orderNumber,
  canDecide,
}: {
  orderId: string;
  orderNumber: string;
  canDecide: boolean;
}) {
  const router = useRouter();

  const [pending, setPending] = useState<OrderDecisionAction | null>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Set once the backend confirms a decision so the buttons never reappear
  // while the server-rendered row is refreshing.
  const [decided, setDecided] = useState(false);

  const actionable = canDecide && !decided;
  const busy = pending !== null;

  async function decide(action: OrderDecisionAction) {
    // Guard against double clicks while a request is in flight.
    if (busy) return;

    setPending(action);
    setFeedback(null);

    const outcome = await submitOrderDecision(
      orderId,
      action,
      action === "reject" ? reason.trim() : undefined
    );

    setPending(null);

    if (outcome.ok) {
      setDecided(true);
      setConfirmingReject(false);
      setReason("");
      setFeedback({ type: "success", text: outcome.message });
    } else {
      setFeedback({ type: "error", text: outcome.message });
    }

    // Re-read the persisted state from MongoDB. This also corrects the row
    // after a 409 (e.g. another admin already decided this order).
    router.refresh();
  }

  return (
    <div className="w-[190px] space-y-2" data-order-id={orderId}>
      {actionable && !confirmingReject && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            id={`accept-order-${orderId}`}
            disabled={busy}
            onClick={() => decide("accept")}
            className="flex h-9 items-center justify-center gap-2 bg-[#26231f] px-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "accept" ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Accepting…
              </>
            ) : (
              <>
                <Check size={12} />
                Accept Order
              </>
            )}
          </button>

          <button
            type="button"
            id={`reject-order-${orderId}`}
            disabled={busy}
            onClick={() => {
              setFeedback(null);
              setConfirmingReject(true);
            }}
            className="flex h-9 items-center justify-center gap-2 border border-red-700 px-3 text-[8px] font-bold uppercase tracking-[0.18em] text-red-800 transition-colors hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={12} />
            Reject Order
          </button>
        </div>
      )}

      {actionable && confirmingReject && (
        <div
          role="alertdialog"
          aria-label={`Confirm rejection of order ${orderNumber}`}
          className="space-y-2 border border-red-700/40 bg-red-50 p-3"
        >
          <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.12em] text-red-800">
            Reject order #{orderNumber}?
          </p>
          <p className="text-[9px] leading-4 text-black/50">
            The customer will see this order as rejected. This cannot be
            undone.
          </p>

          <label
            htmlFor={`reject-reason-${orderId}`}
            className="block text-[8px] uppercase tracking-[0.15em] text-black/40"
          >
            Reason (optional, shown to customer)
          </label>
          <textarea
            id={`reject-reason-${orderId}`}
            value={reason}
            maxLength={MAX_REASON_LENGTH}
            disabled={busy}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none border border-black/15 bg-white px-2 py-1.5 text-[10px] outline-none focus:border-black disabled:opacity-60"
          />

          <div className="flex gap-2">
            <button
              type="button"
              id={`confirm-reject-order-${orderId}`}
              disabled={busy}
              onClick={() => decide("reject")}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 bg-red-700 px-2 text-[8px] font-bold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === "reject" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Rejecting…
                </>
              ) : (
                "Confirm Reject"
              )}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingReject(false)}
              className="h-8 border border-black/20 px-2 text-[8px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`border px-2 py-1.5 text-[9px] leading-4 ${
            feedback.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-600/40 bg-green-50 text-green-800"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {!actionable && !feedback && (
        <p className="text-[9px] uppercase tracking-[0.15em] text-black/30">
          No action needed
        </p>
      )}
    </div>
  );
}
