 import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getOrdersByUserId } from "@/lib/orders";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export const metadata = {
  title: "Your Orders / FABRICE",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await getOrdersByUserId(session.user.id);

  return (
    <main className="min-h-[70vh] bg-[#f5f3ee] px-5 py-16 text-[#0a0a0a] sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
          FABRICE / ACCOUNT
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.85] tracking-[-0.06em] sm:text-6xl">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="mt-14 border border-black/15 px-6 py-14 text-center bg-white/50">
            <p className="text-sm text-black/50">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-black px-7 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-black/15 bg-white p-6 sm:p-8 transition-all hover:border-black"
              >
                {/* Order Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 mb-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                      Order Number
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wide mt-1">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                      Status
                    </p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                      Total
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {order.currency} {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Items ({order.items.length})
                  </p>
                  <div className="divide-y divide-black/5">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {item.image || item.img || item.imageUrl ? (
                            <div className="relative h-16 w-12 flex-shrink-0 bg-neutral-100 border border-black/10 overflow-hidden">
                              {/* Using a standard HTML img tag to avoid domain config constraints */}
                              <img
                                src={item.image || item.img || item.imageUrl}
                                alt={item.name || "Product image"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : null}
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide">
                              {item.name || item.title || "Product"}
                            </p>
                            <p className="text-[11px] text-black/50 mt-0.5">
                              Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ""} {item.color ? `· Color: ${item.color}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-bold">
                          {order.currency} {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer details & details link */}
                <div className="mt-6 pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-black/50">
                  <span>
                    Placed on: {new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-bold text-black underline hover:text-neutral-600"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}