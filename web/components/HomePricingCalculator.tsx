"use client";

import NextLink from "next/link";
import { useMemo, useState } from "react";

const accent = "#de2475";

function formatGbp(n: number): string {
  return `GBP ${n.toLocaleString("en-GB")}`;
}

type HomePricingCalculatorProps = {
  /** Shown in the first block (e.g. from CMS) */
  headlineMonthlyLabel?: string;
  headlineMonthlyValue?: string;
  baseMonthly: number;
  perAdditionalDesigner: number;
  savingPerAdditional: number;
  minDesigners?: number;
  maxDesigners?: number;
};

function Rule() {
  return <div className="h-px w-full bg-border shrink-0" aria-hidden />;
}

/** Inline SVGs (same paths as /public/*.svg) so icons always render; no extra HTTP + no middleware issues. */
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

function IconMinus({ className }: { className?: string }) {
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
        d="M14.0927 9.90747H22.7777V14.0925H14.0927H9.86266H1.22266V9.90747H9.86266H14.0927Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
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
        d="M14.0927 9.95253H22.7777V14.1375H14.0927V22.9125H9.86266V14.1375H1.22266V9.95253H9.86266V1.08752H14.0927V9.95253Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function HomePricingCalculator({
  headlineMonthlyLabel = "Monthly rate",
  headlineMonthlyValue,
  baseMonthly,
  perAdditionalDesigner,
  savingPerAdditional,
  minDesigners = 1,
  maxDesigners = 8,
}: HomePricingCalculatorProps) {
  const [n, setN] = useState(2);

  const headlineValue =
    headlineMonthlyValue ?? formatGbp(baseMonthly);

  const { listTotal, saving, finalTotal, additional } = useMemo(() => {
    const add = Math.max(0, n - 1);
    const list = baseMonthly + add * perAdditionalDesigner;
    const sav = add * savingPerAdditional;
    return {
      additional: add,
      listTotal: list,
      saving: sav,
      finalTotal: list - sav,
    };
  }, [n, baseMonthly, perAdditionalDesigner, savingPerAdditional]);

  const dec = () => setN((c) => Math.max(minDesigners, c - 1));
  const inc = () => setN((c) => Math.min(maxDesigners, c + 1));

  return (
    <section
      id="pricing"
      className="w-full max-w-[1900px] mx-auto flex flex-col gap-10 lg:gap-[62px] scroll-mt-4"
      aria-labelledby="home-pricing-heading"
    >
      {/* Block 1 — monthly rate + how I work */}
      <div className="flex flex-col gap-1 w-full">
        <Rule />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-4 pt-2 px-0 sm:px-0 w-full">
          <div
            className="flex items-center pt-2 shrink-0 gap-[11px]"
            aria-hidden
          >
            <div className="h-14 w-[53px] rounded-sm bg-border dark:bg-white/10" />
          </div>
          <div className="flex flex-col w-full sm:max-w-[815px] sm:ml-auto gap-0">
            <div className="pt-1 pb-0">
              <h2
                id="home-pricing-heading"
                className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0"
              >
                {headlineMonthlyLabel}
              </h2>
              <Rule />
            </div>
            <div className="pt-1">
              <p
                className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] m-0 whitespace-pre-wrap"
                style={{ color: accent }}
              >
                {headlineValue}
              </p>
              <Rule />
            </div>
            <div className="pt-1">
              <NextLink
                href="/about#section-pricing"
                className="flex items-center justify-between gap-4 w-full text-left group"
              >
                <span className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground/50 group-hover:text-foreground/70 transition-colors">
                  How I work
                </span>
                <IconArrowRight className="shrink-0 w-6 h-6 text-muted opacity-60 group-hover:opacity-100 group-hover:text-foreground transition-all" />
              </NextLink>
              <Rule />
            </div>
          </div>
        </div>
      </div>

      {/* Block 2 — team + calculator */}
      <div className="flex flex-col gap-1 w-full">
        <Rule />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-4 pt-2 w-full">
          <div className="flex items-center pt-2 gap-[11px] shrink-0" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-[53px] rounded-sm bg-border dark:bg-white/10"
              />
            ))}
          </div>
          <div className="flex flex-col w-full sm:max-w-[815px] sm:ml-auto gap-[52px]">
            <div>
              <div className="pt-1">
                <p className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
                  When a project requires a broader team, I can bring in trusted
                  designers
                </p>
                <Rule />
              </div>
              <div className="pt-1">
                <NextLink
                  href="/about#mentorship"
                  className="flex items-center justify-between gap-4 w-full text-left group"
                >
                  <span className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground/50 group-hover:text-foreground/70 transition-colors">
                    Learn more
                  </span>
                  <IconArrowRight className="shrink-0 w-6 h-6 text-muted opacity-60 group-hover:opacity-100 group-hover:text-foreground transition-all" />
                </NextLink>
                <Rule />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <p
                className="font-soehne font-normal text-foreground tracking-[-0.25px] m-0 tabular-nums leading-none"
                style={{ fontSize: "clamp(3rem, 15vw, 7.8125rem)" }}
                aria-live="polite"
              >
                {n}
              </p>
              <div className="flex items-center gap-8 sm:gap-10 shrink-0">
                <button
                  type="button"
                  onClick={dec}
                  disabled={n <= minDesigners}
                  className="p-0 border-0 bg-transparent cursor-pointer text-foreground disabled:opacity-25 disabled:pointer-events-none hover:opacity-70 transition-opacity flex items-center justify-center"
                  aria-label="Decrease number of designers"
                >
                  <IconMinus className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={inc}
                  disabled={n >= maxDesigners}
                  className="p-0 border-0 bg-transparent cursor-pointer text-foreground disabled:opacity-25 disabled:pointer-events-none hover:opacity-70 transition-opacity flex items-center justify-center"
                  aria-label="Increase number of designers"
                >
                  <IconPlus className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-[815px]">
              <div className="pt-1">
                <div className="flex items-center justify-between gap-4 text-[18px] sm:text-[24px] tracking-[-0.25px] w-full">
                  <p className="font-soehne font-normal m-0 leading-[37px]">
                    <span className="text-foreground">Designers </span>
                    <span className="text-[#808080] dark:text-muted">
                      (Including Dru)
                    </span>
                  </p>
                  <p className="font-soehne font-normal text-foreground/50 m-0 leading-[37px] tabular-nums">
                    {n}
                  </p>
                </div>
                <Rule />
              </div>
              <div className="pt-1">
                <div className="flex items-center justify-between gap-4 font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] w-full whitespace-nowrap">
                  <span className="text-foreground">Per additional designer</span>
                  <span className="text-foreground/50 tabular-nums">
                    {formatGbp(perAdditionalDesigner)}
                  </span>
                </div>
                <Rule />
              </div>
              {additional > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between gap-4 font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] w-full">
                    <span className="text-foreground">Discount</span>
                    <div className="flex items-center justify-end gap-4 sm:gap-6 shrink-0">
                      <span className="line-through opacity-50 text-foreground tabular-nums">
                        {formatGbp(listTotal)}
                      </span>
                      <span className="tabular-nums" style={{ color: accent }}>
                        {formatGbp(finalTotal)}
                      </span>
                    </div>
                  </div>
                  <Rule />
                </div>
              )}
              {additional > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span className="font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground whitespace-nowrap">
                      Saving per month
                    </span>
                    <span className="font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground/50 tabular-nums whitespace-nowrap">
                      -{formatGbp(saving)}
                    </span>
                  </div>
                  <Rule />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
