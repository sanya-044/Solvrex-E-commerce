import OrderDecisionActions from "@/components/OrderDecisionActions";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { getOrdersCollection } from "@/lib/orders-db";
import { toAdminOrder } from "@/lib/order-view";

// Decisions are persisted in MongoDB; never serve a cached table.
export const dynamic = "force-dynamic";

const HEADERS = [
  "Order",
  "Customer",
  "Items",
  "Total",
  "Payment",
  "Status",
  "Date",
  "Actions",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const collection = await getOrdersCollection();

  const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();

  const orders = docs.map(toAdminOrder);
  const awaitingCount = orders.filter((order) => order.canDecide).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
          Management
        </p>

        <div className="mt-2 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.05em]">
              Orders
            </h1>

            <p className="mt-2 text-xs text-black/45">
              Review customer orders and accept or reject them.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </p>

            {awaitingCount > 0 && (
              <p className="mt-2 inline-flex items-center gap-2 border border-amber-500 bg-amber-50 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-amber-800">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                {awaitingCount} awaiting approval
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-hidden border border-black/10 bg-white">
        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  {HEADERS.map((header) => (
                    <th
                      key={header}
                      className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    data-order-id={order.id}
                    data-order-status={order.status}
                    className={`border-b border-black/10 align-top last:border-b-0 ${
                      order.canDecide ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* ORDER */}
                    <td className="relative px-5 py-5">
                      {order.canDecide && (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1 bg-amber-500"
                        />
                      )}
                      <p className="text-[10px] font-bold uppercase">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 max-w-[140px] truncate text-[9px] text-black/40">
                        {order.id}
                      </p>
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-5 py-5">
                      <p className="text-[10px] font-bold uppercase">
                        {order.customer.name || "—"}
                      </p>
                      <p className="mt-1 text-[9px] text-black/45">
                        {order.customer.email || "—"}
                      </p>
                      <p className="mt-1 text-[9px] text-black/45">
                        {order.customer.phone || "—"}
                      </p>
                    </td>

                    {/* ITEMS */}
                    <td className="px-5 py-5">
                      <div className="max-w-[220px]">
                        {order.items.map((item, index) => (
                          <p
                            key={`${item.name}-${item.size}-${index}`}
                            className="text-[9px] leading-5"
                          >
                            {item.name}
                            {" · "}
                            {item.size || "—"}
                            {" × "}
                            {item.quantity}
                          </p>
                        ))}

                        <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-black/35">
                          {order.itemCount}{" "}
                          {order.itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </td>

                    {/* TOTAL */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-bold">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* PAYMENT */}
                    <td className="px-5 py-5">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em]">
                        {order.paymentMethod}
                      </p>
                      <div className="mt-2">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-5">
                      <div className="flex max-w-[200px] flex-col items-start gap-2">
                        <OrderStatusBadge status={order.status} />

                        {order.canDecide && (
                          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-amber-800">
                            Action required
                          </span>
                        )}

                        {order.legacyStatus && order.canDecide && (
                          <span className="text-[8px] uppercase tracking-[0.12em] text-black/30">
                            Legacy: {order.legacyStatus}
                          </span>
                        )}

                        {(order.acceptedAt || order.rejectedAt) && (
                          <p className="text-[8px] leading-4 text-black/40">
                            {order.acceptedAt ? "Accepted" : "Rejected"}{" "}
                            {formatDate(
                              (order.acceptedAt ?? order.rejectedAt) as string
                            )}
                            {order.decidedBy ? ` by ${order.decidedBy}` : ""}
                          </p>
                        )}

                        {order.rejectionReason && (
                          <p className="text-[9px] leading-4 text-black/55">
                            Reason: {order.rejectionReason}
                          </p>
                        )}

                        {order.refundUnresolved && (
                          <p className="border border-red-300 bg-red-50 px-2 py-1 text-[8px] font-bold uppercase leading-4 tracking-[0.1em] text-red-700">
                            Paid · refund unresolved
                          </p>
                        )}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-5">
                      <p className="whitespace-nowrap text-[9px] text-black/55">
                        {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-1 whitespace-nowrap text-[8px] text-black/35">
                        {formatTime(order.createdAt)}
                      </p>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-5">
                      <OrderDecisionActions
                        orderId={order.id}
                        orderNumber={order.orderNumber}
                        canDecide={order.canDecide}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}