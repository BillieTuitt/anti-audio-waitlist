import { NextResponse } from "next/server";

// TODO: wire this to a real destination (email tool, CRM, or a Supabase table with a
// write policy) before launch. Until then production refuses submissions rather than
// quietly dropping people's details, and development simulates success so the form
// can be designed and tested.

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
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;

  if (!name || name.length > 100) return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!consent) return NextResponse.json({ error: "Consent is required." }, { status: 400 });

  if (process.env.NODE_ENV === "development") {
    console.log("[waitlist] simulated sign up (nothing stored):", { name, email, consent });
    return NextResponse.json({ ok: true, simulated: true });
  }

  return NextResponse.json({ error: "Sign ups are not open just yet. Please check back soon." }, { status: 503 });
}
