"use client";

import { useState } from "react";
import {
  DEFAULT_HOME_PRICING_RATES,
  type HomePricingTierRates,
} from "@/components/HomePricingCalculator";

/** Figma 2190:171 — three client-name columns. Overridable from Sanity (homeIndex.clientColumns). */
const DEFAULT_CLIENT_COLS: string[][] = [
  ["Google", "Intercom", "Fin AI", "Pydantic", "Logfire", "Badoo", "Jamie AI", "Bumble", "FEELD"],
  ["Revolut", "Pliant", "Rallly", "Tuza", "Hilo", "OLX", "Global Gaming", "BlackRock", "NAB Bank"],
  ["Voy", "Jio Finance", "Fitbit", "Auto Trader", "Otodom"],
];

type HomeClientsPricingProps = {
  clientColumns?: string[][];
  /** Monthly rate figure, formatted (e.g. "GBP 20,000"). */
  monthlyRateValue?: string;
  /** Second row label. */
  teamLabel?: string;
  /** Pricing amounts from Sanity (partial allowed; merged with defaults). */
  pricingRates?: Partial<HomePricingTierRates>;
  /** Max designers the stepper allows. */
  maxDesigners?: number;
  /** Toggle the pricing block (Sanity). Client list stays visible when false. */
  showPricing?: boolean;
};

const rowLabelClass = "m-0 font-plex font-semibold text-[14px] leading-[23px] text-foreground";
const rowValueClass = "m-0 font-plex text-[14px] leading-[21px] text-foreground";
const ruleClass = "h-px w-full bg-border";
const stepperBtnClass =
  "w-6 h-6 flex items-center justify-center rounded-full bg-[#F2F2F2] text-foreground text-[14px] leading-none disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#e8e8e8] transition-colors";

const gbp = (n: number) => `GBP ${n.toLocaleString("en-GB")}`;

/** All additional designers bill at the tier rate for the current count (volume pricing). */
function tierRateFor(additionalCount: number, r: HomePricingTierRates): number {
  if (additionalCount <= 1) return r.rateAdditional1;
  if (additionalCount === 2) return r.rateAdditional2;
  return r.rateAdditional3Plus;
}

/** One pricing line: label left, value right, rule beneath. */
function PriceRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const cls = emphasis ? rowLabelClass : rowValueClass;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-4">
        <span className={cls}>{label}</span>
        <span className={`${cls} shrink-0 tabular-nums ${emphasis ? "" : "text-foreground/70"}`}>
          {value}
        </span>
      </div>
      <div className={ruleClass} />
    </div>
  );
}

export default function HomeClientsPricing({
  clientColumns = DEFAULT_CLIENT_COLS,
  monthlyRateValue = "GBP 20,000",
  teamLabel = "When a broader team is needed, I can bring in trusted designers",
  pricingRates,
  maxDesigners = 8,
  showPricing = true,
}: HomeClientsPricingProps) {
  const [expanded, setExpanded] = useState(false);
  const [teamSize, setTeamSize] = useState(2);
  const cols = clientColumns.length ? clientColumns : DEFAULT_CLIENT_COLS;

  const rates: HomePricingTierRates = { ...DEFAULT_HOME_PRICING_RATES, ...pricingRates };
  const additional = Math.max(0, teamSize - 1);
  const tierRate = tierRateFor(additional, rates);
  const additionalCost = additional * tierRate;
  const total = rates.baseMonthly + additionalCost;

  const dec = () => setTeamSize((c) => Math.max(1, c - 1));
  const inc = () => setTeamSize((c) => Math.min(maxDesigners, c + 1));

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[64px] lg:pt-[104px]"
      aria-label="Clients and pricing"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-8 w-full">
        {/* Client columns */}
        <div className="flex gap-8 sm:gap-[79px] pl-1 min-w-0">
          {cols.map((col, i) => (
            <ul key={i} className="flex flex-col gap-1 m-0 p-0 list-none">
              {col.map((name, j) => (
                <li
                  key={`${i}-${j}-${name}`}
                  className="font-plex text-[14px] leading-[21px] text-foreground whitespace-nowrap"
                >
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Pricing table — toggled via Sanity (pricingAndDesigners.showPricing) */}
        {showPricing && (
        <div className="flex flex-col gap-[28px] w-full lg:max-w-[815px]">
          {/* Monthly rate */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 pt-1">
              <p className={rowLabelClass}>Monthly rate</p>
              <div className={ruleClass} />
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <p className={rowValueClass}>{monthlyRateValue}</p>
              <div className={ruleClass} />
            </div>
          </div>

          {/* Team / expandable calculator */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 pt-1">
              <p className={rowLabelClass}>{teamLabel}</p>
              <div className={ruleClass} />
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className={`${rowValueClass} text-left bg-transparent border-0 p-0 cursor-pointer hover:opacity-70 transition-opacity w-fit`}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
              <div className={ruleClass} />
            </div>

            {expanded && (
              <div className="pt-4 flex flex-col gap-3 w-full max-w-[520px]">
                {/* Designer stepper */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className={rowValueClass}>Designers</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={dec}
                        disabled={teamSize <= 1}
                        aria-label="Fewer designers"
                        className={stepperBtnClass}
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-plex text-[14px] leading-[21px] text-foreground tabular-nums">
                        {teamSize}
                      </span>
                      <button
                        type="button"
                        onClick={inc}
                        disabled={teamSize >= maxDesigners}
                        aria-label="More designers"
                        className={stepperBtnClass}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={ruleClass} />
                </div>

                {/* Breakdown */}
                <PriceRow label="Lead Designer (Dru)" value={gbp(rates.baseMonthly)} />
                {teamSize > 1 && (
                  <PriceRow
                    label={`${additional === 1 ? "Additional designer" : `Additional designers (×${additional})`} · ${gbp(tierRate)} each`}
                    value={gbp(additionalCost)}
                  />
                )}
                <PriceRow label="Monthly total" value={gbp(total)} emphasis />
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
