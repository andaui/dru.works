"use client";

import ProjectSectionMedia from "./ProjectSectionMedia";
import type { ProjectMediaResult } from "@/lib/projectMedia";

type Ratio = "30-70" | "35-65" | "40-60";

interface ProjectSectionTwoCol30Props {
  ratio?: Ratio | null;
  narrowSide: "left" | "right";
  leftMedia: ProjectMediaResult;
  rightMedia: ProjectMediaResult;
}

/** 2 columns: 30/70, 35/65, or 40/60. Uses grid + fr so gap is inside 100%, respecting padding. */
export default function ProjectSectionTwoCol30({
  ratio = "30-70",
  narrowSide,
  leftMedia,
  rightMedia,
}: ProjectSectionTwoCol30Props) {
  const gridCols =
    narrowSide === "left"
      ? ratio === "40-60"
        ? "grid-cols-[0.4fr_0.6fr]"
        : ratio === "35-65"
          ? "grid-cols-[0.35fr_0.65fr]"
          : "grid-cols-[0.3fr_0.7fr]"
      : ratio === "40-60"
        ? "grid-cols-[0.6fr_0.4fr]"
        : ratio === "35-65"
          ? "grid-cols-[0.65fr_0.35fr]"
          : "grid-cols-[0.7fr_0.3fr]";

  return (
    <div className={`grid w-full gap-4 min-w-0 ${gridCols}`}>
      <div className="min-w-0 w-full">
        <ProjectSectionMedia media={leftMedia} />
      </div>
      <div className="min-w-0 w-full">
        <ProjectSectionMedia media={rightMedia} />
      </div>
    </div>
  );
}
