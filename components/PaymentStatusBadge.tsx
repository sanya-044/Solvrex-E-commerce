import type { PaymentStatus } from "@/types/order";
import { PAYMENT_STATUS_LABELS } from "@/types/order";

const TONES: Record<PaymentStatus, string> = {
  pending: "text-amber-800",
  paid: "text-green-800",
  failed: "text-red-800",
  refunded: "text-sky-800",
};

export default function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  return (
    <span
      data-payment-status={status}
      className={`text-[8px] font-bold uppercase tracking-[0.15em] ${TONES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
