import Link from "next/link";

// Links and copyright on one line, then the wordmark across the full width and
// flush with the bottom of the page, the same treatment as the main site's footer.
export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 pt-16 sm:gap-14 sm:px-8 sm:pt-24">
      <div className="flex items-center justify-between gap-6 font-mono text-[11px] tracking-wide text-ink/55">
        <p>© {new Date().getFullYear()} Anti Audio</p>
        <Link
          href="/privacy"
          className="transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Privacy
        </Link>
      </div>
      <div role="img" aria-label="Anti Audio" className="logo-wordmark w-full" />
    </footer>
  );
}
