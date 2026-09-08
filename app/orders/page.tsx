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
          <div className="mt-14 border border-black/15 px-6 py-14 text-center">
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
          <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-col gap-4 py-6 transition-colors hover:bg-black/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">
                    Order #{order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-black/40">
                    Placed{" "}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" · "}
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:flex-row-reverse">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-bold">
                    {order.currency} {order.total.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
