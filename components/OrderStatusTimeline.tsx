import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@/types/order";

export default function OrderStatusTimeline({
  status,
}: {
  status: OrderStatus;
}) {
  if (status === "cancelled") {
    return (
      <div className="border border-red-900/20 bg-red-900/[0.03] px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-900/70">
          Order Cancelled
        </p>
        <p className="mt-1 text-sm text-black/50">
          This order was cancelled and is no longer being processed.
        </p>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

  return (
    <div className="flex w-full items-start">
      {ORDER_STATUS_SEQUENCE.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === ORDER_STATUS_SEQUENCE.length - 1;

        return (
          <div
            key={step}
            className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                  reached
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black/30"
                }`}
              >
                {reached ? "✓" : i + 1}
              </div>
              <p
                className={`mt-2 w-20 text-center text-[8px] font-bold uppercase tracking-[0.15em] ${
                  reached ? "text-black" : "text-black/30"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
            </div>

            {!isLast && (
              <div
                className={`mx-2 mb-6 h-px flex-1 ${
                  i < currentIndex ? "bg-black" : "bg-black/15"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
