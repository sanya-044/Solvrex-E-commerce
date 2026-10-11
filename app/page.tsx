import CategoryCard from "@/components/CategoryCard";
import CinematicReveal from "@/components/CinematicReveal";
import EditorialJournal from "@/components/EditorialJournal";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import clientPromise from "@/lib/mongodb";
import { defaultProducts, type Product } from "@/data/products";

const categories = [
  { title: "T-Shirts", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85" },
  { title: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85" },
  { title: "Bottomwear", image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85" },
];

export default async function Home() {
  let products: Product[] = defaultProducts;

  try {
    const client = await clientPromise;
    const productDocuments = await client
      .db("VELMORI")
      .collection("products")
      .find({})
      .sort({ id: 1 })
      .toArray();

    if (productDocuments.length) {
      products = productDocuments.map((product) => ({
        id: Number(product.id),
        name: String(product.name || ""),
        category: String(product.category || ""),
        gender: String(product.gender || ""),
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || 0),
        image: String(product.image || ""),
        description: String(product.description || ""),
        sizes: Array.isArray(product.sizes) ? (product.sizes as string[]) : [],
        ...(product.badge ? { badge: String(product.badge) } : {}),
      }));
    }
  } catch (error) {
    console.warn("Homepage is using local products because MongoDB is unavailable.", error);
  }

  return (
    <main className="min-h-screen bg-[#fbf4f2] text-[#26231f]">
      <Hero />

      <EditorialJournal />

      <CinematicReveal />

      <section id="new-arrivals" className="border-t border-black/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/50">Chosen for the season</p>
              <h2 className="font-serif text-4xl font-normal tracking-[-0.06em] sm:text-5xl lg:text-6xl">The considered edit</h2>
            </div>
            <a href="/shop" className="hidden border-b border-black/40 pb-1 text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-50 sm:block">View everything&nbsp; →</a>
          </div>
          <ProductCarousel products={products} />
          <div className="mt-7 sm:hidden">
            <a href="/shop" className="border-b border-black/40 pb-1 text-[10px] uppercase tracking-[0.16em]">View everything&nbsp; →</a>
          </div>
        </div>
      </section>

      <section className="bg-[#f0dcdd] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-black/50">Find your everyday</p>
              <h2 className="font-serif text-4xl font-normal tracking-[-0.06em] sm:text-5xl lg:text-6xl">Shop by feeling</h2>
            </div>
            <p className="max-w-xs text-xs leading-5 text-black/55">Pieces that work together, and feel like your own.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.title} title={category.title} image={category.image} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-8 sm:py-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">A quieter kind of statement</p>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-normal leading-[1.02] tracking-[-0.06em] sm:text-6xl">Wear what feels like you.</h2>
        <a href="/shop" className="mt-7 inline-flex min-h-11 items-center border-b border-black px-1 text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-55">Explore VELMORI&nbsp; →</a>
      </section>
    </main>
  );
}
