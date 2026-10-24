export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pb-10 pt-16 sm:px-8">
      <img src="/brand/logo-icon.svg" alt="Anti Audio" className="h-5 w-auto" />
      <p className="font-mono text-[11px] tracking-wide text-ink/55">© {new Date().getFullYear()} Anti Audio</p>
    </footer>
  );
}
