import { Resend } from "resend";

// Server-only. The welcome email sent once a waiting list sign up has been saved.
// Light theme to match the site's light palette; web fonts don't work in email, so the
// type falls back to Helvetica Neue / Arial.

const FROM = "Anti Audio <hello@mail.antiaudio.com>";
// Where replies go: the team's real inbox (the mail. subdomain only sends).
const REPLY_TO = "hello@antiaudio.com";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://anti-audio-waitlist.vercel.app").replace(/\/+$/, "");
const ADDRESS = "ANTI AUDIO LTD, 26c Dartmouth Road, London, United Kingdom, NW2 4EX";
const INSTAGRAM_URL = "https://www.instagram.com/anti.audio/";
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
  const unsubscribeUrl = `mailto:${REPLY_TO}?subject=${encodeURIComponent("Unsubscribe")}`;

  const text = [
    greeting,
    "",
    "Thanks for joining the Anti Audio waiting list.",
    "",
    "We'll be in touch when we launch. Until then, you can find us on Instagram: " + INSTAGRAM_URL,
    "",
    "The Anti Audio team",
    "",
    "--",
    "You're receiving this because you joined the Anti Audio waiting list.",
    `Unsubscribe: reply to this email or write to ${REPLY_TO}`,
    `Privacy notice: ${privacyUrl}`,
    ADDRESS,
  ].join("\n");

  const sans = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const mono = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";
  const html = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#ececec;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ececec;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ececec;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#f5f5f5;">

            <!-- Header -->
            <tr>
              <td style="padding:24px 24px 20px;border-bottom:1px solid #e2e2e2;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <img src="${SITE_URL}/email/logo-wordmark.png" width="150" alt="Anti Audio" style="display:block;width:150px;height:auto;border:0;" />
                    </td>
                    <td align="right" style="font-family:${mono};font-size:11px;letter-spacing:0.08em;color:#7a7b82;">WAITING LIST</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero: one image, photo plus the headline in Owners Black -->
            <tr>
              <td style="padding:12px;">
                <img src="${SITE_URL}/email/hero.jpg" width="552" alt="You're first in line" style="display:block;width:100%;height:auto;border:0;background:#15161b;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 24px 8px;font-family:${sans};font-size:16px;line-height:1.55;color:#15161b;">
                <p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
                <p style="margin:0 0 16px;">Thanks for joining the Anti Audio waiting list. We'll be in touch when we launch.</p>
                <p style="margin:0 0 8px;">Until then, you can find us on Instagram.</p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:28px 24px 32px;">
                <a href="${INSTAGRAM_URL}" style="display:inline-block;background:#15161b;color:#ffffff;padding:14px 28px;font-family:${sans};font-size:14px;font-weight:500;letter-spacing:0.1em;text-decoration:none;">INSTAGRAM</a>
              </td>
            </tr>

            <!-- Footer labels -->
            <tr>
              <td style="padding:28px 24px 28px;border-top:1px solid #e2e2e2;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-family:${mono};font-size:11px;letter-spacing:0.08em;color:#7a7b82;">BIG SOUNDS</td>
                    <td align="center"><span style="display:inline-block;width:9px;height:9px;background:#f6c944;font-size:0;line-height:0;">&nbsp;</span></td>
                    <td align="right" style="font-family:${mono};font-size:11px;letter-spacing:0.08em;color:#7a7b82;">BIG IDEAS</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Below the card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
            <tr>
              <td align="center" style="padding:20px 24px 0;font-family:${sans};font-size:12px;line-height:1.7;color:#7a7b82;">
                You're receiving this because you joined the Anti Audio waiting list.<br />
                <a href="${unsubscribeUrl}" style="color:#7a7b82;text-decoration:underline;">Unsubscribe</a> &nbsp;|&nbsp; <a href="${privacyUrl}" style="color:#7a7b82;text-decoration:underline;">Privacy notice</a><br />
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
