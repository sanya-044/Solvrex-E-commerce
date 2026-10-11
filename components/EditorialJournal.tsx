import Image from "next/image";
import Link from "next/link";

const journalFrames = [
  {
    image: "/Images/campaign-collage-portrait.png",
    alt: "Model in a relaxed grey sweatshirt against a concrete wall",
    title: "Quiet confidence",
    note: "The everyday layer",
    position: "object-[center_35%]",
    fit: "cover",
    backdrop: "bg-[#e6ddda]",
  },
  {
    image: "/Images/campaign-model-navy.png",
    alt: "Model wearing a deep navy zip jacket",
    title: "After hours",
    note: "Navy, in focus",
    position: "object-center",
    fit: "contain",
    backdrop: "bg-[radial-gradient(ellipse_at_50%_38%,#354052_0%,#19202a_74%)]",
  },
  {
    image: "/Images/velmori-Auth-fashion.png",
    alt: "Two models in considered neutral and dark looks, seated in warm sunlight",
    title: "A softer rhythm",
    note: "Light in the details",
    position: "object-[center_35%]",
    fit: "cover",
    backdrop: "bg-[#0f4549]",
  },
  {
    image: "/Images/campaign-model-suede.png",
    alt: "Model wearing a warm brown suede jacket",
    title: "Texture study",
    note: "The suede jacket",
    position: "object-center",
    fit: "contain",
    backdrop: "bg-[radial-gradient(ellipse_at_50%_38%,#8c633e_0%,#453224_76%)]",
  },
  {
    image: "/Images/campaign-model-hoodie.png",
    alt: "Model in a charcoal hoodie against a dark studio background",
    title: "Off the clock",
    note: "Made to move",
    position: "object-center",
    fit: "contain",
    backdrop: "bg-[radial-gradient(ellipse_at_50%_40%,#393939_0%,#171717_76%)]",
  },
  {
    image: "/Images/loginPage-Image.jpg",
    alt: "A pair of models in tailored VELMORI looks",
    title: "In good company",
    note: "A considered pairing",
    position: "object-[left_35%]",
    fit: "cover",
    backdrop: "bg-[#181615]",
  },
];

export default function EditorialJournal() {
  return (
    <section aria-labelledby="editorial-journal-title" className="overflow-hidden border-y border-[#786a63]/20 bg-[#f8efee] py-14 text-[#292421] sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex items-end justify-between gap-6 px-5 sm:mb-10 sm:px-8 lg:px-12">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-[#705b58]/75 sm:text-[10px]">Notes on getting dressed</p>
            <h2 id="editorial-journal-title" className="font-serif text-4xl font-normal leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">The style journal</h2>
          </div>
          <span aria-hidden="true" className="hidden pb-1 text-[9px] uppercase tracking-[0.19em] text-[#705b58]/70 sm:block">01 — 06&nbsp;&nbsp; / &nbsp;&nbsp;VELMORI</span>
        </div>

        <div role="region" aria-roledescription="carousel" aria-label="VELMORI fashion editorial gallery. Six looks in a horizontal row." className="editorial-journal-track flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6f514b] sm:gap-4 sm:px-8 lg:gap-5 lg:px-12" tabIndex={0}>
          {journalFrames.map((frame, index) => (
            <Link
              key={frame.image}
              href="/shop?category=Outerwear"
              aria-label={`${frame.title} — ${frame.note}; explore outerwear`}
              className={`group relative block aspect-[0.73] w-[72vw] max-w-[310px] shrink-0 snap-start overflow-hidden ${frame.backdrop} outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#292421] sm:w-[36vw] lg:w-[calc((100vw-144px)/4.65)] lg:max-w-[340px]`}
            >
              <Image
                src={frame.image}
                alt={frame.alt}
                fill
                sizes="(max-width: 639px) 72vw, (max-width: 1023px) 36vw, 22vw"
                className={`${frame.fit === "contain" ? "object-contain" : "object-cover"} ${frame.position} transition-transform duration-700 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035]`}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#171412]/75 via-[#171412]/5 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <div className="absolute inset-x-4 bottom-4 text-[#fffaf7] sm:inset-x-5 sm:bottom-5">
                <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-white/80">{String(index + 1).padStart(2, "0")} / STYLE NOTES</p>
                <h3 className="font-serif text-[1.65rem] font-normal leading-[0.98] tracking-[-0.035em] sm:text-3xl">{frame.title}</h3>
                <p className="mt-2 text-[10px] uppercase tracking-[0.13em] text-white/85">{frame.note}</p>
              </div>
              <span aria-hidden="true" className="absolute right-4 top-4 grid h-8 w-8 place-items-center border border-white/60 text-base text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">↗</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 px-5 text-[9px] uppercase tracking-[0.14em] text-[#705b58]/75 sm:px-8 lg:px-12">
          <p>Swipe to explore&nbsp; →</p>
          <p>Tab to visit each look&nbsp; ↗</p>
        </div>
      </div>
    </section>
  );
}
