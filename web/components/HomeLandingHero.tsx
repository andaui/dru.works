import { Fragment } from "react";
import NextLink from "next/link";
import ThemeLabelToggle from "@/components/ThemeLabelToggle";
import HeroReelVideo from "@/components/HeroReelVideo";

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
  "home-hero-list-col flex flex-col gap-1 font-inter font-normal text-[13px] leading-[19px]";

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

type HomeLandingHeroProps = {
  heroTitle: string;
  heroDescription?: string | null;
  /** From Homepage Work → Hero reel video; same column width as intro text, height auto. */
  heroReelVideoUrl?: string | null;
  aboutLabel?: string;
  servicesLabel?: string;
};

export default function HomeLandingHero({
  heroTitle,
  heroDescription,
  heroReelVideoUrl,
  aboutLabel = "About",
  servicesLabel = "Services",
}: HomeLandingHeroProps) {
  const description = (heroDescription && heroDescription.trim()) || DEFAULT_HERO_DESCRIPTION;
  const titleLines = normalizeHomeHeroTitleLines(
    heroTitle.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
  );
  const heroTitleLines =
    titleLines.length > 0
      ? titleLines
      : (["Design partner with\u00A0engineering", "fluency"] as const);

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[22px] pb-[64px] lg:pb-[104px]"
      aria-label="Introduction"
    >
      <div className="grid grid-cols-12 gap-x-1 gap-y-10 lg:gap-y-8 w-full">
        <div className="col-span-12 flex w-full items-center justify-between gap-4 pl-2">
          <nav
            className="flex items-center gap-[15px] font-inter font-normal text-[13px] leading-[19px]"
            aria-label="Page"
          >
            <NextLink href="/" className="text-foreground">
              Index
            </NextLink>
            <NextLink
              href="/about"
              className="text-[#989898] dark:text-muted hover:text-foreground transition-colors"
            >
              {aboutLabel}
            </NextLink>
            <NextLink
              href="/services"
              className="text-[#989898] dark:text-muted hover:text-foreground transition-colors"
            >
              {servicesLabel}
            </NextLink>
          </nav>
          <ThemeLabelToggle />
        </div>

        <div className="col-span-12 lg:col-span-6 min-w-0">
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

              <div className="flex flex-wrap gap-x-[48px] gap-y-6 sm:gap-x-[79px] items-start pl-1">
                {CLIENT_COLS.map((col, i) => (
                  <div key={i} className={listClass}>
                    {col.map((name) => (
                      <p key={name} className="m-0 whitespace-nowrap">
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
                Contact
              </a>

              <div className="flex flex-wrap gap-6 sm:gap-6 items-start pl-1">
                {SERVICES_COLS.map((col, i) => (
                  <div key={i} className={listClass}>
                    {col.map((name) => (
                      <p key={name} className="m-0 whitespace-nowrap">
                        {name}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 min-w-0">
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
      </div>
    </section>
  );
}
