"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const panels = [
  {
    id: "his",
    eyebrow: ["FOR HIS", "JOURNEY."],
    heading: "HIS",
    description: "Everyday essentials.\nMinimal, functional\nand made to move\nwith you.",
    cta: "EXPLORE MEN",
    href: "/category/men",
    image: "/images/hero/His&Her/his.webp",
    alt: "Velmori men's fashion editorial",
    objectPosition: "object-[60%_20%]",
  },
  {
    id: "her",
    eyebrow: ["FOR HER", "EXPRESSION."],
    heading: "HER",
    description: "Effortless styles\nfor every mood.\nMade to feel like you.",
    cta: "EXPLORE WOMEN",
    href: "/category/women",
    image: "/images/hero/His&Her/her.webp",
    alt: "Velmori women's fashion editorial",
    objectPosition: "object-[40%_15%]",
  },
] as const;

export default function HisHer() {
  return (
    <section
      aria-label="Shop by gender"
      className="flex flex-col md:flex-row w-full min-h-[680px] md:h-[85vh]"
    >
      {panels.map((panel, idx) => (
        <article
          key={panel.id}
          className={`
            group relative flex-1 overflow-hidden
            h-[80vh] md:h-full
            ${idx === 0 ? "md:border-r md:border-white/10" : ""}
          `}
        >
          {/* IMAGE */}
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-[1.03]">
            <Image
              src={panel.image}
              alt={panel.alt}
              fill
              priority={idx === 0}
              quality={95}
              unoptimized
              className={`object-cover ${panel.objectPosition}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* OVERLAY — subtle, slightly stronger toward bottom-left text area */}
          <div
            className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.08) 100%)",
            }}
          />

          {/* CONTENT — anchored bottom-left */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:px-16 md:pb-16 lg:px-[72px] lg:pb-[72px]">

            {/* EYEBROW */}
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium uppercase tracking-[0.22em] text-white/80 leading-relaxed mb-4">
              {panel.eyebrow[0]}
              <br />
              {panel.eyebrow[1]}
            </p>

            {/* DECORATIVE LINE */}
            <div className="w-9 h-px bg-white/60 mb-5" />

            {/* HEADING — editorial serif */}
            <h2
              className="font-editorial font-normal uppercase leading-none tracking-[-0.02em] text-white mb-5"
              style={{ fontSize: "clamp(64px,7.5vw,108px)" }}
            >
              {panel.heading}
            </h2>

            {/* DESCRIPTION */}
            <p className="text-[13px] md:text-[14px] leading-[1.55] text-white/75 mb-7 max-w-[280px] whitespace-pre-line">
              {panel.description}
            </p>

            {/* CTA BUTTON */}
            <Link
              href={panel.href}
              className="
                group/btn inline-flex items-center gap-3
                h-[48px] md:h-[50px] px-6 md:px-7
                bg-white/95 text-[#111111]
                text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em]
                transition-all duration-300
                hover:bg-[#111111] hover:text-white
                w-fit rounded-[1px]
              "
            >
              {panel.cta}
              <ArrowRight
                size={13}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Link>

          </div>
        </article>
      ))}
    </section>
  );
}
