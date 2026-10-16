import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import type { Order } from "@/types/order";
import { ORDER_STATUS_MESSAGES } from "@/types/order";

type TrackingOrder = Pick<
  Order,
  | "status"
  | "paymentStatus"
  | "paymentMethod"
  | "rejectionReason"
  | "refundUnresolved"
  | "acceptedAt"
  | "rejectedAt"
>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Persisted order status for the customer: approval/fulfilment state with a
 * plain-language message, progress timeline, and (separately) payment state.
 * Renders purely from props, so it always reflects what MongoDB returned.
 */
export default function OrderTrackingStatus({
  order,
}: {
  order: TrackingOrder;
}) {
  const { status } = order;
  const isTerminalNegative = status === "rejected" || status === "cancelled";

  return (
    <section
      aria-label="Order status"
      data-order-status={status}
      className={`mb-6 border p-5 sm:p-6 ${
        status === "rejected"
          ? "border-red-600/30 bg-red-50/60"
          : status === "accepted"
            ? "border-green-600/30 bg-green-50/50"
            : status === "pending_approval"
              ? "border-amber-500/40 bg-amber-50/50"
              : "border-black/10 bg-white/60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Order Status
          </p>
          <div className="mt-2">
            <OrderStatusBadge status={status} />
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            {order.paymentMethod === "ONLINE"
              ? "Online Payment"
              : "Cash on Delivery"}
          </p>
          <div className="mt-2">
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-[#26231f]">
        {ORDER_STATUS_MESSAGES[status]}
      </p>

      {status === "rejected" && order.rejectionReason && (
        <p className="mt-2 text-sm text-black/70">
          <span className="font-bold">Reason:</span> {order.rejectionReason}
        </p>
      )}

      {order.refundUnresolved && (
        <p className="mt-3 border-l-2 border-red-600 pl-3 text-xs leading-5 text-black/60">
          Your payment was received before this order was rejected. A refund
          has not been issued yet — please contact support about your refund.
        </p>
      )}

      {status === "accepted" && order.acceptedAt && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-black/40">
          Accepted on {formatDate(order.acceptedAt)}
        </p>
      )}

      {status === "rejected" && order.rejectedAt && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-black/40">
          Rejected on {formatDate(order.rejectedAt)}
        </p>
      )}

      {!isTerminalNegative && (
        <div className="mt-6 pb-1">
          <OrderStatusTimeline status={status} />
        </div>
      )}
    </section>
  );
}
