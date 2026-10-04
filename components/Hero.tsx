"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

type SlideTheme = "dark" | "light";

interface Slide {
  number: string;
  eyebrow: string;
  title: string[];
  description: string;
  image: string;
  theme: SlideTheme;
  titleSize?: string; // optional per-slide font size override
  buttons: {
    label: string;
    href: string;
    primary?: boolean;
  }[];
}

const slides: Slide[] = [
  {
    number: "01",
    eyebrow: "THE EVERYDAY REBELLION",
    title: ["WEAR", "THE", "UNEXPECTED."],
    description: "Modern essentials for the way you move.",
    image: "/images/hero/hero-01.webp",
    theme: "dark",
    titleSize: "clamp(48px,4.8vw,82px)",
    buttons: [
      { label: "SHOP MEN", href: "/category/men", primary: true },
      { label: "SHOP WOMEN", href: "/category/women" }
    ]
  },
  {
    number: "02",
    eyebrow: "NEW SEASON",
    title: ["MAKE", "YOUR", "MOVE."],
    description: "Modern silhouettes designed for wherever the day takes you.",
    image: "/images/hero/hero-02.webp",
    theme: "dark",
    buttons: [
      { label: "EXPLORE COLLECTION", href: "/shop", primary: true }
    ]
  },
  {
    number: "03",
    eyebrow: "THE NEXT EDIT",
    title: ["BUILT", "FOR", "EVERYDAY."],
    description: "Essential pieces. Refined proportions. Made for real life.",
    image: "/images/hero/hero-03.webp",
    theme: "light",
    buttons: [
      { label: "DISCOVER COLLECTION", href: "/shop", primary: true }
    ]
  }
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const setNavTheme = useUIStore((state) => state.setNavTheme);

  // Sync nav theme with active slide
  useEffect(() => {
    setNavTheme(slides[activeSlide].theme);
  }, [activeSlide, setNavTheme]);

  // Autoplay functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-[#111111]">
      
      {/* IMAGES & CROSSFADE */}
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        return (
          <div 
            key={slide.number}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            <div className={`w-full h-full transform transition-transform duration-[6000ms] ease-out ${isActive ? "scale-100" : "scale-[1.03]"}`}>
              <Image 
                src={slide.image} 
                alt={slide.title.join(" ")}
                fill
                priority={index === 0}
                className="object-cover object-center lg:object-[center_20%]"
                sizes="100vw"
                quality={100}
                unoptimized={true}
              />
              {/* Optional very subtle gradient overlay for text readability based on theme */}
              <div className={`absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent ${slide.theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          </div>
        );
      })}

      {/* FOREGROUND CONTENT */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          const isDarkTheme = slide.theme === "dark";
          const textColor = isDarkTheme ? "text-[#111111]" : "text-[#F5F2EC]";
          
          return (
            <div 
              key={`content-${slide.number}`}
              className={`absolute inset-0 flex flex-col justify-center px-6 md:px-[75px] transition-all duration-1000 delay-300 ${isActive ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
            >
              <div className={`max-w-[450px] lg:ml-[2vw] ${textColor}`}>
                
                {/* EYEBROW */}
                <p className="text-[10px] md:text-[11px] font-[500] uppercase tracking-[0.3em] mb-6">
                  {slide.eyebrow}
                </p>

                {/* TITLE */}
                <h1 
                  className="font-black uppercase leading-[0.85] tracking-[-0.06em] mb-8"
                  style={{ fontSize: slide.titleSize ?? "clamp(64px,7vw,110px)" }}
                >
                  {slide.title.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </h1>

                {/* DESCRIPTION */}
                <p className={`text-[13px] md:text-[14px] leading-[1.6] mb-10 max-w-[380px] ${isDarkTheme ? "text-[#111111]/80" : "text-[#F5F2EC]/80"}`}>
                  {slide.description}
                </p>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {slide.buttons.map((btn, i) => {
                    const isPrimary = btn.primary;
                    // Button styling logic based on theme and primary/secondary
                    let btnClasses = "group flex items-center justify-center gap-3 h-[48px] md:h-[50px] px-7 text-[10px] md:text-[11px] font-[600] uppercase tracking-[0.12em] transition-all duration-300 rounded-[1px]";
                    
                    if (isDarkTheme) {
                      if (isPrimary) {
                        btnClasses += " bg-[#111111] text-[#F5F2EC] hover:bg-[#111111]/80";
                      } else {
                        btnClasses += " bg-transparent text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#F5F2EC]";
                      }
                    } else {
                      if (isPrimary) {
                        btnClasses += " bg-[#F5F2EC] text-[#111111] hover:bg-white";
                      } else {
                        btnClasses += " bg-transparent text-[#F5F2EC] border border-[#F5F2EC] hover:bg-[#F5F2EC] hover:text-[#111111]";
                      }
                    }

                    return (
                      <Link key={i} href={btn.href} className={btnClasses}>
                        {btn.label}
                        <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    );
                  })}
                </div>

              </div>
            </div>
          );
        })}

        {/* UI OVERLAYS - Always visible */}
        



        {/* SCROLL INDICATOR (Bottom Center) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
          {slides.map((slide, index) => (
             <div 
               key={`scroll-${slide.number}`}
               className={`flex flex-col items-center gap-2 absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity duration-700 whitespace-nowrap
               ${slide.theme === 'dark' ? 'text-[#111111]' : 'text-[#F5F2EC]'}
               ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
             >
               <span className="text-[9px] uppercase tracking-[0.25em] font-medium">Scroll to explore</span>
               <ArrowDown size={14} strokeWidth={1.5} className="animate-bounce" />
             </div>
          ))}
        </div>

        {/* BOTTOM RIGHT CONTROLS & PROGRESS */}
        <div className="absolute bottom-8 right-6 md:right-[75px] flex items-center gap-12 pointer-events-auto">
          
          {/* Progress Lines */}
          <div className="flex gap-2">
            {slides.map((slide, index) => {
               const isActive = index === activeSlide;
               const currentTheme = slides[activeSlide].theme;
               const bgColor = currentTheme === 'dark' ? 'bg-[#111111]' : 'bg-[#F5F2EC]';
               
               return (
                 <div key={`progress-${index}`} className={`h-[1px] transition-all duration-500 ease-out ${isActive ? `w-8 ${bgColor}` : `w-4 ${bgColor}/30`}`} />
               );
            })}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-4">
             <button 
               onClick={handlePrev} 
               className={`transition-opacity hover:opacity-50 ${slides[activeSlide].theme === 'dark' ? 'text-[#111111]' : 'text-[#F5F2EC]'}`}
               aria-label="Previous slide"
             >
               <ArrowLeft size={20} strokeWidth={1.2} />
             </button>
             <button 
               onClick={handleNext} 
               className={`transition-opacity hover:opacity-50 ${slides[activeSlide].theme === 'dark' ? 'text-[#111111]' : 'text-[#F5F2EC]'}`}
               aria-label="Next slide"
             >
               <ArrowRight size={20} strokeWidth={1.2} />
             </button>
          </div>
        </div>

      </div>
    </section>
  );
}