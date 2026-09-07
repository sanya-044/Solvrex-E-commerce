"use client";

import Link from "next/link";
import { useEffect,useState, } from "react";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  MapPin,
} from "lucide-react";
import {useRouter} from "next/navigation";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductPage({
  params,
}: ProductPageProps) {
  /* ========================================
     PRODUCT ID
  ======================================== */

const router = useRouter();
  const [relatedProducts, setRelatedProducts] =
  useState<Product[]>([]);
const [productId, setProductId] =
  useState<number | null>(null);

const [product, setProduct] =
  useState<Product | null>(null);

const [loading, setLoading] =
  useState(true);

const [error, setError] =
  useState("");

  useEffect(() => {
  let cancelled = false;

  const loadProduct = async () => {
    try {
      const { id } = await params;

      const numericId = Number(id);

      if (!Number.isInteger(numericId)) {
        throw new Error(
          "Invalid product ID."
        );
      }

      if (!cancelled) {
        setProductId(numericId);
      }

      const response = await fetch(
        `/api/products/${numericId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load product."
        );
      }

      if (!cancelled) {
        setProduct(data);
      }
      const productsResponse = await fetch(
  "/api/products",
  {
    cache: "no-store",
  }
);

if (productsResponse.ok) {
  const allProducts =
    await productsResponse.json();

  if (Array.isArray(allProducts)) {
    const related = allProducts
      .filter(
        (item: Product) =>
          item.id !== numericId &&
          item.category === data.category
      )
      .slice(0, 4);

    if (!cancelled) {
      setRelatedProducts(related);
    }
  }
}
    } catch (error) {
      console.error(
        "Product loading error:",
        error
      );

      if (!cancelled) {
        setError(
          "Unable to load this product."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
    const productsResponse = await fetch(
  "/api/products",
  {
    cache: "no-store",
  }
);


  };

  loadProduct();

  return () => {
    cancelled = true;
  };
}, [params]);
  /* ========================================
     STATE
  ======================================== */

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);


  const [quantity, setQuantity] =
    useState(1);

  const [showDetails, setShowDetails] =
    useState(false);

  const [addedToBag, setAddedToBag] =
    useState(false);

  const [pincode, setPincode] =
    useState("");

  const [pincodeChecked, setPincodeChecked] =
    useState(false);

  /* ========================================
     CART STORE
  ======================================== */

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  /* ========================================
     WISHLIST STORE
  ======================================== */

  const toggleWishlist =
    useWishlistStore(
      (state) => state.toggleWishlist
    );

  const isWishlisted =
    useWishlistStore((state) =>
      state.items.some(
        (item) => item.id === productId
      )
    );

  /* ========================================
     PRODUCT NOT FOUND
  ======================================== */
if (loading) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f6f2]">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
        Loading Product...
      </p>
    </main>
  );
}
  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f6f2] px-5">
        <div className="text-center">

          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
            FABRICE
          </p>

          <h1 className="text-4xl font-black uppercase tracking-[-0.06em]">
  {error || "Product Not Found"}
</h1>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 border border-black px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Shop
          </Link>

        </div>
      </main>
    );
  }

  /* ========================================
     DISCOUNT
  ======================================== */

  const discount = Math.round(
    ((product.originalPrice -
      product.price) /
      product.originalPrice) *
      100
  );

  /* ========================================
     ADD TO BAG
  ======================================== */

  const handleAddToBag = () => {
  if (!selectedSize) return;

  addToCart(
    product,
    selectedSize,
    quantity
  );

  setAddedToBag(true);

  setTimeout(() => {
    setAddedToBag(false);
  }, 2000);
};
const handleBuyNow = () => {
  if (!selectedSize) return;

  addToCart(
    product,
    selectedSize,
    quantity
  );

  router.push("/checkout");
};

  /* ========================================
     PAGE
  ======================================== */

  return (
    <main className="bg-[#f7f6f2]">

      {/* =====================================
          BREADCRUMB
      ===================================== */}

      <div className="border-b border-black/10 px-5 py-4 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-[1600px]">

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-black/45 transition-colors hover:text-black"
          >
            <ArrowLeft size={13} />
            Back to Shop
          </Link>

        </div>

      </div>

      {/* =====================================
          PRODUCT SECTION
      ===================================== */}

      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">

        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">

          {/* =================================
              IMAGE GALLERY
          ================================= */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* MAIN IMAGE */}

            <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e6df] sm:col-span-2">

              <img
                src={product.image}
                alt={product.name}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />

              {/* Discount */}

              <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[9px] font-medium uppercase tracking-[0.15em]">
                {discount}% OFF
              </span>

            </div>

            {/* SECOND IMAGE */}

            <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e6df]">

              <img
                src={product.image}
                alt={`${product.name} detail`}
                draggable={false}
                className="h-full w-full scale-[1.08] object-cover transition-transform duration-700 hover:scale-[1.12]"
              />

            </div>

            {/* THIRD IMAGE */}

            <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e6df]">

              <img
                src={product.image}
                alt={`${product.name} alternate view`}
                draggable={false}
                className="h-full w-full scale-[1.15] object-cover transition-transform duration-700 hover:scale-[1.2]"
              />

            </div>

          </div>

          {/* =================================
              PRODUCT INFORMATION
          ================================= */}

          <div className="lg:sticky lg:top-24 lg:h-fit">

            {/* CATEGORY */}

            <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-black/45">
              {product.category}
            </p>

            {/* PRODUCT NAME */}

            <h1 className="max-w-xl text-4xl font-bold uppercase leading-[0.9] tracking-[-0.06em] sm:text-5xl">
              {product.name}
            </h1>

            {/* =================================
                RATING
            ================================= */}

            <div className="mt-5 flex items-center gap-3">

              <span className="text-sm tracking-[0.15em]">
                ★★★★★
              </span>

              <span className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                4.8 · 124 Reviews
              </span>

            </div>

            {/* =================================
                PRICE
            ================================= */}

            <div className="mt-7 flex flex-wrap items-center gap-3">

              <span className="text-xl font-bold">
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span className="text-sm text-black/35 line-through">
                ₹
                {product.originalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/50">
                {discount}% Off
              </span>

            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}

            <p className="mt-6 max-w-lg text-sm leading-6 text-black/55">
              {product.description}
            </p>

            {/* =================================
                SIZE
            ================================= */}

            <div className="mt-9 border-t border-black/10 pt-7">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Select Size
                </span>

                <button
                  type="button"
                  className="text-[9px] uppercase tracking-[0.15em] underline underline-offset-4"
                >
                  Size Guide
                </button>

              </div>

              <div className="grid grid-cols-4 gap-2">

                {product.sizes.map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setAddedToBag(false);
                      }}
                      className={`
                        h-12
                        border
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.1em]
                        transition-all
                        ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-black/15 hover:border-black"
                        }
                      `}
                    >
                      {size}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* =================================
                QUANTITY
            ================================= */}

            <div className="mt-7">

              <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em]">
                Quantity
              </span>

              <div className="flex h-12 w-32 items-center justify-between border border-black/15">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-black/5"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>

                <span className="text-sm">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      quantity + 1
                    )
                  }
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-black/5"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>

              </div>

            </div>

            {/* =================================
                ADD TO BAG + WISHLIST
            ================================= */}

            <div className="mt-7 space-y-2">

  <div className="flex gap-2">

    {/* ADD TO BAG */}

    <button
      type="button"
      disabled={!selectedSize}
      onClick={handleAddToBag}
      className={`
        flex
        h-14
        flex-1
        items-center
        justify-center
        text-[10px]
        font-bold
        uppercase
        tracking-[0.2em]
        transition-all
        ${
          !selectedSize
            ? "cursor-not-allowed bg-black/10 text-black/35"
            : addedToBag
            ? "bg-black text-white"
            : "bg-black text-white hover:bg-black/80"
        }
      `}
    >
      {!selectedSize
        ? "Select a Size"
        : addedToBag
        ? "Added ✓"
        : "Add to Bag"}
    </button>

    {/* WISHLIST */}

    <button
      type="button"
      onClick={() =>
        toggleWishlist(product)
      }
      aria-label={
        isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`
        flex
        h-14
        w-14
        shrink-0
        items-center
        justify-center
        border
        transition-all
        ${
          isWishlisted
            ? "border-black bg-black text-white"
            : "border-black/15 hover:border-black"
        }
      `}
    >
      <Heart
        size={19}
        strokeWidth={1.3}
        fill={
          isWishlisted
            ? "currentColor"
            : "none"
        }
      />
    </button>

  </div>

  {/* BUY NOW */}

  <button
    type="button"
    disabled={!selectedSize}
    onClick={handleBuyNow}
    className={`
      flex
      h-14
      w-full
      items-center
      justify-center
      border
      text-[10px]
      font-bold
      uppercase
      tracking-[0.2em]
      transition-all
      ${
        selectedSize
          ? "border-black hover:bg-black hover:text-white"
          : "cursor-not-allowed border-black/10 text-black/25"
      }
    `}
  >
    Buy It Now
  </button>

</div>
            {/* =================================
                PRODUCT DETAILS
            ================================= */}

            <div className="mt-8 border-t border-black/10">

              <button
                type="button"
                onClick={() =>
                  setShowDetails(
                    !showDetails
                  )
                }
                className="flex w-full items-center justify-between border-b border-black/10 py-5 text-left"
              >

                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Product Details
                </span>

                <span className="text-lg">
                  {showDetails
                    ? "−"
                    : "+"}
                </span>

              </button>

              {showDetails && (
                <div className="border-b border-black/10 pb-5 pt-4 text-sm leading-6 text-black/55">

                  <p>
                    Designed by FABRICE for
                    everyday wear. Built around
                    a relaxed contemporary
                    silhouette with carefully
                    considered details.
                  </p>

                  <ul className="mt-4 space-y-2">

                    <li>
                      • Premium everyday
                      construction
                    </li>

                    <li>
                      • Relaxed contemporary fit
                    </li>

                    <li>
                      • Designed for easy layering
                    </li>

                    <li>
                      • Made for everyday movement
                    </li>

                  </ul>

                </div>
              )}

              {/* =================================
                  SHIPPING
              ================================= */}

              <div className="border-b border-black/10 py-5">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Shipping & Returns
                </span>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  Free shipping on orders
                  above ₹599. Easy returns
                  within 7 days.
                </p>

              </div>

            </div>

            {/* =================================
                DELIVERY NOTE
            ================================= */}
            {/* =================================
    DELIVERY CHECK
================================= */}

<div className="mt-6 border border-black/10 bg-white p-5">

  <div className="flex items-center gap-3">

    <MapPin
      size={16}
      strokeWidth={1.3}
    />

    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em]">
        Check Delivery
      </p>

      <p className="mt-1 text-xs text-black/40">
        Enter your pincode to check availability.
      </p>
    </div>

  </div>

  <div className="mt-5 flex gap-2">

    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={pincode}
      onChange={(e) => {
        setPincode(
          e.target.value.replace(
            /\D/g,
            ""
          )
        );
        setPincodeChecked(false);
      }}
      placeholder="Enter Pincode"
      className="h-12 min-w-0 flex-1 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
    />

    <button
      type="button"
      disabled={pincode.length !== 6}
      onClick={() =>
        setPincodeChecked(true)
      }
      className="h-12 border border-black px-5 text-[9px] font-bold uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/25"
    >
      Check
    </button>

  </div>

  {pincodeChecked && (
    <div className="mt-4 border-t border-black/10 pt-4">

      <p className="text-[9px] font-bold uppercase tracking-[0.15em]">
        ✓ Delivery Available
      </p>

      <p className="mt-1 text-xs text-black/45">
        Estimated delivery in 3–5 business days.
      </p>

    </div>
  )}

</div>
            <div className="mt-6 border border-black/10 bg-white p-5">

              <div className="flex items-start gap-4">

                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" />

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em]">
                    Free Shipping
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    On orders above ₹599
                  </p>

                </div>

              </div>

              <div className="mt-4 flex items-start gap-4">

                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" />

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em]">
                    Easy Returns
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    7-day return policy
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    {/* =====================================
    YOU MAY ALSO LIKE
===================================== */}

<section className="border-t border-black/10 px-5 py-14 sm:px-8 lg:px-12 lg:py-20">

  <div className="mx-auto max-w-[1600px]">

    <div className="mb-8 flex items-end justify-between">

      <div>
        <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-black/40">
          FABRICE / DISCOVER
        </p>

        <h2 className="text-3xl font-black uppercase tracking-[-0.06em] sm:text-4xl">
          You May Also Like
        </h2>
      </div>

      <Link
        href="/shop"
        className="text-[9px] font-bold uppercase tracking-[0.2em] underline underline-offset-4"
      >
        View All
      </Link>

    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

      {relatedProducts
        .filter(
          (item) =>
            item.id !== product.id &&
            item.category === product.category
        )
        .slice(0, 4)
        .map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="group"
          >

            <div className="aspect-[3/4] overflow-hidden bg-[#e9e6df]">

              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />

            </div>

            <div className="mt-4">

              <p className="text-[10px] font-bold uppercase">
                {item.name}
              </p>

              <p className="mt-2 text-sm">
                ₹
                {item.price.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </Link>
        ))}

    </div>

  </div>

</section>
    </main>
  );
}