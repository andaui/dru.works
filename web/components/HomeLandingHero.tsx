"use client";

import { Fragment, useState } from "react";
import ThemeLabelToggle from "@/components/ThemeLabelToggle";
import HeroReelVideo from "@/components/HeroReelVideo";
import ServicesHomePricingBlock from "@/components/ServicesHomePricingBlock";
import type { ServicesHomeSectionParsed } from "@/lib/servicesHomeSections";

const DEFAULT_HERO_DESCRIPTION =
  "I bridge the gap between complex product requirements and world-class visual execution. I bring the precision and craft of a top-tier studio to every engagement. I care deeply about the 'invisible' details—the clarity, consistency, and refinement that transform a functional interface into a trusted brand experience.";

const CLIENT_COLS: [string[], string[], string[]] = [
  [
    "Google",
    "Intercom",
    "Fin AI",
    "Pydantic",
    "Logfire",
    "Badoo",
    "Jamie AI",
    "Bumble",
    "FEELD",
  ],
  [
    "Revolut",
    "Pliant",
    "Rallly",
    "Tuza",
    "Hilo",
    "OLX",
    "Global Gaming",
    "BlackRock",
    "NAB Bank",
  ],
  ["Voy", "Jio Finance", "Fitbit", "Auto Trader"],
];

const SERVICES_COLS: [string[], string[]] = [
  [
    "Visual Design",
    "Re-designs",
    "Design systems",
    "Prototyping",
    "Motion design",
    "Auditing",
  ],
  [
    "UX, UI",
    "0→1",
    "Front-end development",
    "Websites",
    "Creative direction",
    "Mentoring",
  ],
];

const listClass =
  "home-hero-list-col flex flex-col gap-1 font-inter font-normal text-[14px] leading-[19px]";

/** About / Services hero body (left column). Exact 21px line height. */
const aboutServicesBodyClass =
  "font-inter font-normal text-[14px] [line-height:21px] text-black/70 dark:text-white/60 m-0 whitespace-pre-line";

/** Legacy CMS / old default broke after "with"; prefer break before "fluency". */
function normalizeHomeHeroTitleLines(lines: string[]): string[] {
  if (lines.length !== 2) return lines;
  const [first, second] = lines;
  if (first === "Design partner with" && second === "engineering fluency") {
    return ["Design partner with\u00A0engineering", "fluency"];
  }
  if (second === "fluency") {
    return [first.replace(/\bwith engineering\b/, "with\u00A0engineering"), second];
  }
  return lines;
}

type HomeHeroSection = "index" | "about" | "services";

type HomeLandingHeroProps = {
  heroTitle: string;
  /** Work page — right column intro (Homepage description in Sanity). */
  homepageDescription?: string | null;
  /** About page — left column when About is selected. */
  aboutPageDescription?: string | null;
  /** Services page — left column when Services is selected. */
  servicesPageDescription?: string | null;
  /** Services page hero title (replaces work title when Services is selected). */
  servicesHeroTitle?: string | null;
  /** Services page sections — pricing-style blocks on the home hero. */
  servicesSectionsForHome?: ServicesHomeSectionParsed[];
  heroReelVideoUrl?: string | null;
  aboutLabel?: string;
  servicesLabel?: string;
  /** Sanity Index singleton — client columns; falls back to built-in list when unset. */
  indexClientColumns?: string[][];
  /** Sanity Index singleton — services columns. */
  indexServicesColumns?: string[][];
  /** Contact button between client and services lists (Index tab). */
  indexContactButtonText?: string;
};

export default function HomeLandingHero({
  heroTitle,
  homepageDescription,
  aboutPageDescription,
  servicesPageDescription,
  servicesHeroTitle,
  servicesSectionsForHome = [],
  heroReelVideoUrl,
  aboutLabel = "About",
  servicesLabel = "Services",
  indexClientColumns,
  indexServicesColumns,
  indexContactButtonText = "Contact",
}: HomeLandingHeroProps) {
  const [section, setSection] = useState<HomeHeroSection>("index");

  const clientCols =
    indexClientColumns?.length && indexClientColumns.some((c) => c.length > 0)
      ? indexClientColumns
      : CLIENT_COLS;
  const servicesCols =
    indexServicesColumns?.length && indexServicesColumns.some((c) => c.length > 0)
      ? indexServicesColumns
      : SERVICES_COLS;

  const description =
    (homepageDescription && homepageDescription.trim()) || DEFAULT_HERO_DESCRIPTION;

  const activeTitleSource =
    section === "services" && servicesHeroTitle?.trim()
      ? servicesHeroTitle
      : heroTitle;
  const titleLines = normalizeHomeHeroTitleLines(
    activeTitleSource.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
  );
  const heroTitleLines =
    titleLines.length > 0
      ? titleLines
      : (["Design partner with\u00A0engineering", "fluency"] as const);

  const [firstServiceSection, ...restServiceSections] = servicesSectionsForHome;

  const navMuted = "text-[#989898] dark:text-muted hover:text-foreground transition-colors";
  const navActive = "text-foreground";

  const aboutBody = (aboutPageDescription && aboutPageDescription.trim()) || "";
  const servicesBody = (servicesPageDescription && servicesPageDescription.trim()) || "";

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[22px] pb-[64px] lg:pb-[104px]"
      aria-label="Introduction"
    >
      <div className="grid grid-cols-12 gap-x-1 gap-y-10 lg:gap-y-8 w-full">
        <div className="col-span-12 flex w-full items-center justify-between gap-4 pl-2">
          <nav
            className="flex items-center gap-[15px] font-inter font-normal text-[14px] leading-[19px]"
            aria-label="Page"
          >
            <button
              type="button"
              onClick={() => setSection("index")}
              className={section === "index" ? navActive : navMuted}
              aria-current={section === "index" ? "page" : undefined}
            >
              Index
            </button>
            <button
              type="button"
              onClick={() => setSection("about")}
              className={section === "about" ? navActive : navMuted}
              aria-current={section === "about" ? "page" : undefined}
            >
              {aboutLabel}
            </button>
            <button
              type="button"
              onClick={() => setSection("services")}
              className={section === "services" ? navActive : navMuted}
              aria-current={section === "services" ? "page" : undefined}
            >
              {servicesLabel}
            </button>
          </nav>
          <ThemeLabelToggle />
        </div>

        <div
          className={`col-span-12 min-w-0 ${
            section === "services" ? "lg:col-span-4" : "lg:col-span-6"
          }`}
        >
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-[34px] w-full">
              <h1 className="pl-1 font-soehne font-normal text-[30px] leading-[37px] tracking-[-0.25px] text-foreground m-0">
                {heroTitleLines.map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </Fragment>
                ))}
              </h1>

              {section === "index" ? (
                <>
                  <div className="flex flex-wrap gap-x-[48px] gap-y-6 sm:gap-x-[79px] items-start pl-1">
                    {clientCols.map((col, i) => (
                      <div key={i} className={listClass}>
                        {col.map((name, j) => (
                          <p key={`${i}-${j}-${name}`} className="m-0 whitespace-nowrap">
                            {name}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <a
                    href="mailto:carterandrew93@gmail.com"
                    className="inline-flex items-center justify-center rounded-[36px] bg-[#070707] dark:bg-foreground px-[22px] py-3 w-fit font-inter font-normal text-[13px] leading-[19px] text-[#f7f7f7] dark:text-background no-underline hover:opacity-90 transition-opacity"
                  >
                    {indexContactButtonText}
                  </a>

                  <div className="flex flex-wrap gap-6 sm:gap-6 items-start pl-1">
                    {servicesCols.map((col, i) => (
                      <div key={i} className={listClass}>
                        {col.map((name, j) => (
                          <p key={`${i}-${j}-${name}`} className="m-0 whitespace-nowrap">
                            {name}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : section === "about" ? (
                <div className="pl-1 w-full min-w-0 max-w-[445px]">
                  {aboutBody ? (
                    <p className={aboutServicesBodyClass}>{aboutBody}</p>
                  ) : (
                    <p
                      className={`${aboutServicesBodyClass} text-black/45 dark:text-white/45`}
                    >
                      Add copy in Sanity: Pages → About → Homepage description.
                    </p>
                  )}
                </div>
              ) : (
                <div className="pl-1 w-full min-w-0 max-w-[440px] flex flex-col gap-[34px]">
                  {servicesBody ? (
                    <p className={aboutServicesBodyClass}>{servicesBody}</p>
                  ) : null}
                  <a
                    href="mailto:carterandrew93@gmail.com"
                    className="inline-flex items-center justify-center rounded-[36px] bg-[#070707] dark:bg-foreground px-[22px] py-3 w-fit font-inter font-normal text-[13px] leading-[19px] text-[#f7f7f7] dark:text-background no-underline hover:opacity-90 transition-opacity"
                  >
                    Contact
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`col-span-12 min-w-0 ${
            section === "services" ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-6"
          }`}
        >
          {section === "services" ? (
            <div className="flex flex-col w-full">
              {firstServiceSection ? (
                <ServicesHomePricingBlock
                  data={firstServiceSection}
                  variant="heroRight"
                />
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:gap-[31px] w-full">
              <p className="font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
                {description}
              </p>

              {heroReelVideoUrl ? (
                <HeroReelVideo src={heroReelVideoUrl} />
              ) : (
                <div
                  className="relative w-full h-[min(70vw,420px)] sm:h-[440px] lg:h-[495px] rounded-[25px] overflow-hidden bg-[#e5e5e5] dark:bg-white/[0.06] border border-dashed border-border"
                  aria-label="Video placeholder"
                >
                  <span className="sr-only">Video placeholder</span>
                </div>
              )}
            </div>
          )}
        </div>

        {section === "services" &&
          restServiceSections.map((s) => (
            <div
              key={s._id}
              className="col-span-12 w-full mt-10 lg:mt-[62px] min-w-0"
            >
              <ServicesHomePricingBlock data={s} variant="fullWidth" />
            </div>
          ))}

        {section === "services" ? (
          <div
            className={`col-span-12 min-w-0 lg:col-span-6 lg:col-start-7 ${
              firstServiceSection || restServiceSections.length > 0
                ? "mt-10 lg:mt-[62px]"
                : ""
            }`}
          >
            <div className="flex flex-col gap-8 lg:gap-[31px] w-full">
              <p className="font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
                {description}
              </p>

              {heroReelVideoUrl ? (
                <HeroReelVideo src={heroReelVideoUrl} />
              ) : (
                <div
                  className="relative w-full h-[min(70vw,420px)] sm:h-[440px] lg:h-[495px] rounded-[25px] overflow-hidden bg-[#e5e5e5] dark:bg-white/[0.06] border border-dashed border-border"
                  aria-label="Video placeholder"
                >
                  <span className="sr-only">Video placeholder</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
