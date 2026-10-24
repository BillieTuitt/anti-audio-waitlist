"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Track } from "@/lib/tracks";

export const PREVIEW_SECONDS = 15;
// How long the "Enjoyed the preview?" bar waits before closing itself.
const END_STATE_SECONDS = 6;

export type PlayerStatus = "idle" | "playing" | "paused" | "ended";
type Mode = "preview" | "full";

interface PlayerState {
  /** Last track played. Kept while the bar slides away so it never empties mid-animation. */
  current: Track | null;
  open: boolean;
  status: PlayerStatus;
  mode: Mode;
  elapsed: number;
  total: number;
  /** True only while this track is audibly playing or paused, never after the bar closed. */
  isActive: (trackId: string) => boolean;
  isPlaying: (trackId: string) => boolean;
  play: (track: Track) => void;
  toggle: () => void;
  continueListening: () => void;
  close: () => void;
  /** Hold / restart the auto-close countdown on the "Enjoyed the preview?" bar. */
  pauseDismiss: () => void;
  resumeDismiss: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modeRef = useRef<Mode>("preview");
  const statusRef = useRef<PlayerStatus>("idle");

  const [current, setCurrent] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatusState] = useState<PlayerStatus>("idle");
  const [mode, setModeState] = useState<Mode>("preview");
  const [elapsed, setElapsed] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);

  const setStatus = useCallback((next: PlayerStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const setMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const clearEndTimer = useCallback(() => {
    if (endTimer.current) clearTimeout(endTimer.current);
    endTimer.current = null;
  }, []);

  const close = useCallback(() => {
    clearEndTimer();
    audioRef.current?.pause();
    setOpen(false);
    setStatus("idle");
  }, [clearEndTimer, setStatus]);

  const startEndTimer = useCallback(() => {
    clearEndTimer();
    endTimer.current = setTimeout(close, END_STATE_SECONDS * 1000);
  }, [clearEndTimer, close]);

  const finishPreview = useCallback(() => {
    audioRef.current?.pause();
    setElapsed(PREVIEW_SECONDS);
    setStatus("ended");
    startEndTimer();
  }, [setStatus, startEndTimer]);

  const resumeDismiss = useCallback(() => {
    if (statusRef.current === "ended") startEndTimer();
  }, [startEndTimer]);

  // One audio element for the whole page, created on the client only.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onMeta = () => setMediaDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => {
      // A short file that ends before 15s, or the full file once "continue" was chosen.
      if (modeRef.current === "preview") finishPreview();
      else close();
    };
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
  }, [close, finishPreview]);

  // Drive the clock with rAF while playing so the 15s cut-off is exact.
  useEffect(() => {
    if (status !== "playing") return;
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setElapsed(audio.currentTime);
        if (modeRef.current === "preview" && audio.currentTime >= PREVIEW_SECONDS) {
          finishPreview();
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, finishPreview]);

  useEffect(() => () => clearEndTimer(), [clearEndTimer]);

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
      clearEndTimer();

      // Same track, bar open: behave like the play/pause button.
      if (open && current?.id === track.id && statusRef.current !== "ended") {
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
      setMode("preview");
      setCurrent(track);
      setOpen(true);
      setStatus("playing");
      startPlayback();
    },
    [clearEndTimer, current?.id, open, setMode, setStatus, startPlayback],
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

  const continueListening = useCallback(() => {
    clearEndTimer();
    setMode("full");
    startPlayback();
  }, [clearEndTimer, setMode, startPlayback]);

  const trackDuration = mediaDuration || current?.durationSeconds || 0;
  const total = mode === "preview" ? Math.min(PREVIEW_SECONDS, trackDuration || PREVIEW_SECONDS) : trackDuration;

  const value = useMemo<PlayerState>(
    () => ({
      current,
      open,
      status,
      mode,
      elapsed,
      total,
      isActive: (id) => open && current?.id === id && (status === "playing" || status === "paused"),
      isPlaying: (id) => open && current?.id === id && status === "playing",
      play,
      toggle,
      continueListening,
      close,
      pauseDismiss: clearEndTimer,
      resumeDismiss,
    }),
    [current, open, status, mode, elapsed, total, play, toggle, continueListening, close, clearEndTimer, resumeDismiss],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
