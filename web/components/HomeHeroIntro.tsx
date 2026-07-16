"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

/** The five "/"-prefixed intro clauses (Figma 2190:61). Each renders on its own line. */
const DEFAULT_INTRO_LINES = [
  "/ I’m a Design partner with engineering fluency, unafraid to push things further than briefs ask",
  "/ Working with founders and product teams shipping software worth using",
  "/ I’m driven by curiosity, risk, and the search for ideas that haven’t been done yet",
  "/ I generate design concepts constantly, some stay in the studio, some find their way into the world",
  "/ Recent clients include Intercom, Hilo, Feeld, and Revolut",
];

const DEFAULT_INTRO_PARAGRAPH =
  "I care deeply about the ‘invisible’ details—the clarity, consistency, and refinement that transform a functional interface into a trusted brand experience.";

type HomeHeroIntroProps = {
  introLines?: string[];
  introParagraph?: string | null;
  /** Nav labels resolved from Sanity page titles (fall back to defaults). */
  projectsLabel?: string;
  aboutLabel?: string;
  servicesLabel?: string;
};

const navBase =
  "font-plex text-[14px] leading-[19px] transition-colors";

export default function HomeHeroIntro({
  introLines = DEFAULT_INTRO_LINES,
  introParagraph = DEFAULT_INTRO_PARAGRAPH,
  projectsLabel = "Projects",
  aboutLabel = "About",
  servicesLabel = "Services",
}: HomeHeroIntroProps) {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleContactClick = async () => {
    try {
      await navigator.clipboard.writeText("carterandrew93@gmail.com");
      setEmailCopied(true);
    } catch {
      /* clipboard unavailable — the mobile mailto link still works */
    }
  };

  const paragraph = (introParagraph && introParagraph.trim()) || DEFAULT_INTRO_PARAGRAPH;

  return (
    <section
      className="w-full px-[2.5%] sm:px-6 pt-[22px]"
      aria-label="Introduction"
    >
      {/* Top bar: logo (left) + nav (right) */}
      <div className="flex w-full items-center justify-between gap-x-4 gap-y-3 flex-wrap">
        <div className="flex items-center gap-[7.73px] whitespace-nowrap pl-1">
          <span className="font-soehne text-[15.46px] leading-[28.6px] tracking-[-0.19px]">
            ドル
          </span>
          <span className="font-plex font-semibold text-[16px] leading-[17px] tracking-[0.77px]">
            DRU
          </span>
        </div>

        <nav
          className="flex items-center gap-[16px] sm:gap-[22px] shrink-0"
          aria-label="Primary"
        >
          <Link href="/work" className={`${navBase} text-foreground hover:opacity-70`}>
            {projectsLabel}
          </Link>
          <Link
            href="/about"
            className={`${navBase} text-[#989898] hover:text-foreground`}
          >
            {aboutLabel}
          </Link>
          <Link
            href="/services"
            className={`${navBase} text-[#989898] hover:text-foreground`}
          >
            {servicesLabel}
          </Link>
          {/* Contact: desktop copies email, mobile uses mailto */}
          <button
            type="button"
            onClick={handleContactClick}
            className={`${navBase} hidden md:inline text-[#989898] hover:text-foreground bg-transparent border-0 p-0 cursor-pointer`}
          >
            {emailCopied ? "Email copied" : "Contact"}
          </button>
          <a
            href="mailto:carterandrew93@gmail.com"
            className={`${navBase} md:hidden text-[#989898] hover:text-foreground`}
          >
            Contact
          </a>
          <ThemeToggle />
        </nav>
      </div>

      {/* Intro text */}
      <div className="mt-[24px] flex flex-col gap-[34px] font-plex text-[14px] text-foreground pl-1 max-w-[640px]">
        <div className="flex flex-col">
          {introLines.map((line, i) => (
            <p key={i} className="m-0 leading-[23px]">
              {line}
            </p>
          ))}
        </div>
        <p className="m-0 leading-[23px] max-w-[560px]">{paragraph}</p>
      </div>
    </section>
  );
}
