import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getOrderByIdForUser } from "@/lib/orders";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

export const metadata = {
  title: "Order Details / FABRICE",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${id}`);
  }

  const order = await getOrderByIdForUser(id, session.user.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-[70vh] bg-[#f5f3ee] px-5 py-16 text-[#0a0a0a] sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/orders"
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black"
        >
          ← All Orders
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
              FABRICE / ORDER #{order.orderNumber}
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-5xl">
              Order Status
            </h1>
            <p className="mt-3 text-xs text-black/40">
              Placed{" "}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* Status timeline */}
        <div className="mt-12 border border-black/10 px-6 py-8">
          <OrderStatusTimeline status={order.status} />

          {order.trackingNumber && (
            <div className="mt-8 flex flex-col gap-1 border-t border-black/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-black/50">
                Tracking number{" "}
                <span className="font-bold text-black">
                  {order.trackingNumber}
                </span>
              </p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold uppercase tracking-[0.2em] underline underline-offset-4"
                >
                  Track Package
                </a>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mt-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Items
          </p>
          <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
            {order.items.map((item, i) => (
              <div
                key={`${item.productId}-${i}`}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.04em]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-black/40">
                    {[
                      item.size && `Size ${item.size}`,
                      item.color,
                      `Qty ${item.quantity}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {order.currency} {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals + shipping address */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
              Shipping Address
            </p>
            <div className="mt-4 space-y-0.5 text-sm text-black/70">
              <p className="font-bold text-black">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
              Summary
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>
                  {order.currency} {order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Shipping</span>
                <span>
                  {order.currency} {order.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Tax</span>
                <span>
                  {order.currency} {order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 font-bold">
                <span>Total</span>
                <span>
                  {order.currency} {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
