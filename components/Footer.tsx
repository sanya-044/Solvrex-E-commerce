import Link from "next/link";

const shopLinks = [
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "New Arrivals", href: "/shop" },
  { label: "Collections", href: "/shop" },
];

const helpLinks = [
  { label: "Shipping", href: "#" },
  { label: "Returns", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
];

const brandLinks = [
  { label: "About VELMORI", href: "/about" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Your Bag", href: "/cart" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">

      {/* =====================================
          MAIN FOOTER
      ===================================== */}

      <div className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">

        <div className="mx-auto max-w-[1600px]">

          <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

            {/* BRAND */}

            <div>

              <Link
                href="/"
                className="text-4xl font-black tracking-[-0.08em]"
              >
                VELMORI
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/40">
                Contemporary clothing for the way
                you move. Clean silhouettes,
                considered details and everyday
                essentials.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-white"
              >
                Explore Collection →
              </Link>

            </div>

            {/* SHOP */}

            <div>

              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
                Shop
              </p>

              <nav className="flex flex-col gap-4">

                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-[10px] uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

              </nav>

            </div>

            {/* HELP */}

            <div>

              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
                Help
              </p>

              <nav className="flex flex-col gap-4">

                {helpLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-[10px] uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

              </nav>

            </div>

            {/* VELMORI */}

            <div>

              <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
                VELMORI
              </p>

              <nav className="flex flex-col gap-4">

                {brandLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-[10px] uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

              </nav>

            </div>

          </div>

          {/* =====================================
              NEWSLETTER
          ===================================== */}

          <div className="mt-16 border-t border-white/10 pt-12">

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

              <div>

                <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                  Stay in the loop
                </p>

                <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] sm:text-4xl">
                  Get the latest.
                </h2>

              </div>

              <div className="flex w-full max-w-lg gap-2">

                <input
                  type="email"
                  placeholder="Your email address"
                  className="h-12 min-w-0 flex-1 border border-white/15 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white"
                />

                <button
                  type="button"
                  className="h-12 bg-white px-6 text-[9px] font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-80"
                >
                  Subscribe
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          BOTTOM BAR
      ===================================== */}

      <div className="border-t border-white/10 px-5 py-6 sm:px-8 lg:px-12">

        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">
            © 2026 VELMORI. All rights reserved.
          </p>

          <div className="flex gap-6">

            <button
              type="button"
              className="text-[8px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
            >
              Privacy
            </button>

            <button
              type="button"
              className="text-[8px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
            >
              Terms
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}