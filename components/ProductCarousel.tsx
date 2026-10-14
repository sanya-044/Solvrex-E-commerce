"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

type ProductCarouselProps = {
  products: Product[];
};

export default function ProductCarousel({
  products,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  // Drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  /*
   * -------------------------
   * UPDATE PROGRESS
   * -------------------------
   */
  const updateProgress = () => {
    const container = containerRef.current;

    if (!container) return;

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    if (maxScroll <= 0) {
      setProgress(0);
      return;
    }

    setProgress(
      (container.scrollLeft / maxScroll) * 100
    );
  };

  /*
   * -------------------------
   * ARROW SCROLL
   * -------------------------
   */
  const scrollProducts = (
    direction: "left" | "right"
  ) => {
    const container = containerRef.current;

    if (!container) return;

    const amount =
      container.clientWidth * 0.75;

    container.scrollBy({
      left:
        direction === "right"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  };

  /*
   * -------------------------
   * MOUSE WHEEL
   * -------------------------
   *
   * Normal vertical wheel movement
   * becomes horizontal movement.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      /*
       * Only convert vertical wheel movement.
       * Trackpad horizontal scrolling is left alone.
       */
      if (
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX)
      ) {
        event.preventDefault();

        container.scrollLeft +=
          event.deltaY;
      }
    };

    container.addEventListener(
      "wheel",
      handleWheel,
      { passive: false }
    );

    return () => {
      container.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  /*
   * -------------------------
   * MOUSE DRAG
   * -------------------------
   */
  const handleMouseDown = (
    event: React.MouseEvent
  ) => {
    const container = containerRef.current;

    if (!container) return;

    isDragging.current = true;

    startX.current =
      event.pageX -
      container.offsetLeft;

    startScrollLeft.current =
      container.scrollLeft;

    container.classList.add(
      "cursor-grabbing"
    );
  };

  const handleMouseMove = (
    event: React.MouseEvent
  ) => {
    if (!isDragging.current) return;

    const container = containerRef.current;

    if (!container) return;

    event.preventDefault();

    const x =
      event.pageX -
      container.offsetLeft;

    const distance =
      (x - startX.current) * 1.2;

    container.scrollLeft =
      startScrollLeft.current -
      distance;
  };

  const stopDragging = () => {
    const container = containerRef.current;

    isDragging.current = false;

    container?.classList.remove(
      "cursor-grabbing"
    );
  };

  return (
    <div className="relative">

      {/* ================================= */}
      {/* PRODUCT TRACK */}
      {/* ================================= */}

      <div
        ref={containerRef}
        onScroll={updateProgress}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="
          flex
          gap-5
          overflow-x-auto
          overflow-y-hidden
          pb-6
          snap-x
          snap-mandatory
          scrollbar-hide
          cursor-grab
          select-none
        "
      >

        {/* PRODUCTS */}

        {products.slice(0, 4).map(
          (product) => (
            <div
              key={product.id}
              className="
                w-[82vw]
                flex-shrink-0
                snap-start

                sm:w-[47vw]
                md:w-[31vw]
                lg:w-[21vw]
                xl:w-[19vw]
              "
            >
              <ProductCard
                product={product}
              />
            </div>
          )
        )}

        {/* ================================= */}
        {/* VIEW ALL */}
        {/* ================================= */}

        <a
          href="/shop"
          draggable={false}
          className="
            group
            flex
            aspect-[3/4]
            min-h-[300px]
            w-[82vw]
            flex-shrink-0
            snap-start
            items-center
            justify-center
            bg-[#e9e6df]
            px-6

            sm:w-[47vw]
            md:w-[31vw]
            lg:w-[21vw]
            xl:w-[19vw]

            transition-colors
            duration-300

            hover:bg-black
            hover:text-white
          "
        >
          <div className="flex flex-col items-center text-center">

            <span
              className="
                mb-5
                whitespace-nowrap
                text-[9px]
                uppercase
                tracking-[0.25em]
                text-black/45
                group-hover:text-white/50
              "
            >
              Explore the full collection
            </span>

            <span
              className="
                flex
                items-center
                gap-3
                text-xl
                font-bold
                uppercase
                tracking-[-0.04em]
              "
            >
              View All

              <ArrowUpRight
                size={22}
                strokeWidth={1.3}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </span>

          </div>
        </a>

      </div>

      {/* ================================= */}
      {/* CONTROLS */}
      {/* ================================= */}

      <div className="mt-5 flex items-center justify-between">

        {/* Progress */}
        <div
          className="
            relative
            h-[2px]
            w-full
            max-w-[280px]
            overflow-hidden
            bg-black/10
          "
        >
          <div
            className="
              absolute
              inset-y-0
              left-0
              bg-black
              transition-[width]
              duration-150
            "
            style={{
              width: `${Math.max(
                8,
                progress
              )}%`,
            }}
          />
        </div>

        {/* Arrows */}
        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              scrollProducts("left")
            }
            aria-label="Previous products"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              border
              border-black/15
              transition-colors
              hover:bg-black
              hover:text-white
            "
          >
            <ArrowLeft
              size={17}
              strokeWidth={1.3}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              scrollProducts("right")
            }
            aria-label="Next products"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              border
              border-black/15
              transition-colors
              hover:bg-black
              hover:text-white
            "
          >
            <ArrowRight
              size={17}
              strokeWidth={1.3}
            />
          </button>

        </div>
      </div>

      {/* Hint */}

      <p
        className="
          mt-3
          hidden
          text-[9px]
          uppercase
          tracking-[0.25em]
          text-black/35
          md:block
        "
      >
        Drag · Scroll · Explore
      </p>

    </div>
  );
}