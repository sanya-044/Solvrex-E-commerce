"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";

import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const items = useWishlistStore(
    (state) => state.items
  );

  const removeFromWishlist =
    useWishlistStore(
      (state) => state.removeFromWishlist
    );

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f6f2] px-5">
        <div className="text-center">

          <Heart
            size={28}
            strokeWidth={1.2}
            className="mx-auto mb-7"
          />

          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
            VELMORI / WISHLIST
          </p>

          <h1 className="text-5xl font-black uppercase tracking-[-0.07em]">
            Nothing Saved
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/50">
            Save the pieces you love and
            come back to them whenever you&apos;re
            ready.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            Explore Collection
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f6f2]">

      <section className="border-b border-black/10 px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pb-14 lg:pt-24">
        <div className="mx-auto max-w-[1600px]">

          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
            VELMORI / WISHLIST
          </p>

          <div className="flex items-end justify-between gap-5">

            <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-[8rem]">
              Saved
            </h1>

            <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              {items.length} Items
            </span>

          </div>

        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1600px]">

          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">

            {items.map((product) => (
              <article key={product.id}>

                <div className="group relative aspect-[3/4] overflow-hidden bg-[#e9e6df]">

                  <Link
                    href={`/product/${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(
                        product.id
                      )
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white transition-colors hover:bg-black hover:text-white"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2
                      size={14}
                      strokeWidth={1.3}
                    />
                  </button>

                </div>

                <div className="mt-4">

                  <Link
                    href={`/product/${product.id}`}
                    className="text-[11px] font-bold uppercase tracking-[-0.01em] hover:opacity-50"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-black/40">
                    {product.category}
                  </p>

                  <p className="mt-3 text-sm font-medium">
                    ₹
                    {product.price.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

              </article>
            ))}

          </div>

        </div>
      </section>

    </main>
  );
}