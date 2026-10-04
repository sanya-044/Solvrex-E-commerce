"use client";

import { useRef, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Category {
  id: number;
  name: string;
  label: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
}

interface GarmentConfig {
  x: number;        // horizontal offset percentage
  y: number;        // vertical offset percentage
  scale: number;    // scale factor
}

const categories: Category[] = [
  {
    id: 1,
    name: "SHIRTS",
    label: "01",
    description: "Refined silhouettes designed for\neveryday movement.",
    cta: "SHOP SHIRTS",
    href: "/category/shirts",
    image: "/images/category/category-01-shirts.webp",
    alt: "Velmori shirt",
  },
  {
    id: 2,
    name: "T-SHIRTS",
    label: "02",
    description: "Essentials reimagined.\nComfort meets contemporary.",
    cta: "SHOP T-SHIRTS",
    href: "/category/t-shirts",
    image: "/images/category/category-02-tshirts.webp",
    alt: "Velmori black t-shirt",
  },
  {
    id: 3,
    name: "HOODIES",
    label: "03",
    description: "Layered luxury for laid-back\nmoments.",
    cta: "SHOP HOODIES",
    href: "/category/hoodies",
    image: "/images/category/category-03-hoodies.webp",
    alt: "Velmori grey hoodie",
  },
  {
    id: 4,
    name: "TROUSERS",
    label: "04",
    description: "Precision tailoring meets\nmodern ease.",
    cta: "SHOP TROUSERS",
    href: "/category/trousers",
    image: "/images/category/category-04-trousers.webp",
    alt: "Velmori trousers",
  },
];

// Per-garment calibrated positioning
// Based on visual alignment with the base model
const garmentConfig: Record<number, GarmentConfig> = {
  1: { x: 0, y: -12, scale: 0.48 },    // SHIRTS - align with chest/shoulders
  2: { x: 0, y: -15, scale: 0.42 },    // T-SHIRTS - higher on torso
  3: { x: 0, y: -8, scale: 0.52 },     // HOODIES - cover shoulders/chest
  4: { x: 0, y: 10, scale: 0.45 },     // TROUSERS - lower on waist/legs
};

export default function ShopByCategory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // GSAP animation setup
  useLayoutEffect(() => {
    if (prefersReducedMotion || !sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      // Get all garment layers
      const garments = gsap.utils.toArray<HTMLElement>(".garment-layer");

      // Create timeline for garment transitions
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stageRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update active category based on scroll progress
            const progress = self.progress;
            const newIndex = Math.floor(progress * categories.length);
            const actualIndex = Math.min(newIndex, categories.length - 1);
            
            if (actualIndex !== activeIndex) {
              setActiveIndex(actualIndex);
            }
          },
        },
      });

      // Animate garment layers
      garments.forEach((garment, idx) => {
        const categoryStart = (idx / categories.length) * 100;
        const categoryEnd = ((idx + 1) / categories.length) * 100;
        const midpoint = (categoryStart + categoryEnd) / 2;

        // Fade in
        tl.to(
          garment,
          {
            opacity: 1,
            duration: 0.3,
          },
          `${categoryStart}%`
        );

        // Hold
        tl.to(garment, { opacity: 1 }, `${midpoint - 5}%`);

        // Fade out
        tl.to(
          garment,
          {
            opacity: 0,
            duration: 0.3,
          },
          `${categoryEnd - 3}%`,
          "<"
        );
      });

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, activeIndex]);

  const activeCategory = categories[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F4F1EB]"
      style={{ height: "400vh" }}
      aria-label="Shop by category"
    >
      {/* PINNED STAGE */}
      <div
        ref={stageRef}
        className="sticky top-0 w-full h-[100vh] overflow-hidden bg-[#F4F1EB]"
      >
        {/* GRID LAYOUT: LEFT CONTENT / RIGHT VISUAL */}
        <div className="relative w-full h-full flex flex-col lg:flex-row">
          {/* LEFT SIDE - EDITORIAL CONTENT (z-20) */}
          <div className="absolute top-0 left-0 lg:relative lg:flex-none w-full lg:w-[35%] h-auto lg:h-full flex flex-col justify-between px-6 pt-12 pb-16 md:px-12 md:pt-16 lg:px-16 lg:py-20 z-20 pointer-events-auto bg-[#F4F1EB]">
            {/* TOP SECTION */}
            <div>
              {/* EYEBROW */}
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.3em] text-[#6B6862] mb-6">
                03. SHOP BY CATEGORY
              </p>

              {/* CATEGORY TITLE */}
              <h2
                className="font-editorial font-normal uppercase leading-none tracking-[-0.02em] text-[#111111] mb-8 transition-all duration-500"
                style={{
                  fontSize: "clamp(3rem, 7vw, 5.5rem)",
                }}
              >
                {activeCategory.name}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-[14px] md:text-[15px] leading-[1.55] text-[#6B6862] mb-10 max-w-[280px] whitespace-pre-line transition-all duration-500">
                {activeCategory.description}
              </p>

              {/* CTA BUTTON */}
              <Link
                href={activeCategory.href}
                className="group inline-flex items-center gap-3 h-[48px] md:h-[50px] px-6 md:px-7 bg-[#111111] text-white text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 hover:opacity-80 rounded-[1px]"
              >
                {activeCategory.cta}
                <ArrowRight
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* CATEGORY NAVIGATION - DESKTOP */}
            <div className="hidden lg:flex flex-col gap-3">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className={`text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    idx === activeIndex
                      ? "text-[#111111] opacity-100"
                      : "text-[#6B6862] opacity-50"
                  }`}
                >
                  <span className="font-semibold">{cat.label}</span>
                  <span className="ml-4">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - MODEL & GARMENT CANVAS (z-0 to z-10) */}
          <div className="relative w-full lg:flex-1 h-full bg-[#F4F1EB]">
            {/* BASE MODEL (z-1) - Full-bleed background, never moves */}
            <div className="absolute inset-0 z-1">
              <Image
                src="/images/category/category-base.webp"
                alt="Velmori fashion model"
                fill
                priority
                quality={95}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* GARMENT LAYERS (z-2) - Animated opacity transitions */}
            {categories.map((category, idx) => {
              const config = garmentConfig[idx + 1];
              if (!config) return null;

              return (
                <div
                  key={category.id}
                  className="garment-layer absolute inset-0 z-2"
                  style={{ opacity: idx === 0 ? 1 : 0 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `translate(${config.x}%, ${config.y}%) scale(${config.scale})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={category.image}
                      alt={category.alt}
                      fill
                      quality={95}
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              );
            })}

            {/* TOP RIGHT - CATEGORY COUNTER (z-10) */}
            <div className="absolute top-8 right-6 md:top-12 md:right-12 lg:right-16 z-10 text-right pointer-events-none">
              <p className="text-[32px] md:text-[48px] lg:text-[56px] font-editorial font-normal tracking-[-0.02em] text-[#111111] leading-none">
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6862] mt-2">
                / {String(categories.length).padStart(2, "0")}
              </p>
            </div>

            {/* BOTTOM RIGHT - SCROLL INDICATOR (z-10) */}
            {!prefersReducedMotion && (
              <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12 lg:right-16 z-10 flex flex-col items-end gap-2 pointer-events-none">
                <p className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#6B6862]">
                  Scroll
                </p>
                <svg
                  className="w-4 h-4 text-[#6B6862] animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}

            {/* CATEGORY NAVIGATION - MOBILE/TABLET (z-10) */}
            <div className="absolute bottom-0 left-0 right-0 lg:hidden px-6 py-6 md:px-12 md:py-8 bg-gradient-to-t from-[#F4F1EB] to-transparent z-10">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`shrink-0 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                      idx === activeIndex
                        ? "text-[#111111] opacity-100"
                        : "text-[#6B6862] opacity-50"
                    }`}
                  >
                    <span className="font-semibold">{cat.label}</span>
                    <span className="ml-2">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR - SUBTLE BOTTOM (z-5) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#111111]/10 z-5">
          <div
            className="h-full bg-[#111111] transition-all duration-500"
            style={{
              width: `${(activeIndex + 1) * 25}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
