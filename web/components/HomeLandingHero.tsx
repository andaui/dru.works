import NextLink from "next/link";

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
  "flex flex-col gap-1 font-inter font-normal text-[13px] leading-[19px] text-[#5d5d5d] dark:text-muted";

type HomeLandingHeroProps = {
  heroTitle: string;
  heroDescription?: string | null;
};

export default function HomeLandingHero({
  heroTitle,
  heroDescription,
}: HomeLandingHeroProps) {
  const description = (heroDescription && heroDescription.trim()) || DEFAULT_HERO_DESCRIPTION;
  const titleLines = heroTitle.split("\n").map((l) => l.trim()).filter(Boolean);
  const displayTitle = titleLines.length ? titleLines.join(" ") : "Design partner with engineering fluency";

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[22px] pb-[64px] lg:pb-[104px]"
      aria-label="Introduction"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-8 w-full max-w-[1900px] mx-auto">
        <div className="flex flex-col gap-8 w-full max-w-[441px] shrink-0">
          <nav
            className="flex items-center gap-[15px] pl-2 font-inter font-normal text-[13px] leading-[19px]"
            aria-label="Page"
          >
            <NextLink href="/" className="text-foreground">
              Index
            </NextLink>
          </nav>

          <div className="flex flex-col gap-[34px] w-full pl-1">
            <h1 className="font-soehne font-normal text-[30px] leading-[37px] tracking-[-0.25px] text-foreground m-0">
              {displayTitle}
            </h1>

            <div className="flex flex-wrap gap-x-[48px] gap-y-6 sm:gap-x-[79px] items-start">
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

        <div className="flex flex-col gap-8 lg:gap-[31px] w-full lg:max-w-[812px] lg:pt-[52px] shrink-0">
          <p className="font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0">
            {description}
          </p>

          {/* Swap this container for a &lt;video&gt; (or poster + controls) when the asset is ready */}
          <div
            className="relative w-full h-[min(70vw,420px)] sm:h-[440px] lg:h-[495px] rounded-[25px] overflow-hidden bg-[#e5e5e5] dark:bg-white/[0.06] border border-dashed border-border"
            aria-label="Video placeholder"
          >
            <span className="sr-only">Video placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
