"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Track } from "@/lib/tracks";
import { ABOUT } from "@/lib/copy";

const INK = "#15161B";

// Parallax collage tiles: position and size are in the container's own units so
// the whole thing scales; `speed` is how far (and which way) each one drifts.
const TILES = [
  { left: "3%", top: "6%", size: "clamp(120px, 21vw, 310px)", speed: 1.2 },
  { left: "27%", top: "46%", size: "clamp(90px, 15vw, 230px)", speed: -0.9 },
  { left: "44%", top: "2%", size: "clamp(100px, 17vw, 260px)", speed: 0.7 },
  { left: "9%", top: "66%", size: "clamp(80px, 12vw, 190px)", speed: -1.5 },
  { left: "58%", top: "60%", size: "clamp(90px, 14vw, 210px)", speed: 1 },
];

export function About({ tracks }: { tracks: Track[] }) {
  const rootRef = useRef<HTMLElement>(null);

  const { genres, stats } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tracks) if (t.genre) counts.set(t.genre, (counts.get(t.genre) ?? 0) + 1);
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
    const minutes = Math.round(tracks.reduce((sum, t) => sum + t.durationSeconds, 0) / 60);
    return {
      genres: ranked,
      stats: [
        { value: tracks.length, label: ABOUT.statLabels.tracks },
        { value: ranked.length, label: ABOUT.statLabels.genres },
        { value: minutes, label: ABOUT.statLabels.minutes },
      ],
    };
  }, [tracks]);

  // Enough marquee items that one group is always wider than the viewport.
  const marqueeItems = useMemo(() => {
    if (genres.length === 0) return [];
    const out: string[] = [];
    while (out.length < 8) out.push(...genres);
    return out;
  }, [genres]);

  const tileArt = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter((t) => (seen.has(t.artwork) ? false : (seen.add(t.artwork), true))).map((t) => t.artwork);
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

      // 1. Statement fills in word by word as it scrolls through, then the highlights sweep in.
      const statementTl = gsap.timeline({
        scrollTrigger: { trigger: "[data-about-statement]", start: "top 82%", end: "bottom 52%", scrub: 0.6 },
      });
      statementTl.to(".about-word", { color: INK, duration: 1, stagger: 0.12, ease: "none" });
      statementTl.to(".about-hl-bar", { scaleX: 1, duration: 1.2, stagger: 0.6, ease: "power2.out" }, ">-1.4");

      // 2. Collage: every tile drifts at its own speed; the vinyl turns with the scroll.
      gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile) => {
        const speed = parseFloat(tile.dataset.speed ?? "1");
        gsap.fromTo(
          tile,
          { yPercent: 18 * speed },
          {
            yPercent: -18 * speed,
            ease: "none",
            scrollTrigger: { trigger: "[data-collage]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.fromTo(
        "[data-vinyl]",
        { rotation: -40 },
        {
          rotation: 320,
          ease: "none",
          scrollTrigger: { trigger: "[data-collage]", start: "top bottom", end: "bottom top", scrub: 0.4 },
        },
      );
      // GSAP owns this element's transform, so the vertical centring lives here, not in a class.
      gsap.set("[data-vinyl-wrap]", { yPercent: -50 });
      gsap.from("[data-vinyl-wrap]", {
        xPercent: 18,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-collage]", start: "top 75%" },
      });

      // 3. Pillars: the top rule draws across, then the copy rises in.
      gsap.utils.toArray<HTMLElement>("[data-pillar]").forEach((pillar, i) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: pillar, start: "top 88%" },
          delay: i * 0.08,
        });
        tl.fromTo(pillar.querySelector("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out" });
        tl.from(
          pillar.querySelectorAll("[data-rise]"),
          { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 },
          0.15,
        );
      });

      // 4. Stats count up once when they scroll into view.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseInt(el.dataset.count ?? "0", 10);
        const counter = { value: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              value: target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(counter.value));
              },
              onComplete: () => {
                el.textContent = String(target);
              },
            });
          },
        });
      });

      // 5. Genre marquee: constant drift that surges with scroll speed.
      const track = root.querySelector("[data-marquee]");
      if (track) {
        const drift = gsap.to(track, { xPercent: -50, duration: 45, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 6);
            drift.timeScale(boost);
            gsap.to(drift, { timeScale: 1, duration: 1, ease: "power2.out", overwrite: true });
          },
        });
      }
    }, root);

    // Owners loads late and shifts the layout; re-measure once it has.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [tracks]);

  const heroTrack = tracks[0];

  return (
    <section ref={rootRef} id="about" aria-label="About" className="relative overflow-hidden py-24 sm:py-36">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        {/* Eyebrow */}
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink">
          <span aria-hidden className="h-2 w-2 bg-accent shadow-[0_0_0_1px_rgba(21,22,27,0.25)]" />
          {ABOUT.eyebrow}
        </p>

        {/* Statement */}
        <h2
          data-about-statement
          className="mt-8 font-display text-[clamp(40px,8.4vw,136px)] font-bold uppercase leading-[0.94] tracking-[-0.01em] sm:mt-12"
        >
          {ABOUT.statement.map((part, i) =>
            part.text.split(" ").map((word, w) =>
              part.hl ? (
                // Highlighted words keep full ink; a yellow bar behind each one sweeps in on scroll.
                <span key={`${i}-${w}`} className="relative isolate mr-[0.22em] inline-block px-[0.1em] -ml-[0.1em]">
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
      </div>

      {/* Collage + vinyl */}
      <div data-collage className="relative mt-20 h-[max(420px,60vw)] max-h-[780px] sm:mt-32">
        <div
          data-vinyl-wrap
          className="absolute right-[-30%] top-1/2 aspect-square w-[clamp(300px,50vw,700px)] sm:right-[-12%]"
        >
          <div data-vinyl className="vinyl">
            {heroTrack && (
              <img
                src={heroTrack.artwork}
                alt=""
                draggable={false}
                className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
              />
            )}
            <span className="absolute left-1/2 top-1/2 h-[3.5%] w-[3.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg" />
          </div>
        </div>

        {tileArt.length > 0 &&
          TILES.map((tile, i) => (
            <div
              key={i}
              data-tile
              data-speed={tile.speed}
              className="absolute"
              style={{ left: tile.left, top: tile.top, width: tile.size, aspectRatio: "1" }}
            >
              <img
                src={tileArt[i % tileArt.length]}
                alt=""
                draggable={false}
                className="h-full w-full object-cover shadow-[0_24px_60px_rgba(21,22,27,0.18)]"
              />
            </div>
          ))}
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        {/* Pillars */}
        <ol className="m-0 mt-24 grid list-none gap-y-14 p-0 md:grid-cols-3 md:gap-x-10 sm:mt-36">
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

        {/* Stats */}
        <dl className="m-0 mt-24 grid grid-cols-1 border-y border-ink/15 sm:mt-36 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                "px-0 py-8 sm:px-8 sm:py-12",
                i > 0 ? "border-t border-ink/15 sm:border-l sm:border-t-0" : "",
              ].join(" ")}
            >
              <dd
                data-count={stat.value}
                className="m-0 font-display text-[clamp(64px,9vw,148px)] font-bold leading-none tabular-nums"
              >
                {stat.value}
              </dd>
              <dt className="mt-4 font-mono text-[11px] tracking-wide text-ink/60">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      {/* Genre marquee */}
      {marqueeItems.length > 0 && (
        <div aria-hidden className="mt-24 overflow-hidden sm:mt-36">
          <div data-marquee className="flex w-max whitespace-nowrap">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 items-center">
                {marqueeItems.map((genre, i) => (
                  <span
                    key={i}
                    className="flex items-center font-display text-[clamp(64px,12vw,200px)] font-bold uppercase leading-none"
                  >
                    <span className="px-[0.25em]">{genre}</span>
                    <span className="h-[0.18em] w-[0.18em] shrink-0 bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
