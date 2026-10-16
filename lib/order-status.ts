import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/types/order";

/**
 * Stored status values that mean "no admin decision has been made yet".
 *
 * `pending_approval` is the current value. The others were written by earlier
 * versions of checkout / payment verification:
 *   - `placed`           COD order
 *   - `pending_payment`  online order, payment not yet verified
 *   - `PAID`             online order, payment verified
 *   - `pending`          earlier tracking-page model
 *
 * None of them implies acceptance or rejection. Matching is exact (and
 * case-sensitive) on purpose so unknown values are never treated as decidable.
 */
export const DECIDABLE_STORED_STATUSES: readonly string[] = [
  "pending_approval",
  "placed",
  "pending_payment",
  "pending",
  "PAID",
];

const ORDER_STATUS_SET: ReadonlySet<string> = new Set(ORDER_STATUSES);
const PAYMENT_STATUS_SET: ReadonlySet<string> = new Set(PAYMENT_STATUSES);

/** True when the stored status is awaiting an admin decision. */
export function isAwaitingDecision(storedStatus: unknown): boolean {
  return (
    typeof storedStatus === "string" &&
    DECIDABLE_STORED_STATUSES.includes(storedStatus)
  );
}

/**
 * Map any stored status (including legacy values) to a supported
 * OrderStatus without crashing. Legacy "awaiting" values and unknown values
 * both resolve to `pending_approval`: no decision has been recorded.
 */
export function normalizeOrderStatus(storedStatus: unknown): OrderStatus {
  if (typeof storedStatus === "string" && ORDER_STATUS_SET.has(storedStatus)) {
    return storedStatus as OrderStatus;
  }

  return "pending_approval";
}

/**
 * Resolve the payment status of a stored order.
 *
 * Uses `paymentStatus` when present. Otherwise falls back to the legacy
 * convention where the order status itself carried `PAID`. This never
 * infers approval from payment.
 */
export function normalizePaymentStatus(
  storedPaymentStatus: unknown,
  storedStatus?: unknown
): PaymentStatus {
  if (
    typeof storedPaymentStatus === "string" &&
    PAYMENT_STATUS_SET.has(storedPaymentStatus)
  ) {
    return storedPaymentStatus as PaymentStatus;
  }

  if (storedPaymentStatus === undefined && storedStatus === "PAID") {
    return "paid";
  }

  return "pending";
}

export function normalizePaymentMethod(value: unknown): PaymentMethod {
  return typeof value === "string" && value.toUpperCase() === "ONLINE"
    ? "ONLINE"
    : "COD";
}

/** Strict 24-hex check. `ObjectId.isValid` also accepts any 12-char string. */
export function isValidObjectIdString(value: unknown): value is string {
  return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

export const MAX_REJECTION_REASON_LENGTH = 500;

export type ReasonParseResult =
  | { ok: true; reason?: string }
  | { ok: false; message: string };

/**
 * Validate the optional rejection reason from an untrusted request body.
 * An absent / empty reason is valid; a non-string or over-long one is not.
 */
export function parseRejectionReason(input: unknown): ReasonParseResult {
  if (input === undefined || input === null) {
    return { ok: true };
  }

  if (typeof input !== "string") {
    return { ok: false, message: "Rejection reason must be text." };
  }

  const reason = input.trim();

  if (!reason) {
    return { ok: true };
  }

  if (reason.length > MAX_REJECTION_REASON_LENGTH) {
    return {
      ok: false,
      message: `Rejection reason must be ${MAX_REJECTION_REASON_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, reason };
}
