 "use client";

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useSyncExternalStore, useState, useEffect } from "react";
import type { Product } from "@/data/products";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function Navbar() {
  const { data: session, status } = useSession();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [activeMenu, setActiveMenu] = useState<"men" | "women" | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load products.");
        const data = await response.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (error) {
        console.error("Navbar products error:", error);
      }
    };
    loadProducts();
  }, []);

  const searchResults = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false;
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.gender.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.badge?.toLowerCase().includes(query)
    );
  });

  const isAuthenticated = !!session?.user;

  return (
    <>
      {/* ANNOUNCEMENT */}
      <div className="bg-black px-4 py-2 text-center text-[9px] font-medium uppercase tracking-[0.3em] text-white sm:text-[10px]">
        Free shipping on orders above ₹599
      </div>

      {/* NAVBAR HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f3ee]/95 backdrop-blur-md">
        <div className="relative mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={21} strokeWidth={1.5} /> : <Menu size={21} strokeWidth={1.5} />}
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-8 lg:flex">
            {(["men", "women"] as const).map((genderKey) => (
              <button
                key={genderKey}
                type="button"
                onClick={() => setActiveMenu(activeMenu === genderKey ? null : genderKey)}
                className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
              >
                {genderKey.charAt(0).toUpperCase() + genderKey.slice(1)}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${activeMenu === genderKey ? "rotate-180" : ""}`}
                />
              </button>
            ))}
            <Link href="/shop" className="text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50">
              New Arrivals
            </Link>
            <Link href="/shop" className="text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50">
              Collections
            </Link>
          </nav>

          {/* LOGO */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[25px] font-black tracking-[-0.07em] sm:text-[29px]">
            VELMORI
          </Link>

          {/* RIGHT ACTIONS */}
          <div className="ml-auto flex items-center gap-4 sm:gap-5">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} strokeWidth={1.4} className="transition-opacity hover:opacity-50" />
            </button>

            {status !== "loading" && (
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                aria-label={isAuthenticated ? "Account" : "Login"}
                className="flex items-center gap-2 transition-opacity hover:opacity-50"
              >
                <UserRound size={20} strokeWidth={1.4} />
                <span className="hidden xl:block text-[9px] font-bold uppercase tracking-[0.16em]">
                  {isAuthenticated ? session.user?.name || "Account" : "Login"}
                </span>
              </Link>
            )}

            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
              <Heart size={20} strokeWidth={1.4} className="transition-opacity hover:opacity-50" />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" aria-label="Shopping bag" className="relative">
              <ShoppingBag size={20} strokeWidth={1.4} className="transition-opacity hover:opacity-50" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
                {mounted ? totalItems : 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9999] h-screen w-screen overflow-y-auto bg-[#f5f3ee] text-black">
          <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-black/10 bg-[#f5f3ee] px-5 sm:px-8 lg:px-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Search</span>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              aria-label="Close search"
              className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-50"
            >
              <X size={22} strokeWidth={1.4} />
            </button>
          </div>

          <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="border-b border-black">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full border-0 bg-transparent p-0 text-3xl font-medium tracking-[-0.05em] text-black outline-none placeholder:text-black/20 sm:text-5xl lg:text-7xl"
              />
            </div>

            {!searchQuery && (
              <div className="pt-12">
                <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["T-Shirts", "Hoodies", "Shirts", "Bottomwear", "New", "Bestseller"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      className="border border-black/15 px-5 py-3 text-[9px] uppercase tracking-[0.15em] transition-all hover:border-black hover:bg-black hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && (
              <div className="pt-10">
                <div className="mb-7 flex items-center justify-between">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em]">Search Results</p>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                    {searchResults.length} {searchResults.length === 1 ? "Result" : "Results"}
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="group"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e6df]">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                          {product.badge && (
                            <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[8px] uppercase tracking-[0.12em]">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.02em]">{product.name}</p>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-black/40">{product.category}</p>
                          <p className="mt-2 text-sm font-medium">₹{product.price.toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[350px] items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-black uppercase tracking-[-0.06em]">Nothing Found</p>
                      <p className="mt-4 text-sm text-black/40">Try another search.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DESKTOP MEGA MENU */}
      {activeMenu && (
        <div
          className="fixed left-0 right-0 top-[98px] z-45 hidden border-b border-black/10 bg-[#f5f3ee] shadow-[0_15px_40px_rgba(0,0,0,0.06)] lg:block"
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="mx-auto max-w-[1600px] px-12 py-10">
            <div className="grid grid-cols-4 gap-12">
              <div>
                <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">Clothing</p>
                <div className="flex flex-col gap-3">
                  <Link href={`/category/${activeMenu}`} className="text-sm hover:opacity-50">
                    {activeMenu === "men" ? "T-Shirts" : "Tops"}
                  </Link>
                  <Link href={`/category/${activeMenu}`} className="text-sm hover:opacity-50">
                    {activeMenu === "men" ? "Shirts" : "Dresses"}
                  </Link>
                  <Link href={`/category/${activeMenu}`} className="text-sm hover:opacity-50">Hoodies</Link>
                  <Link href={`/category/${activeMenu}`} className="text-sm hover:opacity-50">Bottomwear</Link>
                </div>
              </div>
              {/* Additional columns can go here */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}