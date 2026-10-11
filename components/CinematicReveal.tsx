"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./CinematicReveal.module.css";

export default function CinematicReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let hasRevealed = false;
    let observer: IntersectionObserver | undefined;
    const reveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;
      setRevealed(true);
      observer?.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
    const checkVisibility = () => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.45 && bounds.bottom > window.innerHeight * 0.55) reveal();
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { threshold: 0.55 },
    );

    observer.observe(section);
    window.addEventListener("scroll", checkVisibility, { passive: true });
    checkVisibility();
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cinematic-reveal-title"
      className={styles.section}
      data-revealed={revealed}
    >
      <div className={styles.heading}>
        <p className={styles.kicker}>The spring / summer portrait</p>
        <h2 id="cinematic-reveal-title">A look, revealed.</h2>
      </div>

      <div
        className={styles.composition}
        role="img"
        aria-label="Hands hold and slowly open a full-screen navy jacket to reveal a stylish woman in a charcoal streetwear look."
      >
        <Image
          src="/Images/womenswear-streetwear-campaign.png"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className={styles.portrait}
        />
        <div className={styles.portraitTint} aria-hidden="true" />
        <div className={styles.jacketHalfLeft} aria-hidden="true">
          <Image src="/Images/campaign-jacket-held.png" alt="" width={1672} height={941} sizes="100vw" className={styles.jacketImage} />
        </div>
        <div className={styles.jacketHalfRight} aria-hidden="true">
          <Image src="/Images/campaign-jacket-held.png" alt="" width={1672} height={941} sizes="100vw" className={`${styles.jacketImage} ${styles.jacketImageRight}`} />
        </div>
        <span className={`${styles.sideNote} ${styles.sideNoteLeft}`} aria-hidden="true">VELMORI / WOMENSWEAR</span>
        <span className={`${styles.sideNote} ${styles.sideNoteRight}`} aria-hidden="true">SPRING / SUMMER 2026</span>
      </div>

      <p className={styles.caption}>Quiet confidence, in full color.</p>
    </section>
  );
}
