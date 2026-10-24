"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { formatTime } from "@/lib/format";
import { usePlayer } from "@/components/PlayerProvider";

// Far enough to clear the bar, its bottom margin and the vinyl peeking above it.
const HIDDEN_Y = 300;
const RECORD_SINK = 80;

export function PlayerBar() {
  const { current, open, status, mode, elapsed, total, toggle, continueListening, close, pauseDismiss, resumeDismiss } =
    usePlayer();
  const playerRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const player = playerRef.current;
    const record = recordRef.current;
    gsap.set(player, { xPercent: -50, y: HIDDEN_Y });
    gsap.set(record, { y: RECORD_SINK, opacity: 0 });
    return () => {
      gsap.killTweensOf([player, record]);
    };
  }, []);

  // Bar slides up, then the vinyl rises from behind it. Closing reverses both.
  useEffect(() => {
    const player = playerRef.current;
    const record = recordRef.current;
    if (!player || !record) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([player, record]);

    if (open) {
      const tl = gsap.timeline();
      tl.to(player, { y: 0, duration: reduce ? 0 : 1, ease: "expo.out" });
      if (!wasOpen.current || status !== "ended") {
        tl.to(
          record,
          { y: 0, opacity: 1, duration: reduce ? 0 : 0.9, ease: "back.out(1.3)" },
          reduce ? 0 : 0.3,
        );
      }
      wasOpen.current = true;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      gsap
        .timeline()
        .to(record, { y: RECORD_SINK, opacity: 0, duration: reduce ? 0 : 0.4, ease: "power2.in" })
        .to(player, { y: HIDDEN_Y, duration: reduce ? 0 : 0.8, ease: "power3.in" }, reduce ? 0 : 0.15);
    }
    // status is deliberately not a dependency: the end-state effect below owns that transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // "Enjoyed the preview?": the vinyl sinks back behind the bar while we wait.
  useEffect(() => {
    const record = recordRef.current;
    if (!record || !open) return;
    if (status === "ended") {
      gsap.to(record, { y: RECORD_SINK, opacity: 0, duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
    } else if (status === "playing" && wasOpen.current) {
      gsap.to(record, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.3)", overwrite: "auto" });
    }
  }, [status, open]);

  const ended = status === "ended";
  const playing = status === "playing";

  return (
    <div
      ref={playerRef}
      role="region"
      aria-label="Preview player"
      aria-hidden={!open}
      // `inert` is not in React 18's types yet; the attribute still works.
      {...(!open ? { inert: "" as unknown as boolean } : {})}
      className="player fixed bottom-4 left-1/2 z-50 w-[92%] max-w-[620px] sm:bottom-6"
    >
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "calc(100% - var(--overlap))" }}
      >
        <div ref={recordRef}>
          <div className="record" data-spinning={playing}>
            {current && (
              <img
                src={current.artwork}
                alt=""
                className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
              />
            )}
            <span className="absolute left-1/2 top-1/2 h-[5%] w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg" />
          </div>
        </div>
      </div>

      <div
        onPointerMove={pauseDismiss}
        onPointerLeave={resumeDismiss}
        onFocus={pauseDismiss}
        onBlur={resumeDismiss}
        className="relative z-10 flex items-center gap-3 rounded-2xl bg-white/65 px-4 py-3.5 shadow-[0_0_0_1px_rgba(21,22,27,0.08),0_18px_40px_rgba(21,22,27,0.12)] backdrop-blur-xl sm:gap-4 sm:px-6"
      >
        {ended ? (
          <>
            <p className="min-w-0 flex-1 font-display text-[18px] leading-tight sm:text-[22px]" aria-live="polite">
              Enjoyed the preview?
            </p>
            <button
              type="button"
              onClick={continueListening}
              className="shrink-0 rounded-full bg-ink px-4 py-2 font-mono text-[11px] tracking-wide text-white transition hover:bg-ink/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Continue listening
            </button>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="font-mono text-[11px] tracking-wide text-ink/55">{mode === "preview" ? "Previewing" : "Playing"}</p>
              <p className="truncate font-display text-[18px] leading-tight sm:text-[22px]">{current?.title ?? ""}</p>
            </div>
            <p className="shrink-0 font-mono text-[11px] tabular-nums tracking-wide text-ink/70">
              {formatTime(elapsed)} / {formatTime(total)}
            </p>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/25 transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              style={{ backgroundColor: playing ? "#F6C944" : "transparent" }}
            >
              {playing ? (
                <>
                  <span className="flex h-[14px] w-[14px] items-center justify-between transition duration-200 group-hover:scale-50 group-hover:opacity-0">
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                  </span>
                  <PauseIcon className="absolute scale-125 opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100" />
                </>
              ) : (
                <PlayIcon />
              )}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close player"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden className="ml-0.5">
      <path d="M1 1.2v11.6a.6.6 0 0 0 .92.5l9.1-5.8a.6.6 0 0 0 0-1L1.92.7A.6.6 0 0 0 1 1.2Z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden className={className}>
      <rect x="1.5" y="1" width="3" height="12" rx="1" />
      <rect x="7.5" y="1" width="3" height="12" rx="1" />
    </svg>
  );
}
