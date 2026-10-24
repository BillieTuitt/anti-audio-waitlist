import { Resend } from "resend";

// Server-only. The welcome email sent once a waiting list sign up has been saved.
// Light theme to match the site's light palette; web fonts don't work in email, so the
// type falls back to Helvetica Neue / Arial.

const FROM = "Anti Audio <hello@mail.antiaudio.com>";
// Where replies go: the team's real inbox (the mail. subdomain only sends).
const REPLY_TO = "hello@antiaudio.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://anti-audio-waitlist.vercel.app").replace(/\/+$/, "");
const ADDRESS = "ANTI AUDIO LTD, 26c Dartmouth Road, London, United Kingdom, NW2 4EX";
const SEND_TIMEOUT_MS = 5000;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** "Alex Rivera" -> "Alex". Falls back to a plain greeting if there is nothing usable. */
function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

function buildEmail(name: string) {
  const first = firstNameOf(name);
  const greeting = first ? `Hi ${first},` : "Hi,";
  const subject = "Thanks for joining the Anti Audio waiting list";
  const preheader = "We'll be in touch when we launch.";
  const privacyUrl = `${SITE_URL}/privacy`;

  const text = [
    greeting,
    "",
    "Thanks for joining the Anti Audio waiting list.",
    "",
    "We'll be in touch when we launch.",
    "",
    "The Anti Audio team",
    "",
    "--",
    "You're receiving this because you joined the Anti Audio waiting list. If that wasn't you, or you'd like to be removed, just reply to this email.",
    `Privacy notice: ${privacyUrl}`,
    ADDRESS,
  ].join("\n");

  const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const html = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eeeeee;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eeeeee;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eeeeee;">
      <tr>
        <td align="center" style="padding:48px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="padding-bottom:56px;font-family:${font};">
                <span style="display:inline-block;width:8px;height:8px;background:#f6c944;margin-right:10px;vertical-align:middle;font-size:0;line-height:0;">&nbsp;</span><span style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:#15161b;vertical-align:middle;">ANTI AUDIO</span>
              </td>
            </tr>
            <tr>
              <td style="font-family:${font};font-size:17px;line-height:1.5;color:#15161b;padding-bottom:12px;">${escapeHtml(greeting)}</td>
            </tr>
            <tr>
              <td style="font-family:${font};font-size:34px;line-height:1.12;font-weight:700;color:#15161b;padding-bottom:20px;">Thanks for joining<br />the waiting list.</td>
            </tr>
            <tr>
              <td style="font-family:${font};font-size:17px;line-height:1.55;color:#4a4b52;padding-bottom:36px;">We'll be in touch when we launch.</td>
            </tr>
            <tr>
              <td style="font-family:${font};font-size:17px;line-height:1.5;color:#15161b;padding-bottom:56px;">The Anti Audio team</td>
            </tr>
            <tr>
              <td style="border-top:1px dotted #b9b9bd;padding-top:20px;font-family:${font};font-size:12px;line-height:1.6;color:#7a7b82;">
                You're receiving this because you joined the Anti Audio waiting list. If that wasn't you, or you'd like to be removed, just reply to this email.<br />
                <a href="${privacyUrl}" style="color:#7a7b82;text-decoration:underline;">Privacy notice</a><br />
                ${escapeHtml(ADDRESS)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

/**
 * Sends the welcome email. Never throws and never blocks the sign up for long: the caller
 * has already saved the row, so a failure here is only logged (without the address).
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[waitlist] RESEND_API_KEY is not set; welcome email skipped.");
    return;
  }

  try {
    const { subject, html, text } = buildEmail(name);
    const resend = new Resend(apiKey);
    const send = resend.emails.send({ from: FROM, to, replyTo: REPLY_TO, subject, html, text });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${SEND_TIMEOUT_MS}ms`)), SEND_TIMEOUT_MS),
    );
    const { error } = await Promise.race([send, timeout]);
    if (error) console.error("[waitlist] welcome email failed:", error.name, error.message);
  } catch (err) {
    console.error("[waitlist] welcome email failed:", err instanceof Error ? err.message : err);
  }
}

// Exposed for previews and tests only.
export const __buildWelcomeEmail = buildEmail;
