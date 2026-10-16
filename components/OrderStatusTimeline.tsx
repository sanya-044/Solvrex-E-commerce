import type { OrderStatus } from "@/types/order";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_MESSAGES,
  ORDER_STATUS_SEQUENCE,
} from "@/types/order";

export default function OrderStatusTimeline({
  status,
  rejectionReason,
}: {
  status: OrderStatus;
  rejectionReason?: string;
}) {
  if (status === "cancelled") {
    return (
      <div className="border border-red-900/20 bg-red-900/[0.03] px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-900/70">
          Order Cancelled
        </p>
        <p className="mt-1 text-sm text-black/50">
          {ORDER_STATUS_MESSAGES.cancelled}
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="border border-red-900/20 bg-red-900/[0.03] px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-900/70">
          Order Rejected
        </p>
        <p className="mt-1 text-sm text-black/50">
          {ORDER_STATUS_MESSAGES.rejected}
        </p>
        {rejectionReason && (
          <p className="mt-2 text-sm text-black/70">
            <span className="font-bold">Reason:</span> {rejectionReason}
          </p>
        )}
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

  return (
    <ol className="flex w-full items-start" aria-label="Order progress">
      {ORDER_STATUS_SEQUENCE.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === ORDER_STATUS_SEQUENCE.length - 1;

        return (
          <li
            key={step}
            aria-current={i === currentIndex ? "step" : undefined}
            className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                  reached
                    ? "border-black bg-[#26231f] text-white"
                    : "border-black/20 text-black/30"
                }`}
              >
                {reached ? "✓" : i + 1}
              </div>
              {/* Label is wider than the 24px circle; negative margins keep
                  the step footprint at circle width so 5 steps fit on mobile. */}
              <p
                className={`mt-2 -mx-6 w-[4.5rem] text-center text-[8px] font-bold uppercase leading-3 tracking-[0.12em] sm:-mx-7 sm:w-20 sm:tracking-[0.15em] ${
                  reached ? "text-black" : "text-black/30"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
            </div>

            {!isLast && (
              <div
                className={`mx-2 mb-8 h-px flex-1 ${
                  i < currentIndex ? "bg-[#26231f]" : "bg-[#26231f]/15"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
