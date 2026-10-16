"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const items = useCartStore(
    (state) => state.items
  );

  const updateQuantity = useCartStore(
    (state) => state.updateQuantity
  );

  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );

  const getSubtotal = useCartStore(
    (state) => state.getSubtotal
  );

  const subtotal = getSubtotal();

  const shipping =
    subtotal >= 599 || subtotal === 0
      ? 0
      : 49;

  const total = subtotal + shipping;

  /* =====================================
     EMPTY CART
  ===================================== */

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#f7f6f2] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto flex min-h-[55vh] max-w-[1600px] items-center justify-center">

          <div className="text-center">

            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
              VELMORI / BAG
            </p>

            <h1 className="text-5xl font-black uppercase tracking-[-0.07em] sm:text-7xl">
              Your Bag Is Empty
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/50">
              Looks like you haven&apos;t added
              anything yet. Explore the latest
              pieces and find something that
              feels like you.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/80"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /* =====================================
     CART
  ===================================== */

  return (
    <main className="bg-[#f7f6f2]">

      {/* =================================
          HEADER
      ================================= */}

      <section className="border-b border-black/10 px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pb-14 lg:pt-24">
        <div className="mx-auto max-w-[1600px]">

          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
            VELMORI / BAG
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-[8rem]">
              Your Bag
            </h1>

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              {items.reduce(
                (total, item) =>
                  total + item.quantity,
                0
              )}{" "}
              Items
            </p>

          </div>

        </div>
      </section>

      {/* =================================
          CONTENT
      ================================= */}

      <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">

        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">

          {/* =================================
              ITEMS
          ================================= */}

          <div>

            <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">

              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Your Items
              </span>

              <Link
                href="/shop"
                className="text-[9px] uppercase tracking-[0.15em] underline underline-offset-4"
              >
                Continue Shopping
              </Link>

            </div>

            <div className="divide-y divide-black/10">

              {items.map((item) => (
                <article
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 py-6 sm:gap-6"
                >

                  {/* IMAGE */}

                  <Link
                    href={`/product/${item.product.id}`}
                    className="h-36 w-28 shrink-0 overflow-hidden bg-[#e9e6df] sm:h-48 sm:w-36"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>

                  {/* INFO */}

                  <div className="flex min-w-0 flex-1 flex-col justify-between">

                    <div>

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-black/40">
                            {item.product.category}
                          </p>

                          <Link
                            href={`/product/${item.product.id}`}
                            className="text-sm font-bold uppercase tracking-[-0.02em] hover:opacity-60 sm:text-base"
                          >
                            {item.product.name}
                          </Link>

                        </div>

                        <span className="shrink-0 text-sm font-bold">
                          ₹
                          {(
                            item.product.price *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-black/45">
                        Size: {item.size}
                      </p>

                    </div>

                    {/* QUANTITY */}

                    <div className="mt-5 flex items-center justify-between">

                      <div className="flex h-9 items-center border border-black/15">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="flex h-full w-9 items-center justify-center hover:bg-black/5"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>

                        <span className="w-8 text-center text-xs">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="flex h-full w-9 items-center justify-center hover:bg-black/5"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.product.id,
                            item.size
                          )
                        }
                        className="flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-black/40 transition-colors hover:text-black"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>

                    </div>

                  </div>

                </article>
              ))}

            </div>

          </div>

          {/* =================================
              ORDER SUMMARY
          ================================= */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">

            <div className="border border-black/10 bg-white p-6 sm:p-8">

              <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.2em]">
                Order Summary
              </p>

              {/* SUBTOTAL */}

              <div className="flex items-center justify-between border-b border-black/10 pb-4">

                <span className="text-sm text-black/55">
                  Subtotal
                </span>

                <span className="text-sm font-medium">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex items-center justify-between border-b border-black/10 py-4">

                <span className="text-sm text-black/55">
                  Shipping
                </span>

                <span className="text-sm font-medium">
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping}`}
                </span>

              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between py-5">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Total
                </span>

                <span className="text-xl font-bold">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              {/* CHECKOUT */}

              <Link
                href="/checkout"
                className="flex h-14 items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/80"
              >
                Proceed to Checkout
              </Link>

              {/* NOTE */}

              <p className="mt-5 text-center text-[9px] uppercase leading-5 tracking-[0.12em] text-black/35">
                Free shipping on orders above ₹599
              </p>

            </div>

            {/* BACK TO SHOP */}

            <Link
              href="/shop"
              className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/45 hover:text-black"
            >
              <ArrowLeft size={13} />
              Continue Shopping
            </Link>

          </aside>

        </div>

      </section>

    </main>
  );
}