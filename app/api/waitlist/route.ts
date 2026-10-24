import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SIGNUP } from "@/lib/copy";

// Stores sign ups in the existing Supabase project's `waitlist_signups` table (see the
// 0032_waitlist_signups.sql migration in the main Anti Audio repo). That table is
// insert-only for the anon key, so this route needs no secret key and the anon key can
// never be used to read anyone's details back.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const consent = body.consent === true;

  if (!name || name.length > 100) return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "Consent is required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("[waitlist] Supabase environment variables are missing.");
    return NextResponse.json({ error: SIGNUP.errors.generic }, { status: 503 });
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("waitlist_signups").insert({
    name,
    email,
    consent: true,
    // The exact wording shown next to the checkbox, kept as the record of what was agreed to.
    consent_text: SIGNUP.consent,
    source: "waitlist-site",
  });

  // A repeat sign up (unique email) looks identical to a new one, so the form can't be
  // used to find out who is already on the list.
  if (!error || error.code === "23505") return NextResponse.json({ ok: true });

  // The table has not been created yet: development simulates success so the form can be
  // tested; production refuses rather than quietly dropping people's details.
  const tableMissing = error.code === "PGRST205" || error.code === "42P01";
  if (tableMissing && process.env.NODE_ENV === "development") {
    console.warn("[waitlist] waitlist_signups table not found; simulated sign up (nothing stored).");
    return NextResponse.json({ ok: true, simulated: true });
  }

  console.error("[waitlist] insert failed:", error.code, error.message);
  return NextResponse.json({ error: SIGNUP.errors.generic }, { status: 503 });
}
