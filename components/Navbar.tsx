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
import { useState } from "react";
import Link from "next/link";
import {
  useSession,
  signOut,
} from "next-auth/react";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function Navbar() {
  const {
  data: session,
  status,
} = useSession();
  const totalItems = useCartStore(
    (state) => state.getTotalItems()
  );

  const wishlistCount = useWishlistStore(
    (state) => state.items.length
  );

  const [menuOpen, setMenuOpen] =
    useState(false);

const [searchOpen, setSearchOpen] =
  useState(false);

const [searchQuery, setSearchQuery] =
  useState("");
  const [activeMenu, setActiveMenu] =
    useState<"men" | "women" | null>(null);
  const searchResults = products.filter(
  (product) => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) return false;

    return (
      product.name
        .toLowerCase()
        .includes(query) ||
      product.category
        .toLowerCase()
        .includes(query) ||
      product.gender
        .toLowerCase()
        .includes(query) ||
      product.description
        .toLowerCase()
        .includes(query) ||
      product.badge
        ?.toLowerCase()
        .includes(query)
    );
  }
);
  return (
    <>
      {/* =====================================
          ANNOUNCEMENT
      ===================================== */}

      <div className="bg-black px-4 py-2 text-center text-[9px] font-medium uppercase tracking-[0.3em] text-white sm:text-[10px]">
        Free shipping on orders above ₹599
      </div>

      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f3ee]/95 backdrop-blur-md">

        <div className="relative mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* =================================
              MOBILE MENU BUTTON
          ================================= */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="lg:hidden"
            aria-label="Menu"
          >
            {menuOpen ? (
              <X
                size={21}
                strokeWidth={1.5}
              />
            ) : (
              <Menu
                size={21}
                strokeWidth={1.5}
              />
            )}
          </button>
            {/* =====================================
    SEARCH OVERLAY
===================================== */}

{/* =====================================
    SEARCH OVERLAY
===================================== */}

{searchOpen && (
  <div className="fixed inset-0 z-[9999] isolate h-screen w-screen overflow-y-auto bg-[#f5f3ee] text-black">

    {/* SEARCH HEADER */}

    <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-black/10 bg-[#f5f3ee] px-5 sm:px-8 lg:px-12">

      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
        Search
      </span>

      <button
        type="button"
        onClick={() => {
          setSearchOpen(false);
          setSearchQuery("");
        }}
        aria-label="Close search"
        className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-50"
      >
        <X
          size={22}
          strokeWidth={1.4}
        />
      </button>

    </div>

    {/* SEARCH CONTENT */}

    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

      {/* SEARCH INPUT */}

      <div className="border-b border-black">

        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          placeholder="What are you looking for?"
          className="!m-0 !w-full !border-0 !bg-transparent !p-0 !text-black !outline-none !ring-0 !shadow-none text-3xl font-medium tracking-[-0.05em] placeholder:!text-black/20 sm:text-5xl lg:text-7xl"
        />

      </div>

      {/* =================================
          TRENDING
      ================================= */}

      {!searchQuery && (
        <div className="pt-12">

          <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Trending Searches
          </p>

          <div className="flex flex-wrap gap-2">

            {[
              "T-Shirts",
              "Hoodies",
              "Shirts",
              "Bottomwear",
              "New",
              "Bestseller",
            ].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() =>
                  setSearchQuery(term)
                }
                className="border border-black/15 px-5 py-3 text-[9px] uppercase tracking-[0.15em] transition-all hover:border-black hover:bg-black hover:text-white"
              >
                {term}
              </button>
            ))}

          </div>

        </div>
      )}

      {/* =================================
          SEARCH RESULTS
      ================================= */}

      {searchQuery && (
        <div className="pt-10">

          <div className="mb-7 flex items-center justify-between">

            <p className="text-[9px] font-bold uppercase tracking-[0.25em]">
              Search Results
            </p>

            <span className="text-[9px] uppercase tracking-[0.15em] text-black/40">
              {searchResults.length}{" "}
              {searchResults.length === 1
                ? "Result"
                : "Results"}
            </span>

          </div>

          {/* RESULTS */}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">

              {searchResults.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="group"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e6df]">

                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />

                      {product.badge && (
                        <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[8px] uppercase tracking-[0.12em]">
                          {product.badge}
                        </span>
                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="mt-4">

                      <p className="text-[10px] font-bold uppercase tracking-[0.02em]">
                        {product.name}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-black/40">
                        {product.category}
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </Link>
                )
              )}

            </div>
          )}

          {/* NO RESULTS */}

          {searchResults.length === 0 && (
            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <p className="text-4xl font-black uppercase tracking-[-0.06em]">
                  Nothing Found
                </p>

                <p className="mt-4 text-sm text-black/40">
                  Try another search.
                </p>

              </div>

            </div>
          )}

        </div>
      )}

    </div>

  </div>
)}
          {/* =================================
              DESKTOP NAVIGATION
          ================================= */}

          <nav className="hidden items-center gap-8 lg:flex">

            {/* MEN */}

            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === "men"
                    ? null
                    : "men"
                )
              }
              className={`
                flex
                items-center
                gap-1
                text-[11px]
                font-medium
                uppercase
                tracking-[0.16em]
                transition-opacity
                hover:opacity-50
              `}
            >
              Men

              <ChevronDown
                size={12}
                className={`
                  transition-transform
                  ${
                    activeMenu === "men"
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* WOMEN */}

            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === "women"
                    ? null
                    : "women"
                )
              }
              className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
            >
              Women

              <ChevronDown
                size={12}
                className={`
                  transition-transform
                  ${
                    activeMenu === "women"
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* NEW ARRIVALS */}

            <a
              href="/shop"
              className="text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
            >
              New Arrivals
            </a>

            {/* COLLECTIONS */}

            <Link
              href="/shop"
              className="text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-50"
            >
              Collections
            </Link>

          </nav>

          {/* =================================
              LOGO
          ================================= */}

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-[25px] font-black tracking-[-0.07em] sm:text-[29px]"
          >
            FABRICE
          </Link>

          {/* =================================
              RIGHT ACTIONS
          ================================= */}

          <div className="ml-auto flex items-center gap-4 sm:gap-5">

            {/* SEARCH */}

            <button
  type="button"
  onClick={() => setSearchOpen(true)}
  aria-label="Search"
>
  <Search
    size={20}
    strokeWidth={1.4}
    className="transition-opacity hover:opacity-50"
  />
</button>
{/* ACCOUNT */}
{/* ACCOUNT */}

{status !== "loading" && (
  <>
    {session?.user ? (
      <Link
        href="/account"
        aria-label="Account"
        className="flex items-center gap-2 transition-opacity hover:opacity-50"
      >
        <UserRound
          size={20}
          strokeWidth={1.4}
        />

        <span className="hidden xl:block text-[9px] font-bold uppercase tracking-[0.16em]">
          {session.user.name || "Account"}
        </span>
      </Link>
    ) : (
      <Link
        href="/login"
        aria-label="Login"
        className="flex items-center gap-2 transition-opacity hover:opacity-50"
      >
        <UserRound
          size={20}
          strokeWidth={1.4}
        />

        <span className="hidden xl:block text-[9px] font-bold uppercase tracking-[0.16em]">
          Login
        </span>
      </Link>
    )}
  </>
)}
 

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden sm:block"
            >
              <Heart
                size={20}
                strokeWidth={1.4}
                className="transition-opacity hover:opacity-50"
              />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* SHOPPING BAG */}

            <a
              href="/cart"
              aria-label="Shopping bag"
              className="relative"
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.4}
                className="transition-opacity hover:opacity-50"
              />

              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
                {totalItems}
              </span>
            </a>

          </div>

        </div>
      </header>

      {/* =====================================
          DESKTOP MEGA MENU
      ===================================== */}

      {activeMenu && (
        <div
          className="fixed left-0 right-0 top-[98px] z-40 hidden border-b border-black/10 bg-[#f5f3ee] shadow-[0_15px_40px_rgba(0,0,0,0.06)] lg:block"
          onMouseLeave={() =>
            setActiveMenu(null)
          }
        >

          <div className="mx-auto max-w-[1600px] px-12 py-10">

            {/* ===============================
                MEN MENU
            =============================== */}

            {activeMenu === "men" && (
              <div className="grid grid-cols-4 gap-12">

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Clothing
                  </p>

                  <div className="flex flex-col gap-3">

                    <Link
                      href="/category/men"
                      className="text-sm hover:opacity-50"
                    >
                      T-Shirts
                    </Link>

                    <Link
                      href="/category/men"
                      className="text-sm hover:opacity-50"
                    >
                      Shirts
                    </Link>

                    <Link
                      href="/category/men"
                      className="text-sm hover:opacity-50"
                    >
                      Hoodies
                    </Link>

                    <Link
                      href="/category/men"
                      className="text-sm hover:opacity-50"
                    >
                      Bottomwear
                    </Link>

                  </div>
                </div>

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Trending
                  </p>

                  <div className="flex flex-col gap-3">

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      New Arrivals
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Best Sellers
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Essentials
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Sale
                    </a>

                  </div>
                </div>

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Explore
                  </p>

                  <div className="flex flex-col gap-3">

                    <Link
                      href="/category/men"
                      className="text-sm hover:opacity-50"
                    >
                      All Men
                    </Link>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Latest Drop
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      FABRICE Essentials
                    </a>

                  </div>
                </div>

                {/* FEATURE */}

                <a
                  href="/shop"
                  className="group relative h-48 overflow-hidden bg-black"
                >

                  <div className="absolute inset-0 flex items-end p-6 text-white">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                        The latest
                      </p>

                      <p className="mt-1 text-xl font-bold uppercase tracking-[-0.04em]">
                        New Drop
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-5 top-5 text-[9px] uppercase tracking-[0.2em] text-white/50">
                    Explore →
                  </div>

                </a>

              </div>
            )}

            {/* ===============================
                WOMEN MENU
            =============================== */}

            {activeMenu === "women" && (
              <div className="grid grid-cols-4 gap-12">

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Clothing
                  </p>

                  <div className="flex flex-col gap-3">

                    <Link
                      href="/category/women"
                      className="text-sm hover:opacity-50"
                    >
                      Tops
                    </Link>

                    <Link
                      href="/category/women"
                      className="text-sm hover:opacity-50"
                    >
                      Dresses
                    </Link>

                    <Link
                      href="/category/women"
                      className="text-sm hover:opacity-50"
                    >
                      Hoodies
                    </Link>

                    <Link
                      href="/category/women"
                      className="text-sm hover:opacity-50"
                    >
                      Bottomwear
                    </Link>

                  </div>
                </div>

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Trending
                  </p>

                  <div className="flex flex-col gap-3">

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      New Arrivals
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Best Sellers
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Essentials
                    </a>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Sale
                    </a>

                  </div>
                </div>

                <div>
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
                    Explore
                  </p>

                  <div className="flex flex-col gap-3">

                    <Link
                      href="/category/women"
                      className="text-sm hover:opacity-50"
                    >
                      All Women
                    </Link>

                    <Link
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      Latest Drop
                    </Link>

                    <a
                      href="/shop"
                      className="text-sm hover:opacity-50"
                    >
                      FABRICE Essentials
                    </a>

                  </div>
                </div>

                {/* FEATURE */}

                <a
                  href="/shop"
                  className="group relative h-48 overflow-hidden bg-black"
                >

                  <div className="absolute inset-0 flex items-end p-6 text-white">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                        The latest
                      </p>

                      <p className="mt-1 text-xl font-bold uppercase tracking-[-0.04em]">
                        New Drop
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-5 top-5 text-[9px] uppercase tracking-[0.2em] text-white/50">
                    Explore →
                  </div>

                </a>

              </div>
            )}

          </div>

        </div>
      )}

      {/* =====================================
          MOBILE MENU
      ===================================== */}

      {menuOpen && (
        <div className="fixed inset-x-0 top-[98px] z-40 border-b border-black/10 bg-[#f5f3ee] lg:hidden">

          <nav className="flex flex-col px-6 py-5">

            <Link
              href="/category/men"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Men
            </Link>

            <Link
              href="/category/women"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Women
            </Link>

            <Link
              href="/shop"
              onClick={() =>
                setMenuOpen(false)
              }
              className="border-b border-black/10 py-5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              New Arrivals
            </Link>

            <a
              href="/shop"
              onClick={() =>
                setMenuOpen(false)
              }
              className="py-5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Collections
            </a>

            <div className="mt-3 border-t border-black/10 pt-5">

              <a
                href="/wishlist"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center justify-between py-3 text-xs uppercase tracking-[0.2em]"
              >
                Wishlist

                {wishlistCount > 0 && (
                  <span className="text-[9px] text-black/40">
                    {wishlistCount}
                  </span>
                )}
              </a>

              <a
                href="/cart"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center justify-between py-3 text-xs uppercase tracking-[0.2em]"
              >
                Shopping Bag

                <span className="text-[9px] text-black/40">
                  {totalItems}
                </span>
              </a>

            </div>

          </nav>

        </div>
      )}

    </>
  );
}