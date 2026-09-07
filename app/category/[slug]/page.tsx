import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import clientPromise from "@/lib/mongodb";
import type { Product } from "@/data/products";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = slug.toLowerCase();

  const gender =
    category === "men"
      ? "Men"
      : category === "women"
      ? "Women"
      : category === "unisex"
      ? "Unisex"
      : null;

  let categoryProducts: Product[] = [];

  if (gender) {
    try {
      const client = await clientPromise;

      const db = client.db("fabrice");

      const products =
        await db
          .collection("products")
          .find({ gender })
          .sort({ id: 1 })
          .toArray();

      categoryProducts = products.map(
        (product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          gender: product.gender,
          price: product.price,
          originalPrice:
            product.originalPrice,
          image: product.image,
          description:
            product.description,
          sizes: product.sizes,
          ...(product.badge
            ? {
                badge: product.badge,
              }
            : {}),
        })
      );
    } catch (error) {
      console.error(
        "Category products error:",
        error
      );
    }
  }

  const title =
    gender ?? "Category";

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0a0a0a]">

      {/* HEADER */}

      <section className="border-b border-black/10 px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24">

        <div className="mx-auto max-w-[1600px]">

          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/40">
            FABRICE / {title}
          </p>

          <div className="flex items-end justify-between gap-8">

            <div>

              <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-[9rem]">
                {title}
              </h1>

              <p className="mt-6 max-w-md text-sm leading-6 text-black/50">
                Discover the latest FABRICE pieces
                designed for your everyday wardrobe.
              </p>

            </div>

            <p className="hidden text-[10px] uppercase tracking-[0.2em] text-black/40 sm:block">
              {categoryProducts.length} Products
            </p>

          </div>

        </div>

      </section>

      {/* CATEGORY NAV */}

      <section className="border-b border-black/10 px-5 sm:px-8 lg:px-12">

        <div className="mx-auto flex max-w-[1600px] items-center gap-7 overflow-x-auto py-4">

          <Link
            href="/category/men"
            className={`shrink-0 text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-50 ${
              gender === "Men"
                ? "font-bold"
                : "text-black/40"
            }`}
          >
            Men
          </Link>

          <Link
            href="/category/women"
            className={`shrink-0 text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-50 ${
              gender === "Women"
                ? "font-bold"
                : "text-black/40"
            }`}
          >
            Women
          </Link>

          <Link
            href="/category/unisex"
            className={`shrink-0 text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-50 ${
              gender === "Unisex"
                ? "font-bold"
                : "text-black/40"
            }`}
          >
            Unisex
          </Link>

          <Link
            href="/shop"
            className="ml-auto shrink-0 border-l border-black/10 pl-7 text-[10px] uppercase tracking-[0.2em] text-black/40 hover:text-black"
          >
            Shop All →
          </Link>

        </div>

      </section>

      {/* PRODUCTS */}

      <section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

        <div className="mx-auto max-w-[1600px]">

          {categoryProducts.length > 0 ? (

            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">

              {categoryProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>

          ) : (

            <div className="flex min-h-[400px] items-center justify-center">

              <div className="text-center">

                <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
                  Category not found
                </p>

                <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em]">
                  Nothing here yet.
                </h2>

                <Link
                  href="/shop"
                  className="mt-7 inline-flex bg-black px-7 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white"
                >
                  Explore Shop
                </Link>

              </div>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}