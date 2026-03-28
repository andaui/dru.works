"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useMemo, useState } from "react";

const accent = "#DE2475";

export type HomePricingSideImage = {
  src: string;
  alt: string;
};

/** Amounts for the calculator; merge with defaults when passing partial CMS values. */
export type HomePricingTierRates = {
  baseMonthly: number;
  rateAdditional1: number;
  rateAdditional2: number;
  rateAdditional3Plus: number;
};

export const DEFAULT_HOME_PRICING_RATES: HomePricingTierRates = {
  baseMonthly: 20_000,
  rateAdditional1: 13_500,
  rateAdditional2: 13_000,
  rateAdditional3Plus: 12_500,
};

function formatGbp(n: number): string {
  return `GBP ${n.toLocaleString("en-GB")}`;
}

function tierRatePerAdditional(
  additionalCount: number,
  r: HomePricingTierRates,
): number {
  if (additionalCount <= 1) return r.rateAdditional1;
  if (additionalCount === 2) return r.rateAdditional2;
  return r.rateAdditional3Plus;
}

type HomePricingCalculatorProps = {
  minDesigners?: number;
  maxDesigners?: number;
  /** Optional overrides from Sanity `pricingAndDesigners` (partial allowed). */
  pricingRates?: Partial<HomePricingTierRates>;
  /** Left stripe beside “Monthly rate” — usually Dru’s portrait from CMS. */
  monthlyRateSideImage?: HomePricingSideImage;
  /**
   * Second-row stripe: Dru first, then additional designer photos (any length).
   * If empty/omitted, five gray placeholders are shown.
   */
  teamPricingSideImages?: HomePricingSideImage[];
};

function SideStripeThumb({ image }: { image?: HomePricingSideImage }) {
  if (image?.src) {
    return (
      <div className="relative h-14 w-[53px] shrink-0 overflow-hidden rounded-sm bg-border dark:bg-white/10">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="53px"
        />
      </div>
    );
  }
  return (
    <div
      className="h-14 w-[53px] shrink-0 rounded-sm bg-border dark:bg-white/10"
      aria-hidden
    />
  );
}

function Rule() {
  return <div className="h-px w-full bg-border shrink-0" aria-hidden />;
}

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
  minDesigners = 1,
  maxDesigners = 8,
  pricingRates: pricingRatesProp,
  monthlyRateSideImage,
  teamPricingSideImages,
}: HomePricingCalculatorProps) {
  const [teamSize, setTeamSize] = useState(1);
  const [teamPricingOpen, setTeamPricingOpen] = useState(false);

  const rates = useMemo(
    () => ({ ...DEFAULT_HOME_PRICING_RATES, ...pricingRatesProp }),
    [pricingRatesProp],
  );

  const { additionalCount, rateEach, totalMonthly } = useMemo(() => {
    const add = Math.max(0, teamSize - 1);
    const tierRate =
      add <= 0 ? rates.rateAdditional1 : tierRatePerAdditional(add, rates);
    const additionalCost =
      add === 0 ? 0 : add * tierRatePerAdditional(add, rates);
    const totalMonthly = rates.baseMonthly + additionalCost;
    return {
      additionalCount: add,
      rateEach: tierRate,
      totalMonthly,
    };
  }, [teamSize, rates]);

  const teamStripeSlots =
    teamPricingSideImages && teamPricingSideImages.some((img) => img?.src)
      ? teamPricingSideImages
      : (Array.from({ length: 5 }, () => undefined) as (
          | HomePricingSideImage
          | undefined
        )[]);

  const additionalRowLabel =
    additionalCount >= 2 ? "Additional designers" : "Additional designer";

  const dec = () => setTeamSize((c) => Math.max(minDesigners, c - 1));
  const inc = () => setTeamSize((c) => Math.min(maxDesigners, c + 1));

  return (
    <section
      id="pricing"
      className="w-full max-w-[1900px] mx-auto flex flex-col gap-10 lg:gap-[62px] scroll-mt-4"
      aria-labelledby="home-pricing-heading"
    >
      <div className="flex flex-col gap-1 w-full">
        <Rule />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-4 px-0 sm:px-0 w-full">
          <div
            className="flex items-center pt-[8px] shrink-0 gap-[11px]"
            {...(!monthlyRateSideImage?.src ? { "aria-hidden": true } : {})}
          >
            <SideStripeThumb image={monthlyRateSideImage} />
          </div>
          <div className="flex flex-col w-full sm:max-w-[815px] sm:ml-auto gap-0">
            <div className="pt-1 pb-0">
              <h2
                id="home-pricing-heading"
                className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0"
              >
                Monthly rate
              </h2>
              <Rule />
            </div>
            <div className="pt-1">
              <p
                className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] m-0 whitespace-pre-wrap"
                style={{ color: accent }}
                aria-live="polite"
              >
                {formatGbp(rates.baseMonthly)}
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

      <div className="flex flex-col gap-1 w-full">
        <Rule />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-4 w-full">
          <div
            className="flex items-center pt-[8px] gap-[11px] shrink-0"
            {...(!teamPricingSideImages?.some((img) => img?.src)
              ? { "aria-hidden": true }
              : {})}
          >
            {teamStripeSlots.map((img, i) => (
              <SideStripeThumb
                key={`${i}-${img?.src ?? "placeholder"}`}
                image={img}
              />
            ))}
          </div>
          <div className="flex flex-col w-full sm:max-w-[815px] sm:ml-auto gap-[52px]">
            <div>
              <div className="pt-1">
                <p className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
                  When a broader team is needed, I can bring in trusted designers
                </p>
                <Rule />
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  id="pricing-team-toggle"
                  aria-expanded={teamPricingOpen}
                  aria-controls="pricing-team-details"
                  onClick={() => setTeamPricingOpen((o) => !o)}
                  className="flex items-center justify-between gap-4 w-full text-left group p-0 border-0 bg-transparent cursor-pointer"
                >
                  <span className="font-soehne font-normal text-[20px] sm:text-[24px] leading-[37px] tracking-[-0.25px] text-foreground/50 group-hover:text-foreground/70 transition-colors">
                    {teamPricingOpen ? "Show less" : "Learn more"}
                  </span>
                  <IconArrowRight
                    className={`shrink-0 w-6 h-6 text-muted opacity-60 group-hover:opacity-100 group-hover:text-foreground transition-transform duration-200 ${
                      teamPricingOpen ? "-rotate-90" : ""
                    }`}
                  />
                </button>
                <Rule />
              </div>
            </div>

            <div
              className={`grid w-full transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
                teamPricingOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  id="pricing-team-details"
                  className="flex flex-col gap-[52px] w-full"
                  role="region"
                  aria-labelledby="pricing-team-toggle"
                  aria-hidden={!teamPricingOpen}
                  {...(!teamPricingOpen ? { inert: true } : {})}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <p
                      className="font-soehne font-normal text-foreground tracking-[-0.25px] m-0 tabular-nums leading-none"
                      style={{ fontSize: "clamp(3rem, 15vw, 7.8125rem)" }}
                      aria-live="polite"
                    >
                      {teamSize}
                    </p>
                    <div className="flex items-center gap-8 sm:gap-10 shrink-0">
                      <button
                        type="button"
                        onClick={dec}
                        disabled={teamSize <= minDesigners}
                        className="p-0 border-0 bg-transparent cursor-pointer text-foreground disabled:opacity-25 disabled:pointer-events-none hover:opacity-70 transition-opacity flex items-center justify-center"
                        aria-label="Decrease team size"
                      >
                        <IconMinus className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={inc}
                        disabled={teamSize >= maxDesigners}
                        className="p-0 border-0 bg-transparent cursor-pointer text-foreground disabled:opacity-25 disabled:pointer-events-none hover:opacity-70 transition-opacity flex items-center justify-center"
                        aria-label="Increase team size"
                      >
                        <IconPlus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col w-full max-w-[815px]">
                    <div className="pt-1">
                      <div className="flex items-center justify-between gap-4 text-[18px] sm:text-[24px] tracking-[-0.25px] w-full">
                        <p className="font-soehne font-normal m-0 leading-[37px] text-foreground">
                          Team size
                        </p>
                        <p className="font-soehne font-normal text-foreground/50 m-0 leading-[37px] tabular-nums">
                          {teamSize}
                        </p>
                      </div>
                      <Rule />
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center justify-between gap-4 font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] w-full whitespace-nowrap">
                        <span className="text-foreground">Lead Designer (Dru)</span>
                        <span className="text-foreground/50 tabular-nums">
                          {formatGbp(rates.baseMonthly)}
                        </span>
                      </div>
                      <Rule />
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center justify-between gap-4 font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] w-full whitespace-nowrap">
                        <span className="text-foreground">{additionalRowLabel}</span>
                        <span className="text-foreground/50 tabular-nums">
                          {teamSize > 1 ? formatGbp(rateEach) : "—"}
                        </span>
                      </div>
                      <Rule />
                    </div>
                    <div className="pt-1">
                      <div className="flex items-end justify-between gap-4 font-soehne font-normal text-[18px] sm:text-[24px] leading-[37px] tracking-[-0.25px] w-full">
                        <div className="flex flex-col gap-[12px] min-w-0 pr-2">
                          <span className="text-foreground">Monthly total</span>
                          <span className="text-foreground/50">
                            Volume pricing applied automatically
                          </span>
                        </div>
                        <span
                          className="shrink-0 tabular-nums whitespace-nowrap leading-[37px]"
                          style={{ color: accent }}
                        >
                          {formatGbp(totalMonthly)}
                        </span>
                      </div>
                      <Rule />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
