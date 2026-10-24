"use client";

import type { Track } from "@/lib/tracks";
import { formatTime } from "@/lib/format";
import { usePlayer } from "@/components/PlayerProvider";

export function Releases({ tracks }: { tracks: Track[] }) {
  const { play, isActive, isPlaying } = usePlayer();

  return (
    <section aria-label="Releases" className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-8 sm:py-24">
      <div className="mb-4 flex items-baseline justify-between px-2 sm:px-4">
        <h2 className="font-display text-[clamp(28px,4vw,48px)] leading-none">Releases</h2>
        <p className="font-mono text-[11px] tracking-wide text-ink/55">{tracks.length} tracks</p>
      </div>

      <div
        className="hidden grid-cols-[3rem_3.5rem_minmax(0,1fr)_7rem_7rem_4rem_7rem] items-center gap-4 px-4 py-3 font-mono text-[11px] tracking-wide text-ink/55 md:grid"
        aria-hidden
      >
        <span>No.</span>
        <span />
        <span>Title</span>
        <span>Date</span>
        <span>Genre</span>
        <span className="text-right">Length</span>
        <span />
      </div>

      <ol className="m-0 list-none p-0">
        {tracks.map((track, index) => {
          const number = String(tracks.length - index).padStart(3, "0");
          const active = isActive(track.id);
          const playing = isPlaying(track.id);
          return (
            <li key={track.id} className="release-row">
              <div className="grid grid-cols-[2.25rem_3rem_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 sm:gap-4 sm:px-4 md:grid-cols-[3rem_3.5rem_minmax(0,1fr)_7rem_7rem_4rem_7rem]">
                <span className="flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-ink/60">
                  {number}
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_1px_rgba(21,22,27,0.2)] transition-opacity duration-300"
                    style={{ opacity: active ? 1 : 0 }}
                  />
                </span>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => play(track)}
                  className="block h-12 w-12 overflow-hidden rounded-[24%] md:h-14 md:w-14"
                >
                  <img src={track.artwork} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>

                <div className="min-w-0">
                  <p className="truncate font-display text-[20px] leading-tight sm:text-[24px]">{track.title}</p>
                  <p className="mt-1 font-mono text-[11px] leading-[1.5] tracking-wide text-ink/55 md:hidden">
                    <span className="block">{track.dateLabel}</span>
                    <span className="block truncate">
                      {[track.genre, formatTime(track.durationSeconds)].filter(Boolean).join(" · ")}
                    </span>
                  </p>
                </div>

                <span className="hidden font-mono text-[12px] text-ink/70 md:block">{track.dateLabel}</span>
                <span className="hidden truncate font-mono text-[12px] text-ink/70 md:block">{track.genre}</span>
                <span className="hidden text-right font-mono text-[12px] tabular-nums text-ink/70 md:block">
                  {formatTime(track.durationSeconds)}
                </span>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => play(track)}
                    aria-label={`${playing ? "Pause" : "Preview"} ${track.title}`}
                    className="rounded-full border border-ink/30 px-3 py-1.5 font-mono sm:px-4 sm:py-2 text-[11px] tracking-wide transition-colors hover:border-ink hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {playing ? "Pause" : "Preview"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
