"use client";

interface ProjectSectionTextProps {
  text: string;
}

/** Text section: max-width 860px, 40px / 47px / -0.25px, center aligned. 216px margin top/bottom. */
export default function ProjectSectionText({ text }: ProjectSectionTextProps) {
  return (
    <div className="w-full flex justify-center my-[216px]">
      <div className="w-full max-w-[860px] text-center">
        <p
          className="font-medium text-foreground whitespace-pre-line m-0"
          style={{
            fontSize: "40px",
            lineHeight: "47px",
            letterSpacing: "-0.25px",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
