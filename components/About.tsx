"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Track } from "@/lib/tracks";
import { ABOUT } from "@/lib/copy";
import { usePlayer } from "@/components/PlayerProvider";

function Label({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink">
      <span aria-hidden className="h-2 w-2 bg-accent shadow-[0_0_0_1px_rgba(21,22,27,0.25)]" />
      {children}
    </p>
  );
}

export function About({ tracks }: { tracks: Track[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const { play, isActive } = usePlayer();

  // One card per genre, led by that genre's first track so a click previews it.
  const genres = useMemo(() => {
    const byGenre = new Map<string, { genre: string; count: number; track: Track }>();
    for (const track of tracks) {
      if (!track.genre) continue;
      const entry = byGenre.get(track.genre);
      if (entry) entry.count += 1;
      else byGenre.set(track.genre, { genre: track.genre, count: 1, track });
    }
    return [...byGenre.values()].sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  }, [tracks]);

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

      gsap.from("[data-subline]", {
        y: 28,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-subline]", start: "top 90%" },
      });

      // Pillars: the top rule draws across, then the copy rises in.
      gsap.utils.toArray<HTMLElement>("[data-pillar]").forEach((pillar, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: pillar, start: "top 88%" }, delay: i * 0.08 });
        tl.fromTo(pillar.querySelector("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out" });
        tl.from(
          pillar.querySelectorAll("[data-rise]"),
          { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 },
          0.15,
        );
      });

      // Steps and genre cards rise in as a group.
      for (const [selector, trigger] of [
        ["[data-step]", "[data-steps]"],
        ["[data-genre-card]", "[data-genres]"],
      ] as const) {
        gsap.from(selector, {
          y: 44,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger, start: "top 85%" },
        });
      }
    }, root);

    // Owners loads late and shifts the layout; re-measure once it has.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [tracks]);

  return (
    <section ref={rootRef} id="about" aria-label="About" className="relative py-24 sm:py-36">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <Label>{ABOUT.eyebrow}</Label>

        {/* Headline */}
        <h2
          data-about-statement
          className="mt-8 font-display text-[clamp(40px,8.4vw,136px)] font-bold uppercase leading-[0.94] tracking-[-0.01em] sm:mt-12"
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
                    className="about-hl-bar absolute inset-x-0 bottom-[0.04em] top-[0.1em] -z-10 origin-left scale-x-0 bg-accent"
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
          className="mt-10 max-w-[56ch] font-sans text-[clamp(18px,1.7vw,26px)] leading-snug text-ink/80 sm:mt-14"
        >
          {ABOUT.subline}
        </p>

        {/* What you get */}
        <div className="mt-24 sm:mt-36">
          <Label>{ABOUT.pillarsLabel}</Label>
          <ol className="m-0 mt-8 grid list-none gap-y-14 p-0 md:grid-cols-3 md:gap-x-10">
            {ABOUT.pillars.map((pillar, i) => (
              <li key={pillar.title} data-pillar className="relative border-t border-ink/15 pt-6">
                <span
                  aria-hidden
                  data-rule
                  className="absolute -top-px left-0 h-[3px] w-full origin-left bg-ink"
                  style={{ transform: "scaleX(0)" }}
                />
                <p data-rise className="font-mono text-[11px] tracking-wide text-ink/60">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3
                  data-rise
                  className="mt-6 font-display text-[clamp(26px,2.8vw,42px)] font-bold uppercase leading-[1] sm:mt-10"
                >
                  {pillar.title}
                </h3>
                <p data-rise className="mt-5 max-w-[36ch] font-sans text-[15px] leading-relaxed text-ink/70">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* How it works */}
        <div className="mt-24 sm:mt-36">
          <Label>{ABOUT.stepsLabel}</Label>
          <ol data-steps className="m-0 mt-8 list-none border-t border-dotted border-ink/25 p-0">
            {ABOUT.steps.map((step, i) => (
              <li key={step.title} data-step className="release-row">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-3 px-2 py-7 sm:px-4 sm:py-10 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-8">
                  <span className="font-mono text-[12px] tabular-nums text-ink/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[clamp(30px,4.4vw,68px)] font-bold uppercase leading-[0.95]">
                    {step.title}
                  </h3>
                  <p className="col-start-2 max-w-[40ch] font-sans text-[15px] leading-relaxed text-ink/70 md:col-start-3">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* In the library */}
        {genres.length > 0 && (
          <div className="mt-24 sm:mt-36">
            <Label>{ABOUT.genresLabel}</Label>
            <ul data-genres className="m-0 mt-8 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 sm:gap-4">
              {genres.map(({ genre, count, track }) => (
                <li key={genre} data-genre-card>
                  <button
                    type="button"
                    onClick={() => play(track)}
                    aria-label={`Preview ${genre}`}
                    className="group relative block aspect-square w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <img
                      src={track.artwork}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-[#15161B]/85 via-[#15161B]/10 to-transparent"
                    />
                    <span
                      aria-hidden
                      className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_1px_rgba(21,22,27,0.3)] transition-opacity duration-300"
                      style={{ opacity: isActive(track.id) ? 1 : 0 }}
                    />
                    <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                      <span className="block font-display text-[clamp(28px,3.4vw,52px)] font-bold uppercase leading-none">
                        {genre}
                      </span>
                      <span className="mt-2 block font-mono text-[11px] tracking-wide text-white/80">
                        {count} {count === 1 ? "track" : "tracks"} · Preview
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
