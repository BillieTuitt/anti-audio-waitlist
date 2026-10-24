import { createClient } from "@supabase/supabase-js";
import { formatReleaseDate } from "@/lib/format";

// The single producer this site shows. Used only to filter the query; the
// producer's name is never selected, passed down or rendered.
const PRODUCER_SLUG = "quincy-tellem-test";

// Local placeholders (public/artwork), cycled by position, until real
// artwork is wired in.
const PLACEHOLDER_ARTWORK = [1, 2, 3, 4, 5].map((n) => `/artwork/placeholder-${n}.jpg`);

export interface Track {
  id: string;
  title: string;
  genre: string;
  /** Pre-formatted on the server ("4 Sep 2026") so hydration always matches. */
  dateLabel: string;
  durationSeconds: number;
  audioUrl: string;
  artwork: string;
}

// Same public columns the main app's catalogue selects. Row-level security
// already limits anon to approved tracks (and complete packs), and the
// private columns (master_key etc.) are not granted to anon at all.
const COLUMNS = "id, title, genre, duration_seconds, preview_key, release_date, producers!inner ( slug )";

type Row = {
  id: string;
  title: string;
  genre: string | null;
  duration_seconds: number | null;
  preview_key: string | null;
  release_date: string | null;
};

export async function getTracks(): Promise<Track[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const previewsBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!url || !anonKey || !previewsBase) {
    console.warn("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or R2_PUBLIC_URL; showing no tracks.");
    return [];
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("tracks")
    .select(COLUMNS)
    .eq("producers.slug", PRODUCER_SLUG)
    .not("preview_key", "is", null)
    .order("release_date", { ascending: false })
    .order("title", { ascending: true })
    .returns<Row[]>();

  if (error) {
    console.error("Failed to load tracks:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.preview_key)
    .map((row, index) => ({
      id: row.id,
      title: row.title,
      genre: row.genre ?? "",
      dateLabel: formatReleaseDate(row.release_date),
      durationSeconds: row.duration_seconds ?? 0,
      audioUrl: `${previewsBase}/${row.preview_key}`,
      artwork: PLACEHOLDER_ARTWORK[index % PLACEHOLDER_ARTWORK.length],
    }));
}
