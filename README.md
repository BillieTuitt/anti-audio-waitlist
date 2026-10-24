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
| `RESEND_API_KEY` | Resend key used to send the welcome email (send-only is enough) |

## Data

`lib/tracks.ts` reads approved tracks for a single producer using the anon key and the
same public columns as the main app's catalogue. The producer is only used as a filter;
its name is never selected or shown. Tracks with no `preview_key` are skipped.

## Sign up form

The form at the bottom of the page posts to `app/api/waitlist/route.ts`, which validates name, email
and consent (with a honeypot field) and inserts into the `waitlist_signups` table in the existing
Supabase project. The table comes from `supabase/migrations/0032_waitlist_signups.sql` in the main
Anti Audio repo and is **insert-only for the anon key**, so this site needs no secret key and the
public key can never read anyone's details back. A repeat email counts as success.

After a new sign up is saved, `lib/email/welcome.ts` sends a short welcome email through Resend (from
`hello@mail.antiaudio.com`, replies to `hello@antiaudio.com`). It needs `RESEND_API_KEY`. If the email
fails the sign up still succeeds and the failure is only logged; a repeat sign up sends nothing.

Until that migration has been run in the Supabase SQL Editor, development simulates success and
production returns a 503 rather than silently dropping details.

The privacy notice at `/privacy` is a **draft**: complete the remaining bracketed detail (retention
period) and have it reviewed before launch.

## Placeholders to replace

- Artwork: `public/artwork/placeholder-*.jpg`, cycled by position (see `lib/tracks.ts`).
- Copy: `lib/copy.ts` (script line, vertical tagline, hero label, hint).
- Owners font: Adobe Fonts kit `fqf0rlk`, linked in `app/layout.tsx`. Add the live domain
  to the kit's domain list in Adobe Fonts or it will fall back to Helvetica.
