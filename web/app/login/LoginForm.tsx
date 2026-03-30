"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeLabelToggle from "@/components/ThemeLabelToggle";

const DEFAULT_HERO_DESCRIPTION =
  "I bridge the gap between complex product requirements and world-class visual execution. I bring the precision and craft of a top-tier studio to every engagement. I care deeply about the 'invisible' details—the clarity, consistency, and refinement that transform a functional interface into a trusted brand experience.";

interface LoginFormProps {
  heroTitle?: string;
  homepageDescription?: string;
}

function Rule() {
  return <div className="h-px w-full bg-border shrink-0" aria-hidden />;
}

/** Space between row text and the rule below (matches HomePricingCalculator) */
const pricingRowTextPb = "pb-[calc(var(--spacing)*1)]";

/** Matches homepage hero client/services lists (`HomeLandingHero` listClass). */
const heroListTextClass =
  "font-inter font-normal text-[14px] leading-[19px]";

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
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
    <>
      <section
        className="relative w-full min-h-[100dvh] min-h-screen px-[2.5%] sm:px-6 pt-[22px] pb-[140px] lg:pb-[160px] bg-background"
        aria-label="Sign in"
      >
        <div className="grid grid-cols-12 gap-x-1 gap-y-10 lg:gap-y-8 w-full">
          <div className="col-span-12 flex w-full items-center justify-end gap-4 pl-2">
            <ThemeLabelToggle />
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7 min-w-0">
            <div className="flex flex-col w-full">
              <p className="font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
                {description}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-[144px] flex flex-col gap-1 w-full"
              >
                <Rule />
                <div className="pt-1 pb-0">
                  <h2
                    className={`font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] m-0 ${pricingRowTextPb}`}
                    style={{ color: "var(--accent)" }}
                  >
                    Password
                  </h2>
                  <Rule />
                </div>
                <div className="pt-1">
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
                      className="min-w-0 flex-1 bg-transparent border-0 p-0 font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-0 disabled:opacity-20 disabled:cursor-not-allowed"
                    />
                    {error ? (
                      <p
                        id="password-error"
                        className={`${heroListTextClass} shrink-0 max-w-[min(50%,280px)] text-right text-foreground m-0 pb-1 opacity-50`}
                        role="alert"
                      >
                        {error}
                      </p>
                    ) : null}
                  </div>
                  <Rule />
                </div>
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`group flex items-center justify-between gap-4 w-full text-left p-0 border-0 bg-transparent ${pricingRowTextPb} disabled:opacity-20 disabled:cursor-not-allowed`}
                  >
                    <span className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground/50 transition-colors group-hover:text-foreground/70">
                      {isLoading ? "Verifying..." : "Submit"}
                    </span>
                    <IconArrowRight className="shrink-0 w-6 h-6 text-muted opacity-60 transition-opacity group-hover:opacity-100 group-hover:text-foreground" />
                  </button>
                  <Rule />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div
        className="pointer-events-none fixed bottom-[18px] left-6 z-10 font-soehne font-normal text-[70px] leading-[65px] tracking-[-0.25px] text-black dark:text-white select-none"
        aria-hidden
      >
        dru.works
      </div>
    </>
  );
}
