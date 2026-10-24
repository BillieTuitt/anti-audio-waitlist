import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pb-10 pt-16 sm:px-8">
      <span role="img" aria-label="Anti Audio" className="logo-icon h-5" />
      <div className="flex items-center gap-6 font-mono text-[11px] tracking-wide text-ink/55">
        <Link
          href="/privacy"
          className="transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Privacy
        </Link>
        <p>© {new Date().getFullYear()} Anti Audio</p>
      </div>
    </footer>
  );
}
