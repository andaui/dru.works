"use client";

interface ProjectSectionWhatIDidOutcomesProps {
  whatIDidTitle?: string | null;
  whatIDidText?: string | null;
  outcomesTitle?: string | null;
  outcomesText?: string | null;
}

/** What I did & Outcomes: horizontal lines top/bottom (full bleed), 100px gap to content. */
export default function ProjectSectionWhatIDidOutcomes({
  whatIDidTitle,
  whatIDidText,
  outcomesTitle,
  outcomesText,
}: ProjectSectionWhatIDidOutcomesProps) {
  return (
    <section className="w-full flex flex-col my-3">
      {/* Top line - edge to edge, ignores max-width */}
      <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />
      {/* Content - 100px gap from lines, 24px side padding (lines stay edge-to-edge) */}
      <div className="flex flex-col gap-[34px] mt-[100px] mb-[100px] px-6">
        <div className="flex flex-col gap-3">
          {whatIDidTitle != null && whatIDidTitle !== "" && (
            <p className="font-normal m-0 text-[13px] leading-[19px] text-foreground">
              {whatIDidTitle}
            </p>
          )}
          {whatIDidText != null && whatIDidText !== "" && (
            <p className="font-normal m-0 whitespace-pre-line text-[13px] leading-[24px] text-[#5d5d5d] dark:text-[#a3a3a3]">
              {whatIDidText}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {outcomesTitle != null && outcomesTitle !== "" && (
            <p className="font-normal m-0 text-[13px] leading-[19px] text-foreground">
              {outcomesTitle}
            </p>
          )}
          {outcomesText != null && outcomesText !== "" && (
            <p className="font-normal m-0 whitespace-pre-line text-[13px] leading-[24px] text-[#5d5d5d] dark:text-[#a3a3a3]">
              {outcomesText}
            </p>
          )}
        </div>
      </div>
      {/* Bottom line - edge to edge, ignores max-width */}
      <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />
    </section>
  );
}
