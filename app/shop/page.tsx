"use client";

import { SlidersHorizontal } from "lucide-react";
import { Suspense,useEffect,useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

const categories = [
  "All",
  "T-Shirts",
  "Hoodies",
  "Shirts",
  "Bottomwear",
  "Outerwear",
];

const sortOptions = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
];

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<
  Product[]
>([]);

const [loading, setLoading] =
  useState(true);

const [error, setError] =
  useState("");

useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await fetch(
        "/api/products"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load products."
        );
      }

      setProducts(data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, []);
  const categoryFromUrl = searchParams.get("category");

  const initialCategory =
    categoryFromUrl &&
    categories.includes(categoryFromUrl)
      ? categoryFromUrl
      : "All";

  const [activeCategory, setActiveCategory] =
    useState(initialCategory);

  const [sortBy, setSortBy] =
    useState("Featured");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ================================
    // CATEGORY FILTER
    // ================================

    if (activeCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category === activeCategory
      );
    }

    // ================================
    // SORTING
    // ================================

    if (sortBy === "Price: Low to High") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === "Price: High to Low") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    return result;
  }, [products,activeCategory, sortBy]);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0a0a0a]">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <section className="border-b border-black/10 px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pb-14 lg:pt-24">

        <div className="mx-auto max-w-[1600px]">

          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">
            Fabrice / Shop
          </p>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-[9rem]">
                Shop
              </h1>

              <p className="mt-6 max-w-md text-sm leading-6 text-black/55">
                Everyday essentials, statement pieces
                and contemporary silhouettes made for
                your wardrobe.
              </p>

            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
              {filteredProducts.length} Products
            </p>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* FILTER BAR */}
      {/* ================================= */}

      <section className="sticky top-0 z-20 border-b border-black/10 bg-[#f5f3ee]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 py-4">

          {/* Categories */}

          <div className="flex min-w-0 gap-5 overflow-x-auto scrollbar-hide">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setActiveCategory(category)
                }
                className={`
                  shrink-0
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  transition-colors
                  ${
                    activeCategory === category
                      ? "font-bold text-black"
                      : "text-black/40 hover:text-black"
                  }
                `}
              >
                {category}
              </button>
            ))}

          </div>

          {/* Sort */}

          <div className="flex shrink-0 items-center gap-3 border-l border-black/10 pl-5">

            <SlidersHorizontal
              size={15}
              strokeWidth={1.3}
            />

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="bg-transparent text-[10px] uppercase tracking-[0.15em] outline-none"
            >

              {sortOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}

            </select>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* PRODUCTS */}
      {/* ================================= */}

      <section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

        <div className="mx-auto max-w-[1600px]">

          {loading ? (
  <div className="flex min-h-[400px] items-center justify-center">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
      Loading Products...
    </p>
  </div>
) : error ? (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="text-center">
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-red-500">
        Error
      </p>

      <h2 className="text-3xl font-bold uppercase tracking-[-0.05em]">
        {error}
      </h2>
    </div>
  </div>
) : filteredProducts.length > 0 ? (
  <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
    {filteredProducts.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
      />
    ))}
  </div>
) : (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="text-center">
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
        No products
      </p>

      <h2 className="text-3xl font-bold uppercase tracking-[-0.05em]">
        Nothing here yet.
      </h2>
    </div>
  </div>
)}

        </div>

      </section>

    </main>
  );
}

/* =====================================
   SHOP PAGE
   ===================================== */

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}