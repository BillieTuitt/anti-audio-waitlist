import type { ButtonHTMLAttributes, ReactNode } from "react";

// Ported from the main Anti Audio app's primary Button (components/ui/Button.tsx and
// IconCycle.tsx), dark theme: a yellow block with a text swap, a chevron cycling through
// a square and a dark wipe on hover, all on one shared duration and curve.
const EASE = "duration-[525ms] ease-[cubic-bezier(0.625,0.05,0,1)]";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        "group/btn inline-flex items-center justify-center font-sans font-medium uppercase tracking-wide transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
      {...props}
    >
      <span className="relative flex h-full w-full items-center justify-center gap-2 overflow-hidden bg-accent px-[0.75em] py-[0.6125em]">
        {/* Text: a copy sits one line below, revealed as the real text slides up on hover. */}
        <span className="relative z-10 flex overflow-hidden">
          <span
            className={[
              "block text-[#15161B] transition-[transform,color] group-hover/btn:-translate-y-[1.5em] group-hover/btn:text-[#E7EAF0]",
              EASE,
            ].join(" ")}
            style={{ textShadow: "0px 1.5em currentColor" }}
          >
            {children}
          </span>
        </span>

        <span className="relative z-10">
          <IconCycle />
        </span>

        {/* Wipe: a panel rotated out of view below, sliding and unrotating into place on hover. */}
        <span
          aria-hidden
          className={[
            "absolute -bottom-px -top-px left-[-10%] z-0 w-[120%] translate-y-[220%] rotate-[8deg] bg-[#191A1F] transition-transform group-hover/btn:translate-y-0 group-hover/btn:rotate-0",
            EASE,
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function IconCycle() {
  return (
    <span className="relative flex h-[1em] w-[1em] shrink-0">
      <span
        className={["absolute h-full w-full bg-[#E7EAF0] transition-transform group-hover/btn:rotate-90", EASE].join(
          " ",
        )}
      />
      <span className="relative flex h-full w-full items-center justify-end overflow-hidden text-[#15161B]">
        <span className="flex h-full items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "h-full w-[1em] shrink-0 p-[0.2em] transition-transform group-hover/btn:translate-x-[200%]",
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
