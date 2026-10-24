"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SIGNUP } from "@/lib/copy";
import { TextLink } from "@/components/TextLink";

type Status = "idle" | "submitting" | "success";
type Errors = { name?: string; email?: string; consent?: string; form?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// A ruled field: mono label above, Owners text on a hairline that draws in yellow while focused.
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <label htmlFor={id} className="block font-mono text-[11px] tracking-wide text-ink/55">
        {label}
      </label>
      <div className="relative mt-3 border-b border-ink/25">
        {children}
        {/* Shown (yellow) when the field is invalid. */}
        <span
          aria-hidden
          className={[
            "absolute -bottom-px left-0 h-px w-full origin-left bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            error ? "scale-x-100" : "scale-x-0",
          ].join(" ")}
        />
        <span
          aria-hidden
          className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:scale-x-100"
        />
      </div>
    </div>
  );
}

export function Signup() {
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  // A gentle entrance, plus the faint banner drifting behind.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-signup-rise]", {
        y: 32,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 70%" },
      });
      gsap.fromTo("[data-banner]", { xPercent: 0 }, { xPercent: -50, duration: 220, ease: "none", repeat: -1 });
    }, root);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-success-rise]", { y: 28, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
  }, [status]);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = SIGNUP.errors.name;
    if (!EMAIL_RE.test(email.trim())) next.email = SIGNUP.errors.email;
    if (!consent) next.consent = SIGNUP.errors.consent;
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const found = validate();
    setErrors(found);
    if (found.name) return void nameRef.current?.focus();
    if (found.email) return void emailRef.current?.focus();
    if (found.consent) return void consentRef.current?.focus();

    setStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), consent, company }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setErrors({ form: data.error ?? SIGNUP.errors.generic });
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setErrors({ form: SIGNUP.errors.generic });
      setStatus("idle");
    }
  }

  const busy = status === "submitting";
  const firstError = errors.name ?? errors.email ?? errors.consent ?? errors.form;
  const input =
    "block w-full bg-transparent pb-3 font-display text-[clamp(24px,2.4vw,36px)] font-medium leading-tight caret-accent placeholder:text-ink/25 focus:outline-none";

  return (
    <section
      ref={rootRef}
      id="join"
      aria-label="Join the waiting list"
      className="relative overflow-hidden border-t border-dotted border-ink/25 py-24 sm:py-36"
    >
      {/* Same faint banner as the hero: bold, filled, drifting slowly behind the content. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none">
        <div
          data-banner
          className="flex w-max whitespace-nowrap font-display text-[clamp(64px,15vw,220px)] font-bold uppercase leading-none text-[color:var(--banner)]"
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 gap-[0.35em] pr-[0.35em]">
              {[0, 1, 2].map((i) => (
                <span key={i}>Waiting list</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-16 px-4 sm:px-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-20">
        {/* Left: the invitation */}
        <div>
          <p data-signup-rise className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink">
            <span aria-hidden className="h-2 w-2 bg-accent" />
            {SIGNUP.eyebrow}
          </p>
          <h2
            data-signup-rise
            className="mt-8 font-display text-[clamp(44px,6.4vw,104px)] font-medium leading-[0.98] tracking-[-0.015em] sm:mt-10"
          >
            <span className="block">Join the</span>
            <span className="block">waiting list</span>
          </h2>
          <p
            data-signup-rise
            className="mt-8 max-w-[30ch] font-sans text-[clamp(18px,1.6vw,24px)] leading-snug text-ink/70"
          >
            {SIGNUP.subline}
          </p>
        </div>

        {/* Right: the form */}
        {status === "success" ? (
          <div role="status" className="self-center">
            <p
              data-success-rise
              className="flex items-center gap-4 font-display text-[clamp(30px,3.6vw,56px)] font-medium leading-[1.05]"
            >
              <span aria-hidden className="h-[0.22em] w-[0.22em] shrink-0 bg-accent" />
              {SIGNUP.successTitle}
            </p>
            <p data-success-rise className="mt-5 max-w-[34ch] font-sans text-[17px] leading-snug text-ink/70">
              {SIGNUP.successBody}
            </p>
          </div>
        ) : (
          <form
            data-signup-rise
            onSubmit={onSubmit}
            noValidate
            className="relative self-end"
            aria-describedby={firstError ? "signup-error" : undefined}
          >
            <div className="grid gap-10">
              <Field id="signup-name" label={SIGNUP.nameLabel} error={errors.name}>
                <input
                  id="signup-name"
                  ref={nameRef}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={SIGNUP.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                  className={input}
                />
              </Field>
              <Field id="signup-email" label={SIGNUP.emailLabel} error={errors.email}>
                <input
                  id="signup-email"
                  ref={emailRef}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={SIGNUP.emailPlaceholder}
                  aria-invalid={Boolean(errors.email)}
                  className={input}
                />
              </Field>
            </div>

            {/* Honeypot: hidden from people, tempting to bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <label className="mt-10 flex max-w-[48ch] cursor-pointer items-start gap-3 font-sans text-[14px] leading-snug text-ink/65 sm:text-[15px]">
              <input
                ref={consentRef}
                type="checkbox"
                name="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                className="signup-check mt-[2px]"
              />
              <span>{SIGNUP.consent}</span>
            </label>

            <p
              id="signup-error"
              role="alert"
              className="mt-6 flex min-h-[1.25rem] items-center gap-2 font-mono text-[11px] tracking-wide text-ink"
            >
              {firstError && (
                <>
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-accent" />
                  {firstError}
                </>
              )}
            </p>

            <div className="mt-6">
              <TextLink type="submit" disabled={busy} aria-busy={busy} className="text-[16px] disabled:cursor-wait">
                {busy ? SIGNUP.buttonBusy : SIGNUP.button}
              </TextLink>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
