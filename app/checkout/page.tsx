"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [orderError, setOrderError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Protect checkout
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (orderError) {
      setOrderError("");
    }
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return (
        sum +
        Number(item.product?.price || 0) *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [items]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;

    return subtotal >= 599 ? 0 : 49;
  }, [subtotal, items.length]);

  const total = subtotal + shipping;

  const totalItems = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const handlePlaceOrder = async () => {
    setOrderError("");

    // Use entered name, otherwise use logged-in user's name
    const customerName =
      form.name.trim() ||
      session?.user?.name?.trim() ||
      "";

    // Customer validation
    if (
      !customerName ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      setOrderError(
        "Please complete your name, phone and email."
      );
      return;
    }

    // Address validation
    if (
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setOrderError(
        "Please complete your delivery address."
      );
      return;
    }

    // Cart validation
    if (items.length === 0) {
      setOrderError("Your shopping bag is empty.");
      return;
    }

    // Authentication check
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,

          customer: {
            name: customerName,
            email: form.email
              .trim()
              .toLowerCase(),
            phone: form.phone.trim(),
          },

          shippingAddress: {
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },

          subtotal,
          shipping,
          total,
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place your order."
        );
      }

      // Save returned MongoDB order ID
      setOrderId(data.orderId || "");

      // Show confirmation
      setOrderSuccess(true);

      // Clear cart only after successful order creation
      clearCart();
    } catch (error) {
      console.error(
        "Unable to place order:",
        error
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : "Unable to place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading authentication state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-6 py-20">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <Loader2
            size={22}
            className="animate-spin"
          />
        </div>
      </main>
    );
  }

  // Redirecting unauthenticated user
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-black/50">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  // Successful order
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#f7f6f2]">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-6 py-20">
          <div className="w-full border border-black/10 bg-white px-8 py-14 text-center md:px-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
              <Check size={22} />
            </div>

            <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-black/40">
              Order Confirmed
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] md:text-5xl">
              Thank You
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-black/55">
              Your order has been placed
              successfully. We&apos;ll process your
              order and prepare it for delivery.
            </p>

            {orderId && (
              <div className="mt-8 border border-black/10 px-5 py-4">
                <p className="text-[8px] uppercase tracking-[0.25em] text-black/40">
                  Order ID
                </p>

                <p className="mt-2 break-all text-sm font-medium">
                  {orderId}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() =>
                  router.push("/account")
                }
                className="h-12 bg-black px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
              >
                View Account
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/shop")
                }
                className="h-12 border border-black px-8 text-[9px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      {/* HEADER */}
      <div className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <Link
            href="/cart"
            className="group flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Bag
          </Link>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Checkout
          </p>

          <div className="w-[90px]" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
          {/* LEFT */}
          <div>
            {/* CUSTOMER INFORMATION */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
                01
              </p>

              <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] md:text-4xl">
                Customer Information
              </h1>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={
                    form.name ||
                    session?.user?.name ||
                    ""
                  }
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black sm:col-span-2"
                />

                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />

                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="mt-10 border-t border-black/10 pt-8">
              <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
                02
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">
                Delivery Address
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="House / Flat / Street Address"
                  value={form.address}
                  onChange={(e) =>
                    updateField(
                      "address",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black sm:col-span-2"
                />

                <input
                  required
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />

                <input
                  required
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) =>
                    updateField(
                      "state",
                      e.target.value
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />

                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) =>
                    updateField(
                      "pincode",
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  className="h-14 border border-black/15 bg-transparent px-4 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />
              </div>
            </div>

            {/* PAYMENT */}
            <div className="mt-10 border-t border-black/10 pt-8">
              <p className="text-[9px] uppercase tracking-[0.25em] text-black/40">
                03
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">
                Payment
              </h2>

              <div className="mt-6 border border-black bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-black/45">
                      Pay when your order arrives.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-black/35">
                Online payment will be available in
                the full version.
              </p>
            </div>

            {/* ERROR */}
            {orderError && (
              <div className="mt-8 border border-red-300 bg-red-50 px-4 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
                  {orderError}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <aside className="border border-black/10 bg-white">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-6">
              <h2 className="text-xl font-black uppercase tracking-[-0.04em]">
                Your Bag
              </h2>

              <p className="text-[8px] uppercase tracking-[0.25em] text-black/40">
                {totalItems}{" "}
                {totalItems === 1
                  ? "Item"
                  : "Items"}
              </p>
            </div>

            {/* ITEMS */}
            <div className="divide-y divide-black/10">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 p-5"
                >
                  <div className="h-28 w-24 shrink-0 overflow-hidden bg-black/5">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[10px] font-bold uppercase leading-4">
                      {item.product.name}
                    </p>

                    <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-black/40">
                      Size: {item.size}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-black/40">
                      Qty: {item.quantity}
                    </p>

                    <p className="mt-auto pt-4 text-sm font-bold">
                      ₹
                      {(
                        Number(
                          item.product.price
                        ) *
                        Number(item.quantity)
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="border-t border-black/10 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/50">
                  Subtotal
                </span>

                <span className="text-sm">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-black/50">
                  Shipping
                </span>

                <span className="text-sm">
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping}`}
                </span>
              </div>

              <div className="my-6 border-t border-black/10" />

              <div className="flex items-end justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
                  Total
                </span>

                <span className="text-3xl font-black tracking-[-0.05em]">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  items.length === 0
                }
                className="mt-7 flex h-16 w-full items-center justify-center gap-3 bg-black text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Placing Order
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="mt-6 text-center text-[8px] leading-4 uppercase tracking-[0.15em] text-black/30">
                By placing your order, you agree
                to FABRICE&apos;s terms and
                conditions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}