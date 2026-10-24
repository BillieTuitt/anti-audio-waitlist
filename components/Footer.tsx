export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pb-10 pt-16 sm:px-8">
      <span role="img" aria-label="Anti Audio" className="logo-icon h-5" />
      <p className="font-mono text-[11px] tracking-wide text-ink/55">© {new Date().getFullYear()} Anti Audio</p>
    </footer>
  );
}
