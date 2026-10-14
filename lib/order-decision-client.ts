import type { OrderDecisionAction, OrderStatus } from "@/types/order";

export type DecisionOutcome =
  | { ok: true; message: string; status: OrderStatus }
  | { ok: false; message: string };

const EXPECTED_STATUS: Record<OrderDecisionAction, OrderStatus> = {
  accept: "accepted",
  reject: "rejected",
};

/**
 * Call the real admin endpoint and report success ONLY when the backend
 * confirms the persisted status. Everything else is surfaced as an error.
 */
export async function submitOrderDecision(
  orderId: string,
  action: OrderDecisionAction,
  reason?: string,
  fetchImpl: typeof fetch = fetch
): Promise<DecisionOutcome> {
  let response: Response;

  try {
    response = await fetchImpl(
      `/api/admin/orders/${encodeURIComponent(orderId)}/${action}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body:
          action === "reject"
            ? JSON.stringify(reason ? { reason } : {})
            : undefined,
      }
    );
  } catch {
    return {
      ok: false,
      message: "Network error. The order was not updated.",
    };
  }

  let data: {
    message?: unknown;
    order?: { status?: unknown };
  } = {};

  try {
    data = await response.json();
  } catch {
    // Non-JSON body: handled below via status code.
  }

  const serverMessage =
    typeof data.message === "string" ? data.message : undefined;

  if (!response.ok) {
    return {
      ok: false,
      message:
        serverMessage ?? `Request failed (HTTP ${response.status}).`,
    };
  }

  const expected = EXPECTED_STATUS[action];

  if (data.order?.status !== expected) {
    return {
      ok: false,
      message: "The server did not confirm the update. Refresh and check.",
    };
  }

  return {
    ok: true,
    status: expected,
    message:
      serverMessage ??
      (action === "accept" ? "Order accepted." : "Order rejected."),
  };
}
