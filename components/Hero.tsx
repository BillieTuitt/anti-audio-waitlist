"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import type { Track } from "@/lib/tracks";
import { COPY } from "@/lib/copy";
import { usePlayer } from "@/components/PlayerProvider";

// Slots around the ring. Fewer tracks than this just repeat to fill it.
const MIN_SLOTS = 12;

export function Hero({ tracks }: { tracks: Track[] }) {
  const { play, isActive, open } = usePlayer();
  const rootRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const slots = useMemo(() => {
    if (tracks.length === 0) return [];
    const count = Math.max(MIN_SLOTS, tracks.length);
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      track: tracks[i % tracks.length],
      angle: (360 / count) * i,
    }));
  }, [tracks]);

  // Entrance, plus the slow drift of the script line.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.from("[data-hero-art]", {
        opacity: 0,
        scale: 0.6,
        y: 24,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.05,
        delay: 0.1,
        clearProps: "opacity,transform",
      });
      gsap.from("[data-hero-centre]", { opacity: 0, scale: 0.85, duration: 1.2, ease: "power3.out" });
      gsap.from("[data-hero-fade]", { opacity: 0, duration: 1.4, ease: "power1.out", delay: 0.3 });
      // Two identical groups side by side; sliding one group's width loops seamlessly.
      gsap.fromTo(scriptRef.current, { xPercent: 0 }, { xPercent: -50, duration: 90, ease: "none", repeat: -1 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  function handleClick(track: Track, el: HTMLButtonElement) {
    play(track);

    // Briefly blur everything except the clicked artwork.
    const others = Array.from(carouselRef.current?.querySelectorAll<HTMLElement>(".slot-btn") ?? []).filter(
      (btn) => btn !== el && btn.dataset.trackId !== track.id,
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf(others);
    gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .to(others, { filter: "blur(7px)", opacity: 0.4, transition: "none", duration: 0.3, ease: "power2.out" })
      .to(others, {
        filter: "blur(0px)",
        opacity: 1,
        duration: 0.7,
        ease: "power2.inOut",
        delay: 0.45,
        clearProps: "filter,opacity,transition",
      });
  }

  return (
    <section ref={rootRef} className="hero relative h-[100svh] min-h-[560px] w-full overflow-hidden" aria-label="Featured tracks">
      <div
        aria-hidden
        data-hero-fade
        className="pointer-events-none absolute left-0 top-[28%] z-0 w-full select-none overflow-hidden"
      >
        <div
          ref={scriptRef}
          className="flex w-max whitespace-nowrap font-display text-[clamp(64px,15vw,220px)] font-bold leading-none text-white/35"
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 gap-[0.35em] pr-[0.35em]">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i}>{COPY.scriptLine}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p
        data-hero-fade
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 font-mono text-[11px] tracking-wide text-ink/60 [text-orientation:mixed] [writing-mode:vertical-rl] rotate-180 sm:left-6"
      >
        {COPY.tagline}
      </p>

      <div className="arc-mask absolute inset-0 z-10">
        <div ref={carouselRef} className="carousel">
          {slots.map(({ key, track, angle }) => (
            <div key={key} className="slot" style={{ ["--a" as string]: `${angle}deg` }}>
              <div className="counter">
                <button
                  type="button"
                  data-track-id={track.id}
                  data-playing={isActive(track.id)}
                  className="slot-btn"
                  aria-label={`Preview ${track.title}`}
                  onClick={(e) => handleClick(track, e.currentTarget)}
                >
                  <span data-hero-art className="block h-full w-full">
                    <img src={track.artwork} alt="" draggable={false} />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[var(--cy)] z-20 -translate-x-1/2 -translate-y-1/2">
        <div data-hero-centre className="flex flex-col items-center text-center">
          <img src="/brand/logo-wordmark.svg" alt="Anti Audio" style={{ width: "var(--wm)" }} />
          <h1
            className="mt-5 text-balance font-display font-bold leading-[1.05] sm:mt-6"
            style={{ width: "var(--heading-w)", fontSize: "clamp(18px, 2.4vw, 34px)" }}
          >
            {COPY.heroHeading}
          </h1>
        </div>
      </div>

      <p
        data-hero-fade
        className="absolute bottom-7 left-0 right-0 z-20 text-center font-mono text-[11px] tracking-wide text-ink/55 transition-opacity duration-500"
        style={{ opacity: open ? 0 : undefined }}
      >
        {COPY.hint}
      </p>
    </section>
  );
}
