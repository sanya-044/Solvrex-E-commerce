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
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/uiStore";

const MEGA_MENUS = {
  men: {
    categories: [
      {
        title: "CLOTHING",
        links: ["T-Shirts", "Shirts", "Trousers", "Outerwear"],
      },
      {
        title: "FEATURED",
        links: ["New Arrivals", "Best Sellers", "Essentials", "Trending"],
      },
    ],
  },
  women: {
    categories: [
      {
        title: "CLOTHING",
        links: ["Tops", "Dresses", "Trousers", "Outerwear"],
      },
      {
        title: "FEATURED",
        links: ["New Arrivals", "Best Sellers", "Essentials", "Trending"],
      },
    ],
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navTheme = useUIStore((state) => state.navTheme);
  
  const isDarkText = !isHome || navTheme === "dark";
  const textColorClass = isDarkText ? "text-[#111111]" : "text-white/95";
  const logoColorClass = isDarkText ? "text-[#050505]" : "text-white";
  const cartBadgeClass = isDarkText ? "bg-[#111111] text-white" : "bg-white/95 text-[#111111]";

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
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setProducts(data);
        }
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
      {/* NAVBAR HEADER */}
      <header 
        className={`top-0 z-50 w-full transition-colors duration-500 ${isHome ? "fixed bg-transparent" : "sticky bg-[#F4F1EB]"}`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        {isHome && (
          <div 
            className="absolute inset-x-0 top-0 h-[140px] pointer-events-none transition-opacity duration-500 -z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0) 100%)',
              opacity: navTheme === 'light' ? 1 : 0
            }}
          />
        )}
        <div className={`flex h-[64px] w-full items-center justify-between px-5 md:px-[75px] ${textColorClass} transition-colors duration-500`}>
          
          {/* MOBILE LEFT: MENU */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="transition-opacity hover:opacity-60"
            >
              {menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>

          {/* DESKTOP LEFT: LOGO & NAVIGATION */}
          <div className="hidden lg:flex items-center h-full">
            {/* LOGO */}
            <Link 
              href="/" 
              style={{ fontFamily: "'Arial Black', Arial, Helvetica, sans-serif", fontWeight: 800, letterSpacing: "-0.045em" }}
              className={`text-[28px] ${logoColorClass} uppercase mr-[70px] leading-none transition-colors duration-500`}
            >
              VELMORI
            </Link>

            {/* NAVIGATION */}
            <nav className="flex items-center gap-[30px] h-full">
              {(["men", "women"] as const).map((genderKey) => (
                <div 
                  key={genderKey}
                  className="relative h-full flex items-center group cursor-pointer"
                  onMouseEnter={() => setActiveMenu(genderKey)}
                >
                  <button
                    type="button"
                    className="text-[11.5px] font-[600] uppercase tracking-[0.08em] transition-opacity hover:opacity-60"
                  >
                    {genderKey}
                  </button>
                  {/* Invisible hover bridge */}
                  {activeMenu === genderKey && (
                    <div className="absolute top-[64px] left-0 w-full h-[2px] bg-transparent" />
                  )}
                </div>
              ))}
              <Link href="/shop" className="text-[11.5px] font-[600] uppercase tracking-[0.08em] transition-opacity hover:opacity-60">
                New Arrivals
              </Link>
              <Link href="/shop" className="text-[11.5px] font-[600] uppercase tracking-[0.08em] transition-opacity hover:opacity-60">
                Collections
              </Link>
              <Link href="/about" className="text-[11.5px] font-[600] uppercase tracking-[0.08em] transition-opacity hover:opacity-60">
                About
              </Link>
            </nav>
          </div>

          {/* MOBILE CENTER: LOGO */}
          <div className="flex justify-center lg:hidden absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/" 
              style={{ fontFamily: "'Arial Black', Arial, Helvetica, sans-serif", fontWeight: 800, letterSpacing: "-0.045em" }}
              className={`text-[26px] ${logoColorClass} uppercase leading-none transition-colors duration-500`}
            >
              VELMORI
            </Link>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center justify-end gap-[24px] h-full">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="hidden lg:flex items-center justify-center transition-opacity hover:opacity-60">
              <Search size={21} strokeWidth={1.5} />
            </button>

            <Link
              href={status === "loading" ? "/login" : isAuthenticated ? "/account" : "/login"}
              aria-label={isAuthenticated ? "Account" : "Login"}
              className="hidden lg:flex items-center justify-center transition-opacity hover:opacity-60"
            >
              <UserRound size={21} strokeWidth={1.5} />
            </Link>

            <Link href="/wishlist" aria-label="Wishlist" className="hidden lg:flex items-center justify-center transition-opacity hover:opacity-60">
              <Heart size={21} strokeWidth={1.5} />
            </Link>

            <Link href="/cart" aria-label="Shopping bag" className="relative flex items-center justify-center transition-opacity hover:opacity-60">
              <ShoppingBag size={21} strokeWidth={1.5} />
              <span className={`absolute -right-2 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-medium transition-colors duration-500 ${cartBadgeClass}`}>
                {mounted ? totalItems : 0}
              </span>
            </Link>
          </div>
        </div>

        {/* DESKTOP MEGA MENU */}
        {activeMenu && (
          <div
            className="absolute left-0 right-0 top-[64px] z-40 hidden bg-[#F4F1EB] shadow-sm lg:block border-t border-black/5"
          >
            <div className="mx-auto flex gap-20 px-[75px] py-12">
              {MEGA_MENUS[activeMenu].categories.map((category) => (
                <div key={category.title} className="w-48">
                  <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111]">
                    {category.title}
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {category.links.map((link) => (
                      <li key={link}>
                        <Link
                          href={`/category/${activeMenu}`}
                          className="text-[12.5px] font-medium text-[#111111]/70 transition-colors hover:text-[#111111] hover:underline underline-offset-4"
                          onClick={() => setActiveMenu(null)}
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <div className="ml-auto w-[300px] overflow-hidden bg-black/5 flex items-center justify-center">
                 {/* Editorial image placeholder */}
                 <span className="text-[#111111]/50 text-xs uppercase tracking-widest font-medium">Editorial Feature</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE FULLSCREEN MENU */}
      {menuOpen && (
        <div className="fixed inset-0 top-[64px] z-40 h-[calc(100vh-64px)] w-full overflow-y-auto bg-[#F4F1EB] text-[#111111] lg:hidden">
          <nav className="flex flex-col px-6 py-8 gap-8">
            <ul className="flex flex-col gap-6">
              <li>
                <Link href="/category/men" onClick={() => setMenuOpen(false)} className="text-xl font-medium uppercase tracking-[0.08em]">Men</Link>
              </li>
              <li>
                <Link href="/category/women" onClick={() => setMenuOpen(false)} className="text-xl font-medium uppercase tracking-[0.08em]">Women</Link>
              </li>
              <li>
                <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-xl font-medium uppercase tracking-[0.08em]">New Arrivals</Link>
              </li>
              <li>
                <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-xl font-medium uppercase tracking-[0.08em]">Collections</Link>
              </li>
            </ul>

            <div className="h-[1px] w-full bg-[#111111]/10"></div>

            <ul className="flex flex-col gap-5">
              <li>
                <button type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="text-sm font-medium uppercase tracking-[0.1em] text-[#111111]/70">Search</button>
              </li>
              <li>
                <Link href={status === "loading" ? "/login" : isAuthenticated ? "/account" : "/login"} onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-[0.1em] text-[#111111]/70">
                  {status === "loading" ? "Account" : isAuthenticated ? session.user?.name || "Account" : "Account"}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-[0.1em] text-[#111111]/70">Wishlist ({wishlistCount})</Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-[0.1em] text-[#111111]/70">About</Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-[0.1em] text-[#111111]/70">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9999] h-screen w-screen overflow-y-auto bg-[#F4F1EB] text-[#111111]">
          <div className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-[#111111]/10 bg-[#F4F1EB] px-5 sm:px-[75px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Search</span>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              aria-label="Close search"
              className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <X size={26} strokeWidth={1.2} />
            </button>
          </div>

          <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-[75px] lg:py-20">
            <div className="border-b border-[#111111] pb-4">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full border-0 bg-transparent p-0 text-3xl font-medium text-[#111111] outline-none placeholder:text-[#111111]/30 sm:text-5xl lg:text-6xl font-editorial tracking-tight"
              />
            </div>

            {!searchQuery && (
              <div className="pt-16">
                <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111]/70">Trending Searches</p>
                <div className="flex flex-wrap gap-3">
                  {["T-Shirts", "Hoodies", "Shirts", "Bottomwear", "New", "Bestseller"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      className="border border-[#111111]/20 bg-white/50 px-6 py-3 text-[11px] uppercase tracking-[0.12em] transition-all hover:border-[#111111] hover:bg-[#111111] hover:text-[#F4F1EB]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && (
              <div className="pt-16">
                <div className="mb-10 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em]">Search Results</p>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#111111]/70">
                    {searchResults.length} {searchResults.length === 1 ? "Result" : "Results"}
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="group flex flex-col"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                          {product.image && (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                          )}
                          {product.badge && (
                            <span className="absolute left-3 top-3 bg-[#111111] px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-5 flex flex-col flex-1">
                          <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#111111]">{product.name}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#111111]/70">{product.category}</p>
                          <p className="mt-3 text-sm font-medium text-[#111111]">₹{product.price.toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl sm:text-5xl font-editorial uppercase tracking-tight text-[#111111]">Nothing Found</p>
                      <p className="mt-4 text-sm text-[#111111]/70">Try another search term.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}