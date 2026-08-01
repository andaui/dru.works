"use client";

import { useState } from "react";

/** The five "/"-prefixed intro clauses (desktop only). */
const DEFAULT_INTRO_LINES = [
  "/ I’m a design partner with engineering fluency, unafraid to push things further than briefs ask",
  "/ Working with founders and product teams shipping software worth using",
  "/ I’m driven by curiosity, risk, and the search for ideas that haven’t been done yet",
  "/ I generate design concepts constantly, some stay in the studio, some find their way into the world",
  "/ Recent clients include Intercom, Hilo, Feeld, and Revolut",
];

const DEFAULT_INTRO_PARAGRAPH =
  "I care deeply about the ‘invisible’ details—the clarity, consistency, and refinement that transform a functional interface into a trusted brand experience.";

const DEFAULT_SERVICES = [
  "Visual Design",
  "Re-designs",
  "Design systems",
  "Prototyping",
  "Motion design",
  "Auditing",
  "UX, UI",
  "0→1",
  "Front-end development",
  "Websites",
  "Creative direction",
  "Mentoring",
];

type HomeHeroIntroProps = {
  introLines?: string[];
  introParagraph?: string | null;
  /** About-page copy shown when the About tab is active. */
  aboutContent?: string | null;
  /** Service names shown (each with a "/" prefix) when the Services tab is active. */
  services?: string[];
  /** Nav labels resolved from Sanity page titles (fall back to defaults). */
  projectsLabel?: string;
  aboutLabel?: string;
  servicesLabel?: string;
  /** Contact email (Sanity homeIndex.contactEmail). */
  contactEmail?: string | null;
};

type Tab = "index" | "about" | "services";

const navBase = "font-plex text-[14px] leading-[19px] transition-colors bg-transparent border-0 p-0 cursor-pointer";
const lineClass = "m-0 leading-[23px]";

export default function HomeHeroIntro({
  introLines = DEFAULT_INTRO_LINES,
  introParagraph = DEFAULT_INTRO_PARAGRAPH,
  aboutContent,
  services,
  projectsLabel = "Projects",
  aboutLabel = "About",
  servicesLabel = "Services",
  contactEmail,
}: HomeHeroIntroProps) {
  const [tab, setTab] = useState<Tab>("index");
  const [emailCopied, setEmailCopied] = useState(false);

  // Clicking an active tab returns to the default (index) text.
  const toggle = (t: Exclude<Tab, "index">) =>
    setTab((cur) => (cur === t ? "index" : t));

  const email = (contactEmail && contactEmail.trim()) || "carterandrew93@gmail.com";

  const handleContactClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  const paragraph = (introParagraph && introParagraph.trim()) || DEFAULT_INTRO_PARAGRAPH;
  const aboutText = (aboutContent && aboutContent.trim()) || "";
  const servicesList = services && services.length ? services : DEFAULT_SERVICES;

  const tabClass = (t: Tab) =>
    `${navBase} ${tab === t ? "text-foreground" : "text-[#989898] hover:text-foreground"}`;

  return (
    <section className="w-full px-[2.5%] sm:px-6 pt-[22px]" aria-label="Introduction">
      {/* Top bar — mobile: logo then nav stacked; desktop: logo left, nav right */}
      <div className="flex flex-col gap-[16px] w-full sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-[7.73px] whitespace-nowrap pl-1">
          <span className="font-soehne text-[15.46px] leading-[28.6px] tracking-[-0.19px]">
            ドゥル
          </span>
          <span className="font-plex font-semibold text-[16px] leading-[17px] tracking-[0.77px]">
            DRU
          </span>
        </div>

        <nav
          className="flex items-center gap-[16px] sm:gap-[22px] pl-1 sm:pl-0 sm:shrink-0"
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => setTab("index")}
            aria-pressed={tab === "index"}
            className={tabClass("index")}
          >
            {projectsLabel}
          </button>
          <button
            type="button"
            onClick={() => toggle("about")}
            aria-pressed={tab === "about"}
            className={tabClass("about")}
          >
            {aboutLabel}
          </button>
          <button
            type="button"
            onClick={() => toggle("services")}
            aria-pressed={tab === "services"}
            className={tabClass("services")}
          >
            {servicesLabel}
          </button>
          {/* Contact — desktop only */}
          <button
            type="button"
            onClick={handleContactClick}
            className={`${navBase} hidden sm:inline text-[#989898] hover:text-foreground`}
          >
            {emailCopied ? "Email copied" : "Contact"}
          </button>
        </nav>
      </div>

      {/* Intro text — swaps between default / about / services in place */}
      <div className="mt-[24px] flex flex-col gap-[34px] font-plex text-[14px] text-foreground pl-1 w-full max-w-[640px]">
        {tab === "index" && (
          <>
            {/* Slash clauses — desktop only */}
            <div className="hidden sm:flex flex-col">
              {introLines.map((line, i) => (
                <p key={i} className={lineClass}>
                  {line}
                </p>
              ))}
            </div>
            <p className={`${lineClass} max-w-[560px]`}>{paragraph}</p>
          </>
        )}

        {tab === "about" &&
          (aboutText ? (
            <p className={`${lineClass} whitespace-pre-line`}>{aboutText}</p>
          ) : (
            <p className={`${lineClass} text-foreground/45`}>
              Add copy in Sanity: Pages → About → Homepage description.
            </p>
          ))}

        {tab === "services" && (
          <div className="flex flex-col">
            {servicesList.map((s, i) => (
              <p key={`${s}-${i}`} className={lineClass}>
                / {s}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
