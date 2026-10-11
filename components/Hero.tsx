import Link from "next/link";

const collageTiles = [
  "collage-tile-one",
  "collage-tile-two",
  "collage-tile-three",
  "collage-tile-four",
  "collage-tile-five",
  "collage-tile-six",
];

export default function Hero() {
  return (
    <div className="hero-experience relative isolate overflow-hidden bg-[#f8efee] text-[#292421]">
      <section className="hero-sequence absolute inset-0 isolate overflow-hidden" aria-label="The Velmori jacket collection">
        <div className="hero-model-stage pointer-events-none absolute inset-x-0 top-[3%] bottom-[2%] z-10 overflow-hidden" aria-hidden="true">
          <img
            src="/Images/campaign-model-base.png"
            alt=""
            className="hero-model-base absolute left-[58%] top-0 h-full w-auto max-w-none -translate-x-1/2 object-contain object-top"
            fetchPriority="high"
          />
          <img src="/Images/campaign-look-ivory.png" alt="" className="hero-look hero-look-ivory absolute left-[58%] top-0 h-full w-auto max-w-none -translate-x-1/2 object-contain object-top" />
          <img src="/Images/campaign-look-navy.png" alt="" className="hero-look hero-look-navy absolute left-[58%] top-0 h-full w-auto max-w-none -translate-x-1/2 object-contain object-top" />
          <img src="/Images/campaign-look-suede.png" alt="" className="hero-look hero-look-suede absolute left-[58%] top-0 h-full w-auto max-w-none -translate-x-1/2 object-contain object-top" />
        </div>

        <div className="relative z-20 mx-auto h-full max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="absolute left-5 top-[50%] max-w-[136px] sm:left-8 sm:top-[50%] sm:max-w-[170px] lg:left-12 lg:max-w-[190px]">
            <p className="mb-3 text-[8px] uppercase tracking-[0.19em] text-[#705b58]/75 sm:mb-4 sm:text-[9px]">VELMORI · 01 / 03</p>
            <h1 className="font-serif text-[clamp(1.35rem,2.5vw,2.15rem)] font-normal uppercase leading-[0.94] tracking-[-0.04em]">The<br />jacket<br />collection</h1>
            <Link href="/shop?category=Outerwear" className="mt-4 inline-flex items-center gap-2 border-b border-[#292421]/50 pb-1 text-[8px] uppercase tracking-[0.15em] transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#292421] sm:mt-6 sm:text-[9px]">
              View the edit <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 text-[8px] uppercase tracking-[0.15em] text-[#705b58]/70 sm:bottom-7 sm:left-8 lg:bottom-9 lg:left-12">
            <span className="h-px w-5 bg-[#705b58]/45" /><span>Made for your everyday</span>
          </div>
          <div className="absolute bottom-5 right-5 z-20 text-[8px] uppercase tracking-[0.15em] text-[#705b58]/70 sm:bottom-7 sm:right-8 lg:bottom-9 lg:right-12">Spring / Summer · 2026</div>
        </div>
      </section>

      <section className="hero-collage absolute inset-0 overflow-hidden bg-[#e9e0dc]" aria-label="Velmori editorial portrait">
        <div className="hero-collage-frame absolute inset-0 overflow-hidden">
          <picture className="absolute inset-0 block h-full w-full">
            <source media="(max-width: 639px)" srcSet="/Images/campaign-collage-mobile.png" />
            <img src="/Images/campaign-collage-landscape.png" alt="Model in a relaxed grey sweatshirt against an architectural concrete wall" className="hero-collage-image absolute inset-0 h-full w-full object-cover object-[center_top]" />
          </picture>
          <div className="hero-collage-tiles absolute inset-0 grid grid-cols-3 grid-rows-2" aria-hidden="true">
            {collageTiles.map((tile) => <div key={tile} className={`hero-collage-tile ${tile}`} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
