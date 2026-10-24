"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT } from "@/lib/copy";

export function About() {
  const rootRef = useRef<HTMLElement>(null);
  // Which genre pair's image fan is open. Only used on touch screens, where there is no hover:
  // a tap opens it and a second tap (or a tap anywhere else) closes it.
  const [openPair, setOpenPair] = useState<number | null>(null);

  useEffect(() => {
    if (openPair === null) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".genre-pair")) setOpenPair(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [openPair]);

  function togglePair(index: number) {
    if (!window.matchMedia("(hover: none)").matches) return;
    setOpenPair((current) => (current === index ? null : index));
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(".about-hl-bar", { scaleX: 1 });
        return;
      }

      // Headline fills in word by word as it scrolls through, then the highlights sweep in.
      const statementTl = gsap.timeline({
        scrollTrigger: { trigger: "[data-about-statement]", start: "top 82%", end: "bottom 55%", scrub: 0.6 },
      });
      statementTl.to(".about-word", { opacity: 1, duration: 1, stagger: 0.14, ease: "none" });
      statementTl.to(".about-hl-bar", { scaleX: 1, duration: 1.2, stagger: 0.6, ease: "power2.out" }, ">-1.4");

      for (const selector of ["[data-subline]", "[data-genres-para]"]) {
        gsap.from(selector, {
          y: 28,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: selector, start: "top 90%" },
        });
      }
    }, root);

    // Owners loads late and shifts the layout; re-measure once it has.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" aria-label="About" className="relative py-24 sm:py-36">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink">
          <span aria-hidden className="h-2 w-2 bg-accent shadow-[0_0_0_1px_rgba(21,22,27,0.25)]" />
          {ABOUT.eyebrow}
        </p>

        <h2
          data-about-statement
          className="mt-8 font-display text-[clamp(36px,7.4vw,120px)] font-black uppercase leading-[0.94] tracking-[-0.01em] sm:mt-12"
        >
          {ABOUT.statement.map((part, i) =>
            part.text.split(" ").map((word, w) =>
              part.hl ? (
                // Highlighted words keep full ink; a yellow bar behind each one sweeps in on scroll.
                <span
                  key={`${i}-${w}`}
                  className="relative isolate -ml-[0.1em] mr-[0.22em] inline-block px-[0.1em] text-[#15161B]"
                >
                  <span
                    aria-hidden
                    className="about-hl-bar absolute inset-x-0 bottom-[var(--hl-bottom)] top-[var(--hl-top)] -z-10 origin-left scale-x-0 bg-accent"
                  />
                  {word}
                </span>
              ) : (
                <span key={`${i}-${w}`} className="about-word mr-[0.22em] inline-block">
                  {word}
                </span>
              ),
            ),
          )}
        </h2>

        <p
          data-subline
          className="mt-10 max-w-[42ch] font-sans text-[clamp(22px,2.6vw,40px)] leading-[1.3] text-ink/80 sm:mt-14"
        >
          {ABOUT.subline}
        </p>

        <p
          data-genres-para
          className="mt-10 max-w-[42ch] font-sans text-[clamp(22px,2.6vw,40px)] leading-[1.3] text-ink/80 sm:mt-16"
        >
          {ABOUT.genres.map((part, i) =>
            "pair" in part ? (
              <span
                key={i}
                className="genre-pair"
                tabIndex={0}
                role="button"
                aria-expanded={openPair === i}
                data-open={openPair === i}
                onClick={() => togglePair(i)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpenPair(null);
                }}
              >
                <span className="font-medium text-ink underline decoration-dashed decoration-2 underline-offset-[0.22em] transition-colors hover:decoration-accent">
                  {part.pair}
                </span>
                <span aria-hidden className="genre-fan">
                  {part.images.map((src) => (
                    <img key={src} src={src} alt="" draggable={false} />
                  ))}
                </span>
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
      </div>
    </section>
  );
}
