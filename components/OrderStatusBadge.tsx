import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/types/order";

export default function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const isCancelled = status === "cancelled";

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] ${
        isCancelled
          ? "border-red-900/30 text-red-900/70"
          : "border-black/20 text-black/70"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isCancelled ? "bg-red-900/60" : "bg-black"
        }`}
      />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
