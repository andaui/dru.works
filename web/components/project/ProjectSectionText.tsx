"use client";

interface ProjectSectionTextProps {
  text: string;
}

/** Text section: full width on mobile; max-width 860px from md, center aligned. Vertical spacing: 100px on mobile (from page wrapper), 216px from md. */
export default function ProjectSectionText({ text }: ProjectSectionTextProps) {
  return (
    <div className="w-full flex justify-center py-0 md:py-[216px]">
      <div className="w-full max-w-full md:max-w-[860px] text-left md:text-center">
        <p className="font-plex text-foreground whitespace-pre-line m-0 text-[14px] leading-[23px]">
          {text}
        </p>
      </div>
    </div>
  );
}
