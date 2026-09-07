import clientPromise from "@/lib/mongodb";

export default async function AdminOrdersPage() {
  const client = await clientPromise;
  const db = client.db("fabrice");

  const orders = await db
    .collection("orders")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

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
              View customer orders and order information.
            </p>
          </div>

          <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
            {orders.length}{" "}
            {orders.length === 1 ? "Order" : "Orders"}
          </p>
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
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Order
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Items
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Total
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const orderItems = Array.isArray(
                    order.items
                  )
                    ? order.items
                    : [];

                  const itemCount = orderItems.reduce(
                    (
                      total: number,
                      item: {
                        quantity?: number;
                      }
                    ) =>
                      total +
                      Number(item.quantity || 0),
                    0
                  );

                  return (
                    <tr
                      key={order._id.toString()}
                      className="border-b border-black/10 last:border-b-0"
                    >
                      {/* ORDER ID */}
                      <td className="px-5 py-5">
                        <p className="max-w-[150px] truncate text-[9px] font-medium">
                          {order._id.toString()}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase">
                            {order.customer?.name ||
                              "—"}
                          </p>

                          <p className="mt-1 text-[9px] text-black/45">
                            {order.customer?.email ||
                              "—"}
                          </p>

                          <p className="mt-1 text-[9px] text-black/45">
                            {order.customer?.phone ||
                              "—"}
                          </p>
                        </div>
                      </td>

                      {/* ITEMS */}
                      <td className="px-5 py-5">
                        <div className="max-w-[220px]">
                          {orderItems.map(
                            (
                              item: {
                                name?: string;
                                size?: string;
                                quantity?: number;
                              },
                              index: number
                            ) => (
                              <p
                                key={`${item.name}-${item.size}-${index}`}
                                className="text-[9px] leading-5"
                              >
                                {item.name || "Product"}
                                {" · "}
                                {item.size || "—"}
                                {" × "}
                                {item.quantity || 0}
                              </p>
                            )
                          )}

                          <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-black/35">
                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}
                          </p>
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="px-5 py-5">
                        <p className="text-sm font-bold">
                          ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-5 py-5">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em]">
                          {order.paymentMethod ||
                            "COD"}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-5">
                        <span className="inline-flex border border-black/15 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.15em]">
                          {order.status || "placed"}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-5">
                        <p className="whitespace-nowrap text-[9px] text-black/55">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-[8px] text-black/35">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}