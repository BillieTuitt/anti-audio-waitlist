import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy notice | Anti Audio",
  description: "How Anti Audio uses the details you give us when you join the waiting list.",
};

// DRAFT. This is a plain-English starting point, not legal advice. The bracketed
// details must be completed and the whole notice reviewed before launch.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <p>
        Anti Audio runs this waiting list and decides how your details are used. [Add the legal entity name, registered
        address and a contact email for privacy questions.]
      </p>
    ),
  },
  {
    title: "What we collect",
    body: (
      <ul>
        <li>Your name and email address, which you give us in the form.</li>
        <li>
          A record that you agreed to be contacted: the wording you agreed to and the date and time you submitted the
          form.
        </li>
        <li>
          Basic technical data, such as your IP address and browser, which our hosting provider receives whenever you
          visit any website.
        </li>
      </ul>
    ),
  },
  {
    title: "Why we use it, and our legal basis",
    body: (
      <p>
        We use your name and email address to add you to the waiting list and to contact you about early access and
        exclusive offers. Our legal basis is your consent. You can withdraw it at any time, and doing so does not affect
        anything we did before.
      </p>
    ),
  },
  {
    title: "Who we share it with",
    body: (
      <p>
        We do not sell your details. We use service providers to run the site and store your details: hosting (Vercel),
        our database (Supabase) and [the email service we will use to contact you]. They may only use your details to
        provide those services. Some of them are based outside the UK, in which case we rely on the safeguards UK data
        protection law requires.
      </p>
    ),
  },
  {
    title: "How long we keep it",
    body: <p>[State the retention period, for example: until you unsubscribe or ask us to delete your details.]</p>,
  },
  {
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>show you the details we hold about you,</li>
          <li>correct them,</li>
          <li>delete them,</li>
          <li>restrict or stop how we use them, and</li>
          <li>stop contacting you at any time.</li>
        </ul>
        <p>
          To do any of this, email us at [privacy contact email]. If you are unhappy with how we handle your details,
          you can complain to the Information Commissioner&apos;s Office at ico.org.uk.
        </p>
      </>
    ),
  },
  {
    title: "Cookies and third parties",
    body: (
      <p>
        This page does not set cookies of its own. To show the site, your browser loads fonts from Adobe Fonts and audio
        from our storage provider, so those services can see your IP address when you visit.
      </p>
    ),
  },
  {
    title: "Changes",
    body: <p>We may update this notice. [Add the date it was last updated.]</p>,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-[860px] px-4 pb-8 pt-10 sm:px-8 sm:pt-16">
        <Link
          href="/"
          aria-label="Back to Anti Audio"
          className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <span role="img" aria-label="Anti Audio" className="logo-wordmark" style={{ width: 120 }} />
        </Link>

        <p className="mt-16 flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink">
          <span aria-hidden className="h-2 w-2 bg-accent" />
          Draft, to be reviewed before launch
        </p>
        <h1 className="mt-6 font-display text-[clamp(40px,6vw,88px)] font-medium uppercase leading-[0.98] tracking-[-0.01em]">
          Privacy notice
        </h1>
        <p className="mt-8 max-w-[52ch] font-sans text-[clamp(18px,1.6vw,22px)] leading-snug text-ink/70">
          This explains what we do with the details you give us when you join the Anti Audio waiting list.
        </p>

        <div className="mt-16 divide-y divide-dotted divide-ink/25 border-y border-dotted border-ink/25">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="grid gap-4 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10"
            >
              <h2 className="font-display text-[clamp(22px,2vw,30px)] font-medium leading-tight">{section.title}</h2>
              <div className="space-y-4 font-sans text-[16px] leading-relaxed text-ink/75 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
