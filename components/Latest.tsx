"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";

interface LatestProduct {
  id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
}

const menLatest: LatestProduct[] = [
  {
    id: "latest-men-01",
    category: "T-SHIRTS",
    name: "Essential Heavy Tee",
    price: 1500,
    image: "/images/latest/men/essential-heavy-tee.webp",
    badge: "NEW",
  },
  {
    id: "latest-men-02",
    category: "SHIRTS",
    name: "Textured Linen Shirt",
    price: 1899,
    image: "/images/latest/men/textured-linen-shirt.webp",
    badge: "BESTSELLER",
  },
  {
    id: "latest-men-03",
    category: "HOODIES",
    name: "Oversized Hoodie",
    price: 2199,
    image: "/images/latest/men/oversized-hoodie.webp",
  },
  {
    id: "latest-men-04",
    category: "TROUSERS",
    name: "Utility Cargo Trousers",
    price: 1999,
    image: "/images/latest/men/utility-cargo-trousers.webp",
  },
];

const womenLatest: LatestProduct[] = [
  {
    id: "latest-women-01",
    category: "TOPS",
    name: "Ribbed Knit Top",
    price: 1699,
    image: "/images/latest/women/ribbed-knit-top.webp",
  },
  {
    id: "latest-women-02",
    category: "SHIRTS",
    name: "Relaxed Fit Shirt",
    price: 1899,
    image: "/images/latest/women/relaxed-fit-shirt.webp",
  },
  {
    id: "latest-women-03",
    category: "HOODIES",
    name: "Oversized Hoodies",
    price: 2199,
    image: "/images/latest/women/oversized-hoodies.webp",
  },
  {
    id: "latest-women-04",
    category: "TROUSERS",
    name: "Wide Leg Trousers",
    price: 1999,
    image: "/images/latest/women/wide-leg-trousers.webp",
  },
];

interface LatestProductCardProps {
  product: LatestProduct;
}

function LatestProductCard({ product }: LatestProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Also sync with store
    toggleWishlist({
      id: parseInt(product.id.split("-")[2]),
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      gender: "Unisex",
      originalPrice: product.price,
      description: `${product.category} from The Latest collection`,
      sizes: ["S", "M", "L", "XL"],
      ...(product.badge && { badge: product.badge }),
    });
  };

  return (
    <article className="group flex flex-col">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e4dd]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          quality={75}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 22vw"
        />

        {/* BADGE */}
        {product.badge && (
          <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-medium uppercase tracking-wider">
            {product.badge}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all hover:scale-105"
        >
          <Heart
            size={17}
            strokeWidth={1.3}
            fill={isWishlisted ? "currentColor" : "none"}
            className={isWishlisted ? "text-black" : "text-black"}
          />
        </button>
      </div>

      {/* PRODUCT INFO */}
      <div className="pt-4">
        <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.18em] text-black/45">
          {product.category}
        </p>

        <h3 className="text-sm font-medium tracking-[-0.01em] text-black">
          {product.name}
        </h3>

        <p className="mt-2 text-sm font-semibold text-black">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </article>
  );
}

export default function Latest() {
  return (
    <section className="bg-[#F4F1EB] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1600px]">
        {/* SECTION HEADER */}
        <div className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            {/* EYEBROW */}
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-black/45">
              03. THE LATEST
            </p>

            {/* HEADING */}
            <h2 className="text-4xl font-bold uppercase tracking-[-0.06em] sm:text-5xl lg:text-7xl text-black mb-4">
              The Latest.
            </h2>

            {/* SUPPORTING TEXT */}
            <p className="max-w-xl text-sm leading-6 text-black/50">
              Fresh essentials. Modern silhouettes. Made for real life.
            </p>
          </div>

          {/* VIEW ALL LINK */}
          <Link
            href="/shop"
            className="w-fit border-b border-black pb-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-50"
          >
            View All →
          </Link>
        </div>

        {/* MEN'S COLLECTION */}
        <div className="mb-12 lg:mb-16">
          {/* MEN HEADING WITH DIVIDER */}
          <div className="mb-10 flex items-center gap-4">
            <h3 className="text-2xl font-bold uppercase tracking-[-0.05em] text-black sm:text-3xl">
              Men
            </h3>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* MEN'S PRODUCTS GRID */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {menLatest.map((product) => (
              <LatestProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* WOMEN'S COLLECTION */}
        <div>
          {/* WOMEN HEADING WITH DIVIDER */}
          <div className="mb-10 flex items-center gap-4">
            <h3 className="text-2xl font-bold uppercase tracking-[-0.05em] text-black sm:text-3xl">
              Women
            </h3>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* WOMEN'S PRODUCTS GRID */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {womenLatest.map((product) => (
              <LatestProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
