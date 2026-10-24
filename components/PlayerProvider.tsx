"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Track } from "@/lib/tracks";

export type PlayerStatus = "idle" | "playing" | "paused";

interface PlayerState {
  /** Last track played. Kept while the bar slides away so it never empties mid-animation. */
  current: Track | null;
  open: boolean;
  status: PlayerStatus;
  elapsed: number;
  total: number;
  /** True only while this track is audibly playing or paused, never after the bar closed. */
  isActive: (trackId: string) => boolean;
  isPlaying: (trackId: string) => boolean;
  play: (track: Track) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

// One audio element for the whole page. Tracks play in full; the bar closes when one finishes.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<PlayerStatus>("idle");

  const [current, setCurrent] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatusState] = useState<PlayerStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);

  const setStatus = useCallback((next: PlayerStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setOpen(false);
    setStatus("idle");
  }, [setStatus]);

  // Created on the client only.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onMeta = () => setMediaDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => close();
    const onError = () => close();
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [close]);

  // Drive the clock with rAF while playing so the progress line stays smooth.
  useEffect(() => {
    if (status !== "playing") return;
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setElapsed(audio.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(
      () => setStatus("playing"),
      () => setStatus("paused"),
    );
  }, [setStatus]);

  const play = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Same track, bar open: behave like the play/pause button.
      if (open && current?.id === track.id) {
        if (statusRef.current === "playing") {
          audio.pause();
          setStatus("paused");
        } else {
          startPlayback();
        }
        return;
      }

      audio.src = track.audioUrl;
      audio.currentTime = 0;
      setMediaDuration(0);
      setElapsed(0);
      setCurrent(track);
      setOpen(true);
      setStatus("playing");
      startPlayback();
    },
    [current?.id, open, setStatus, startPlayback],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (statusRef.current === "playing") {
      audio.pause();
      setStatus("paused");
    } else if (statusRef.current === "paused") {
      startPlayback();
    }
  }, [setStatus, startPlayback]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, seconds);
    setElapsed(audio.currentTime);
  }, []);

  const total = mediaDuration || current?.durationSeconds || 0;

  const value = useMemo<PlayerState>(
    () => ({
      current,
      open,
      status,
      elapsed,
      total,
      isActive: (id) => open && current?.id === id && (status === "playing" || status === "paused"),
      isPlaying: (id) => open && current?.id === id && status === "playing",
      play,
      toggle,
      seek,
      close,
    }),
    [current, open, status, elapsed, total, play, toggle, seek, close],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
