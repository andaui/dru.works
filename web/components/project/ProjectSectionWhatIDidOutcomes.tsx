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
  const titleStyle = { fontSize: 13, lineHeight: "19px", color: "#000000" };
  const bodyStyle = { fontSize: 13, lineHeight: "24px", color: "#5D5D5D" };

  return (
    <section className="w-full flex flex-col my-3">
      {/* Top line - full bleed */}
      <div className="w-screen ml-[calc(50%-50vw)]">
        <div className="h-px bg-border" />
      </div>
      {/* Content - 100px gap from lines */}
      <div className="flex flex-col gap-[34px] mt-[100px] mb-[100px]">
        <div className="flex flex-col gap-3">
          {whatIDidTitle != null && whatIDidTitle !== "" && (
            <p className="font-normal m-0" style={titleStyle}>
              {whatIDidTitle}
            </p>
          )}
          {whatIDidText != null && whatIDidText !== "" && (
            <p className="font-normal m-0 whitespace-pre-line" style={bodyStyle}>
              {whatIDidText}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {outcomesTitle != null && outcomesTitle !== "" && (
            <p className="font-normal m-0" style={titleStyle}>
              {outcomesTitle}
            </p>
          )}
          {outcomesText != null && outcomesText !== "" && (
            <p className="font-normal m-0 whitespace-pre-line" style={bodyStyle}>
              {outcomesText}
            </p>
          )}
        </div>
      </div>
      {/* Bottom line - full bleed */}
      <div className="w-screen ml-[calc(50%-50vw)]">
        <div className="h-px bg-border" />
      </div>
    </section>
  );
}
