
"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const toggleWishlist = useWishlistStore(
  (state) => state.toggleWishlist
);

const isWishlisted = useWishlistStore(
  (state) =>
    state.items.some(
      (item) => item.id === product.id
    )
);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <article className="group">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#e7e4dd]">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {/* Discount */}
        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-medium uppercase tracking-wider">
          {discount}% off
        </span>

        {/* Wishlist */}
        <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }}
  aria-label={
    isWishlisted
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all hover:scale-105"
>
  <Heart
    size={17}
    strokeWidth={1.3}
    fill={
      isWishlisted
        ? "currentColor"
        : "none"
    }
    className={
      isWishlisted
        ? "text-black"
        : "text-black"
    }
  />
</button>

        {/* Quick Add */}
        <button className="absolute bottom-3 left-3 right-3 hidden bg-white py-3 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:opacity-100 sm:block">
          Quick Add
        </button>
      </div>

      {/* Details */}
      <div className="pt-4">
        <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.18em] text-black/45">
          {product.category}
        </p>

        <a href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium tracking-[-0.01em]">
            {product.name}
          </h3>
        </a>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span className="text-xs text-black/35 line-through">
            ₹{product.originalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </article>
  );
}