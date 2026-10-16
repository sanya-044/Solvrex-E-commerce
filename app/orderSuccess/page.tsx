"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#fbf4f2] px-5 text-[#26231f] sm:px-8">
      <div className="w-full max-w-2xl text-center">

        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
          VELMORI / ORDER CONFIRMED
        </p>

        <h1 className="mt-6 text-6xl font-medium leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
          Thank You.
        </h1>

        <p className="mx-auto mt-8 max-w-md text-sm leading-6 text-black/50">
          Your order has been placed successfully.
          We&apos;ll send you the order details and
          tracking information shortly.
        </p>

        <div className="mt-10 flex justify-center gap-3">

          <Link
            href="/"
            className="border border-black px-7 py-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-[#26231f] hover:text-white"
          >
            Back Home
          </Link>

          <Link
            href="/shop"
            className="bg-[#26231f] px-7 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
}