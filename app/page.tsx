import CategoryCard from "@/components/CategoryCard";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import clientPromise from "@/lib/mongodb";
import type { Product } from "@/data/products";
const categories = [
  {
    title: "T-Shirts",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Bottomwear",
    image:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=85",
  },
];

const collections = [
  {
    number: "01",
    title: "Everyday",
    subtitle: "Essentials",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "02",
    title: "After",
    subtitle: "Hours",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "03",
    title: "The",
    subtitle: "New Standard",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90",
  },
];

export default async function Home() {
  const client = await clientPromise;

const db = client.db("fabrice");

const productDocuments =
  await db
    .collection("products")
    .find({})
    .sort({ id: 1 })
    .toArray();

const products: Product[] =
  productDocuments.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    gender: product.gender,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    description: product.description,
    sizes: product.sizes,
    ...(product.badge
      ? { badge: product.badge }
      : {}),
  }));
  return (
    
    <main className="min-h-screen bg-[#f5f3ee] text-[#0a0a0a]">

      {/* =====================================
          HERO
      ===================================== */}

      <Hero />

     {/* =====================================
    BRAND INTRO
===================================== */}

<section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

  <div className="mx-auto max-w-[1600px]">

    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">

      {/* LABEL */}

      <div className="flex items-start">

        <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-black/40">
          FABRICE / EST. 2026
        </p>

      </div>

      {/* CONTENT */}

      <div className="max-w-[1200px]">

        <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.065em] sm:text-5xl md:text-6xl lg:text-[6.5rem]">
          Clothes for the way
          <br />
          you move.
        </h2>

        <div className="mt-8 flex flex-col justify-between gap-6 border-t border-black/10 pt-6 sm:flex-row sm:items-start">

          <p className="max-w-xl text-sm leading-6 text-black/50">
            FABRICE creates contemporary everyday
            clothing built around clean silhouettes,
            considered details and effortless styling.
          </p>

          <a
            href="/shop"
            className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-50"
          >
            Discover FABRICE →
          </a>

        </div>

      </div>

    </div>

  </div>

</section>

      {/* =====================================
          NEW ARRIVALS
      ===================================== */}

      <section
        id="new-arrivals"
        className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28"
      >

        <div className="mx-auto max-w-[1600px]">

          <div className="mb-10 flex items-end justify-between">

            <div>

              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-black/45">
                Fresh from the studio — 2026
              </p>

              <h2 className="text-4xl font-bold uppercase tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                The Latest
              </h2>

            </div>

            {/* DESKTOP VIEW ALL */}

            <a
              href="/shop"
              className="hidden border-b border-black pb-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-50 sm:block"
            >
              View All
            </a>

          </div>

          {/* PRODUCT CAROUSEL */}

          <ProductCarousel products={products} />

          {/* MOBILE VIEW ALL */}

          <div className="mt-10 flex justify-center sm:hidden">

            <a
              href="/shop"
              className="border-b border-black pb-1 text-xs font-medium uppercase tracking-[0.2em]"
            >
              View All
            </a>

          </div>

        </div>

      </section>

      {/* =====================================
          SHOP BY CATEGORY
      ===================================== */}

      <section className="bg-[#0a0a0a] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[1600px]">

          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
                Find your fit
              </p>

              <h2 className="text-4xl font-bold uppercase tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Shop by Category
              </h2>

            </div>

            <a
              href="/shop"
              className="w-fit border-b border-white/40 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white hover:text-white"
            >
              Explore All
            </a>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                image={category.image}
              />
            ))}

          </div>

        </div>

      </section>

      {/* =====================================
          FEATURED COLLECTIONS
      ===================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[1600px]">

          <div className="mb-12">

            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-black/40">
              FABRICE / EDITORIAL
            </p>

            <h2 className="text-4xl font-bold uppercase tracking-[-0.06em] sm:text-5xl lg:text-7xl">
              Collections
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {collections.map((collection) => (
              <a
                key={collection.number}
                href="/shop"
                className="group relative aspect-[3/4] overflow-hidden bg-black"
              >

                {/* IMAGE */}

                <img
                  src={collection.image}
                  alt={`${collection.title} ${collection.subtitle}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* OVERLAY */}

                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/35" />

                {/* NUMBER */}

                <span className="absolute left-5 top-5 text-[9px] font-medium tracking-[0.2em] text-white/70">
                  {collection.number}
                </span>

                {/* TEXT */}

                <div className="absolute bottom-6 left-6 text-white">

                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/60">
                    Collection
                  </p>

                  <h3 className="mt-2 text-3xl font-black uppercase leading-[0.85] tracking-[-0.06em]">
                    {collection.title}
                    <br />
                    {collection.subtitle}
                  </h3>

                </div>

                {/* ARROW */}

                <span className="absolute bottom-7 right-7 text-sm text-white transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>

              </a>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================
          BRAND STATEMENT
      ===================================== */}

      <section className="border-y border-black/10 bg-[#e9e6df] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">

        <div className="mx-auto max-w-[1600px] text-center">

          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-black/40">
            The FABRICE philosophy
          </p>

          <h2 className="mx-auto mt-8 max-w-6xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.07em] sm:text-6xl lg:text-8xl">
            Less noise.
            <br />
            More character.
          </h2>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-black/50">
            We believe great clothing doesn&apos;t need
            to shout. It just needs to feel right.
          </p>

          <a
            href="/shop"
            className="mt-10 inline-flex border border-black px-7 py-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            Explore FABRICE
          </a>

        </div>

      </section>

      {/* =====================================
          NEWSLETTER
      ===================================== */}

      <section className="bg-[#0a0a0a] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[900px] text-center">

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Stay in the loop
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase tracking-[-0.06em] sm:text-6xl">
            Don&apos;t miss the drop.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/45">
            New collections, exclusive releases and
            everything FABRICE — delivered occasionally.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row">

            <input
              type="email"
              placeholder="Your email address"
              className="h-14 flex-1 border border-white/20 bg-transparent px-5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white"
            />

            <button
              type="submit"
              className="h-14 bg-white px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-80"
            >
              Subscribe
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}