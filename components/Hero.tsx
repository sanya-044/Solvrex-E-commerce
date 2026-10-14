"use client";

import { ArrowDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    number: "01",
    label: "COLLECTION 01 — 2026",
    eyebrow: "THE EVERYDAY REBELLION",
    title: ["WEAR", "THE", "UNEXPECTED."],
    description:
      "Contemporary essentials designed for people who refuse to blend into the background.",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=90",
  },
  {
    number: "02",
    label: "COLLECTION 02 — AFTER DARK",
    eyebrow: "MADE FOR THE NIGHT",
    title: ["OWN", "THE", "NIGHT."],
    description:
      "Statement pieces built for late nights, city lights and everything in between.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2200&q=90",
  },
  {
    number: "03",
    label: "COLLECTION 03 — NEW SEASON",
    eyebrow: "A NEW PERSPECTIVE",
    title: ["MAKE", "YOUR", "MOVE."],
    description:
      "Relaxed silhouettes. Bold details. A wardrobe without the rules.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90",
  },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const animationFrame = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();

      const scrollableDistance =
        sectionRef.current.offsetHeight - window.innerHeight;

      const newProgress = Math.min(
        1,
        Math.max(0, -rect.top / scrollableDistance)
      );

      targetProgress.current = newProgress;
    };

    const animate = () => {
      const difference =
        targetProgress.current - currentProgress.current;

      currentProgress.current += difference * 0.09;

      if (Math.abs(difference) < 0.0001) {
        currentProgress.current = targetProgress.current;
      }

      setProgress(currentProgress.current);

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  /*
    3 slides = 0vw → 200vw
  */
  const horizontalOffset =
    progress * (slides.length - 1) * 100;

  /*
    Determine which collection is currently active.
  */
  const activeSlide = Math.min(
    slides.length - 1,
    Math.floor(progress * slides.length)
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* MOVING HERO TRACK */}
        <div
          className="flex h-full will-change-transform"
          style={{
            transform: `translate3d(-${horizontalOffset}vw, 0, 0)`,
          }}
        >
          {slides.map((slide) => (
            <article
              key={slide.number}
              className="relative h-full w-screen flex-shrink-0 overflow-hidden"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.label}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30" />
              </div>

              {/* Slide Content */}
              <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-16">

                {/* Main typography */}
                <div className="mt-24 max-w-[1200px]">
                  <p className="mb-5 text-[10px] uppercase tracking-[0.35em] sm:text-xs">
                    {slide.eyebrow}
                  </p>

                  <h1 className="text-[clamp(4rem,10vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
                    {slide.title.map((line) => (
                      <span
                        key={line}
                        className="block"
                      >
                        {line}
                      </span>
                    ))}
                  </h1>
                </div>

                {/* Bottom */}
                <div className="flex items-end justify-between gap-8">
                  <p className="hidden max-w-md text-xs leading-6 text-white/80 sm:block">
                    {slide.description}
                  </p>

                  <a
                    href="#new-arrivals"
                    className="group flex shrink-0 items-center gap-4 border border-white px-6 py-4 text-[9px] font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:text-black sm:px-8"
                  >
                    Explore Collection

                    <ArrowDownRight
                      size={16}
                      strokeWidth={1.5}
                      className="transition-transform duration-300 group-hover:rotate-[-45deg]"
                    />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* FIXED COLLECTION INDICATOR */}
        <div className="pointer-events-none absolute left-6 top-10 z-30 flex items-center gap-3 text-white sm:left-10 sm:top-14 lg:left-16 lg:top-16">
          <span className="h-px w-8 bg-white" />

          <span className="text-[10px] uppercase tracking-[0.3em] sm:text-xs">
            {slides[activeSlide].label}
          </span>
        </div>

        {/* FIXED SLIDE NUMBER */}
        <div className="pointer-events-none absolute right-6 top-10 z-30 text-[10px] tracking-[0.2em] text-white sm:right-10 sm:top-14 lg:right-16 lg:top-16">
          {slides[activeSlide].number} / 03
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-7 left-6 z-30 flex items-center gap-3 sm:left-10 lg:left-16">
          {slides.map((slide, index) => (
            <div
              key={slide.number}
              className="relative h-[2px] w-10 overflow-hidden bg-white/30"
            >
              <div
                className="absolute inset-y-0 left-0 bg-white transition-[width] duration-100"
                style={{
                  width:
                    index < activeSlide
                      ? "100%"
                      : index === activeSlide
                        ? `${Math.max(
                            15,
                            Math.min(
                              100,
                              (progress * slides.length - index) * 100
                            )
                          )}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 right-6 z-30 hidden items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white sm:flex">
          <span>Scroll to explore</span>
          <ArrowDownRight size={14} strokeWidth={1.2} />
        </div>
      </div>
    </section>
  );
}