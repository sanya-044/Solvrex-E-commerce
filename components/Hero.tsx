"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Product = {
  id: number | string;
  name: string;
  category: string;
  gender?: "Men" | "Women" | "Unisex";
  price: number;
  originalPrice: number;
  image: string;
  transparentImage?: string | null;
  description?: string;
  sizes?: string[];
  badge?: string;
};

export default function Hero() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected products API response");
        }

        // Only display products with a transparent PNG.
        const availableProducts = data.filter(
          (item: Product) =>
            typeof item.transparentImage === "string" &&
            item.transparentImage.trim() !== ""
        );

        if (!cancelled) {
          setProducts(availableProducts);
        }
      } catch (error) {
        console.error("Failed to load hero products:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const changeProduct = (nextIndex: number) => {
    if (
      isChanging ||
      nextIndex === active ||
      nextIndex < 0 ||
      nextIndex >= products.length
    ) {
      return;
    }

    setIsChanging(true);

    // Fade out the current image before changing the product.
    window.setTimeout(() => {
      setActive(nextIndex);

      // Allow the new image to render before fading it in.
      window.setTimeout(() => {
        setIsChanging(false);
      }, 50);
    }, 250);
  };

  const nextProduct = () => {
    if (products.length < 2) return;
    changeProduct((active + 1) % products.length);
  };

  const previousProduct = () => {
    if (products.length < 2) return;
    changeProduct((active - 1 + products.length) % products.length);
  };

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-40px)] items-center justify-center bg-[#f8eeee]">
        <p className="text-[9px] uppercase tracking-[0.4em] text-black/50">
          Loading collection
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="flex min-h-[calc(100vh-40px)] items-center justify-center bg-[#f8eeee] px-6">
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight">
            THE SHIRT COLLECTION
          </h1>
          <p className="mt-4 text-xs text-black/50">
            No products with transparent images are available yet.
          </p>
        </div>
      </section>
    );
  }

  const product = products[active];

  const discount =
    product.originalPrice > product.price &&
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  return (
    <section className="relative min-h-[calc(100vh-40px)] overflow-hidden bg-[#f8eeee]">
      {/* LEFT: COLLECTION TITLE AND PRODUCT DETAILS */}
      <div className="absolute left-[6%] top-1/2 z-20 w-[42%] max-w-[520px] -translate-y-1/2">
        <p className="mb-5 text-[8px] uppercase tracking-[0.45em] text-black/45">
          New Collection
        </p>

        <h1 className="text-[clamp(48px,6.2vw,100px)] font-light leading-[0.84] tracking-[-0.065em] text-black">
          THE
          <br />
          SHIRT
          <br />
          COLLECTION
        </h1>

        <p className="mt-7 text-[9px] uppercase tracking-[0.2em] text-black/50">
          {product.category}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {discount > 0 && (
            <>
              <span className="text-[10px] text-black/40 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>

              <span className="bg-black/5 px-2 py-1 text-[8px] uppercase tracking-wider text-black/60">
                {discount}% off
              </span>
            </>
          )}
        </div>

        <Link
          href={`/product/${product.id}`}
          className="mt-7 flex h-10 w-[145px] items-center justify-between border border-black/70 px-4 text-[8px] uppercase tracking-[0.18em] transition-colors duration-300 hover:bg-black hover:text-white"
        >
          View Product
          <span className="text-xs">↘</span>
        </Link>
      </div>

      {/* CENTER: TRANSPARENT PRODUCT PNG ONLY */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-[82vh] w-[38vw] min-w-[280px] max-w-[650px] translate-x-[3vw] items-center justify-center md:h-[88vh] md:w-[42vw]">
          <img
            key={String(product.id)}
            src={product.transparentImage!}
            alt={product.name}
            draggable={false}
            className={`h-full w-full select-none object-contain transition-all duration-500 ease-out ${
              isChanging
                ? "scale-[0.96] opacity-0"
                : "scale-100 opacity-100"
            }`}
          />
        </div>
      </div>

      {/* LEFT ARROW */}
      <button
        type="button"
        onClick={previousProduct}
        disabled={products.length < 2 || isChanging}
        aria-label="Previous product"
        className="absolute left-[34%] top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/25 bg-white/50 text-black/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-black/50 hover:bg-white/90 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:left-[38%] sm:h-11 sm:w-11"
      >
        <ArrowLeft size={15} strokeWidth={1.5} />
      </button>

      {/* RIGHT ARROW */}
      <button
        type="button"
        onClick={nextProduct}
        disabled={products.length < 2 || isChanging}
        aria-label="Next product"
        className="absolute left-[72%] top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/25 bg-white/50 text-black/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-black/50 hover:bg-white/90 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:left-[62%] sm:h-11 sm:w-11"
      >
        <ArrowRight size={15} strokeWidth={1.5} />
      </button>

      {/* RIGHT: PRODUCT THUMBNAILS */}
      <div className="absolute right-[2.5%] top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        {products.slice(0, 5).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeProduct(index)}
            disabled={isChanging}
            aria-label={`View ${item.name}`}
            aria-current={active === index ? "true" : undefined}
            className={`relative h-12 w-11 overflow-hidden border bg-white/40 transition-all duration-300 ${
              active === index
                ? "scale-105 border-black opacity-100"
                : "border-black/15 opacity-65 hover:border-black/40 hover:opacity-100"
            }`}
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* BOTTOM: ACTIVE PRODUCT NAME */}
      <div className="absolute bottom-8 left-1/2 z-20 max-w-[45%] -translate-x-1/2 text-center">
        <p className="truncate text-[8px] uppercase tracking-[0.3em] text-black/50">
          {product.name}
        </p>
      </div>

      {/* BOTTOM: SLIDE INDICATORS */}
      <div className="absolute bottom-8 right-[6%] z-20 flex items-center gap-2">
        {products.slice(0, 5).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeProduct(index)}
            disabled={isChanging}
            aria-label={`Go to product ${index + 1}`}
            className={`h-[2px] transition-all duration-300 ${
              active === index
                ? "w-8 bg-black"
                : "w-3 bg-black/25 hover:bg-black/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

