"use client";

interface ProjectSectionWhatIDidOutcomesProps {
  whatIDidTitle?: string | null;
  whatIDidText?: string | null;
  outcomesTitle?: string | null;
  outcomesText?: string | null;
}

/** What I did & Outcomes: title 13px/19px black, body 13px/19px #5D5D5D. 34px between blocks. Section: 116px margin top/bottom. */
export default function ProjectSectionWhatIDidOutcomes({
  whatIDidTitle,
  whatIDidText,
  outcomesTitle,
  outcomesText,
}: ProjectSectionWhatIDidOutcomesProps) {
  const titleStyle = { fontSize: 13, lineHeight: "19px", color: "#000000" };
  const bodyStyle = { fontSize: 13, lineHeight: "24px", color: "#5D5D5D" };

  return (
    <section className="w-full my-[116px]">
      <div className="flex flex-col gap-[34px]">
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
    </section>
  );
}
