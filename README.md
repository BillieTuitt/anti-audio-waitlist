# Anti Audio waitlist

Standalone Next.js 14 (App Router, TypeScript, Tailwind, GSAP) waitlist site.
Separate from the main Anti Audio app. No form, no waitlist table and no emails yet.

## Run

```bash
cp .env.example .env.local   # then fill in the three values
npm install
npm run dev                  # http://localhost:3010
```

## Environment variables

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The existing Anti Audio Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | That project's anon (public) key. Read-only, row-level security applies |
| `R2_PUBLIC_URL` | Public URL of the R2 previews bucket (same value as the main app) |

## Data

`lib/tracks.ts` reads approved tracks for a single producer using the anon key and the
same public columns as the main app's catalogue. The producer is only used as a filter;
its name is never selected or shown. Tracks with no `preview_key` are skipped.

## Placeholders to replace

- Artwork: `public/artwork/placeholder-*.jpg`, cycled by position (see `lib/tracks.ts`).
- Copy: `lib/copy.ts` (script line, vertical tagline, hero label, hint).
- Blank sections: About and Acknowledgements in `app/page.tsx`.
- Owners font: Adobe Fonts kit `fqf0rlk`, linked in `app/layout.tsx`. Add the live domain
  to the kit's domain list in Adobe Fonts or it will fall back to Helvetica.
