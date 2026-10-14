import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/types/order";

const TONES: Record<OrderStatus, { chip: string; dot: string }> = {
  pending_approval: {
    chip: "border-amber-500 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  accepted: {
    chip: "border-green-600 bg-green-50 text-green-800",
    dot: "bg-green-600",
  },
  rejected: {
    chip: "border-red-600 bg-red-50 text-red-800",
    dot: "bg-red-600",
  },
  processing: {
    chip: "border-sky-600 bg-sky-50 text-sky-800",
    dot: "bg-sky-600",
  },
  shipped: {
    chip: "border-indigo-600 bg-indigo-50 text-indigo-800",
    dot: "bg-indigo-600",
  },
  delivered: {
    chip: "border-green-700 bg-green-100 text-green-900",
    dot: "bg-green-700",
  },
  cancelled: {
    chip: "border-red-900/30 bg-red-900/[0.03] text-red-900/70",
    dot: "bg-red-900/60",
  },
};

export default function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const tone = TONES[status];

  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] ${tone.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
