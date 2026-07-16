"use client";

import { useState } from "react";

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
  /** Second row label + expandable detail (team/designers). */
  teamLabel?: string;
  teamDetail?: string | null;
};

const rowLabelClass = "m-0 font-plex font-semibold text-[14px] leading-[23px] text-foreground";
const rowValueClass = "m-0 font-plex text-[14px] leading-[21px] text-foreground";
const ruleClass = "h-px w-full bg-border";

export default function HomeClientsPricing({
  clientColumns = DEFAULT_CLIENT_COLS,
  monthlyRateValue = "GBP 20,000",
  teamLabel = "When a broader team is needed, I can bring in trusted designers",
  teamDetail,
}: HomeClientsPricingProps) {
  const [expanded, setExpanded] = useState(false);
  const cols = clientColumns.length ? clientColumns : DEFAULT_CLIENT_COLS;

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[64px] lg:pt-[104px]"
      aria-label="Clients and pricing"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-8 w-full">
        {/* Client columns */}
        <div className="flex gap-12 sm:gap-[79px] shrink-0 pl-1">
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

        {/* Pricing table */}
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

          {/* Team / expandable */}
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
            {expanded && teamDetail ? (
              <p className={`${rowValueClass} pt-3 text-foreground/70 whitespace-pre-line max-w-[640px]`}>
                {teamDetail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
