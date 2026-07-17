"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_HERO_DESCRIPTION =
  "I bridge the gap between complex product requirements and world-class visual execution. I bring the precision and craft of a top-tier studio to every engagement. I care deeply about the 'invisible' details—the clarity, consistency, and refinement that transform a functional interface into a trusted brand experience.";

interface LoginFormProps {
  heroTitle?: string;
  homepageDescription?: string;
}

function Rule() {
  return <div className="h-px w-full bg-border shrink-0" aria-hidden />;
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width={15}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M13.4173 21.5455L11.7767 19.9262L18.531 13.1719H1.03809V10.8282H18.531L11.7767 4.09521L13.4173 2.45459L22.9628 12L13.4173 21.5455Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Figma 2302:5 — plain 14px text row above a hairline rule. */
const textClass = "font-plex text-[14px] leading-[23px] text-foreground m-0";

export default function LoginForm({ homepageDescription }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const description =
    (homepageDescription && homepageDescription.trim()) || DEFAULT_HERO_DESCRIPTION;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = password.trim().length > 0 && !isLoading;

  return (
    <section
      className="relative w-full min-h-[100dvh] min-h-screen px-[2.5%] sm:px-6 pt-[22px] pb-[80px] bg-background overflow-x-hidden"
      aria-label="Sign in"
    >
      {/* Right-aligned 812px column: description, then form */}
      <div className="flex justify-end w-full">
        <div className="w-full lg:w-[812px] max-w-full flex flex-col gap-[80px] lg:gap-[144px]">
          <p className={`${textClass} w-full`}>{description}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[6px] w-full">
            {/* Password label */}
            <div className="flex flex-col gap-1 pt-1">
              <h2 className={textClass}>Password</h2>
              <Rule />
            </div>

            {/* Input + inline error */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center justify-between gap-4 w-full min-w-0">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "password-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent border-0 p-0 font-plex text-[14px] leading-[23px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-0 disabled:opacity-30 disabled:cursor-not-allowed"
                />
                {error ? (
                  <p
                    id="password-error"
                    className="font-inter text-[14px] leading-[19px] text-[#5d5d5d] shrink-0 max-w-[min(50%,280px)] text-right m-0"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
              <Rule />
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-1 pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex items-center justify-between gap-4 w-full text-left p-0 border-0 bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className={textClass}>{isLoading ? "Verifying…" : "Submit"}</span>
                <IconArrowRight className="shrink-0 w-[15px] h-[13px] text-foreground/60 group-hover:text-foreground transition-colors" />
              </button>
              <Rule />
            </div>
          </form>
        </div>
      </div>

      {/* dru.works — bottom-left */}
      <p className={`${textClass} absolute left-6 bottom-[24px] select-none`} aria-hidden>
        dru.works
      </p>
    </section>
  );
}
