import type { ButtonHTMLAttributes, ReactNode } from "react";

// Ported from the main Anti Audio app's TextLink (components/ui/TextLink.tsx,
// IconCycle.tsx), light theme: a label with a bottom rule that runs under a
// small square holding a chevron which cycles through it on hover. Rendered as
// a <button> for now because there is no destination to link to yet.
const EASE = "duration-[525ms] ease-[cubic-bezier(0.625,0.05,0,1)]";

export function TextLink({
  children,
  className = "",
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        // The rule is a bottom border on the whole row (not a text-decoration)
        // so it also runs under the icon.
        "group inline-flex items-center gap-2 border-b-[1.5px] border-ink pb-0.5 font-sans font-medium uppercase tracking-wide text-ink",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
        className,
      ].join(" ")}
      {...props}
    >
      <span>{children}</span>
      <IconCycle />
    </button>
  );
}

function IconCycle() {
  return (
    <span className="relative flex h-[1em] w-[1em] shrink-0">
      <span className={["absolute h-full w-full bg-ink transition-transform group-hover:rotate-90", EASE].join(" ")} />
      <span className="relative flex h-full w-full items-center justify-end overflow-hidden text-bg">
        <span className="flex h-full items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "h-full w-[1em] shrink-0 p-[0.2em] transition-transform group-hover:translate-x-[200%]",
                EASE,
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-full w-full"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
