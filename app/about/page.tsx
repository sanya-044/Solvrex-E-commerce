import Link from "next/link";

const values = [
  {
    number: "01",
    title: "Designed",
    text: "Clean silhouettes, considered details and pieces made to become part of your everyday wardrobe.",
  },
  {
    number: "02",
    title: "Intentional",
    text: "We keep things simple. Every piece has a purpose, every collection has a point of view.",
  },
  {
    number: "03",
    title: "Yours",
    text: "VELMORI is a canvas for your style. Wear it your way, make it your own.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#0a0a0a]">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="border-b border-black/10 px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">

        <div className="mx-auto max-w-[1600px]">

          <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-black/40">
            VELMORI / ABOUT
          </p>

          <h1 className="max-w-[1200px] text-6xl font-black uppercase leading-[0.82] tracking-[-0.08em] sm:text-7xl lg:text-[10rem]">
            Made for
            <br />
            movement.
          </h1>

        </div>

      </section>

      {/* =====================================
          INTRO
      ===================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32">

        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[220px_1fr]">

          <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
            Our Story
          </p>

          <div className="max-w-[1000px]">

            <p className="text-3xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-6xl">
              VELMORI is a contemporary clothing
              label built around one simple idea:
              great clothes should feel effortless.
            </p>

            <p className="mt-10 max-w-2xl text-sm leading-7 text-black/50">
              We create everyday pieces that sit
              somewhere between comfort and character.
              Clean enough for every day, distinctive
              enough to feel like yours.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================
          EDITORIAL IMAGE
      ===================================== */}

      <section className="px-5 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-[1600px]">

          <div className="relative aspect-[16/8] overflow-hidden bg-black">

            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=90"
              alt="VELMORI editorial"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute bottom-7 left-7 text-white sm:bottom-10 sm:left-10">

              <p className="text-[9px] uppercase tracking-[0.3em] text-white/60">
                VELMORI / 2026
              </p>

              <p className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] sm:text-5xl">
                The new standard.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          VALUES
      ===================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32">

        <div className="mx-auto max-w-[1600px]">

          <div className="mb-12">

            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">
              What We Believe
            </p>

          </div>

          <div className="grid border-t border-black/10 md:grid-cols-3">

            {values.map((value) => (
              <div
                key={value.number}
                className="border-b border-black/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
              >

                <p className="text-[9px] tracking-[0.2em] text-black/35">
                  {value.number}
                </p>

                <h2 className="mt-8 text-3xl font-black uppercase tracking-[-0.06em]">
                  {value.title}
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-black/50">
                  {value.text}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================
          PHILOSOPHY
      ===================================== */}

      <section className="border-y border-black/10 bg-[#e9e6df] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">

        <div className="mx-auto max-w-[1400px]">

          <p className="text-center text-[9px] uppercase tracking-[0.3em] text-black/40">
            The VELMORI Philosophy
          </p>

          <h2 className="mt-10 text-center text-5xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-[9rem]">
            Less noise.
            <br />
            More character.
          </h2>

          <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-7 text-black/50">
            We believe clothing should complement the
            person wearing it — not compete with them.
            That&apos;s why VELMORI focuses on timeless
            silhouettes, strong materials and details
            that reward a closer look.
          </p>

        </div>

      </section>

      {/* =====================================
          CTA
      ===================================== */}

      <section className="bg-[#0a0a0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36">

        <div className="mx-auto max-w-[1100px] text-center">

          <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
            Ready when you are
          </p>

          <h2 className="mt-7 text-5xl font-black uppercase leading-[0.85] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
            Find your
            <br />
            uniform.
          </h2>

          <p className="mx-auto mt-7 max-w-md text-sm leading-6 text-white/45">
            Explore the latest VELMORI collection and
            find pieces made for your everyday.
          </p>

          <Link
            href="/shop"
            className="mt-10 inline-flex bg-white px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-80"
          >
            Explore Collection
          </Link>

        </div>

      </section>

    </main>
  );
}