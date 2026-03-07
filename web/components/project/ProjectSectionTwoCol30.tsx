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

/** 2 columns: 30/70 or 40/60. narrowSide = which column is narrow; the other fills. */
export default function ProjectSectionTwoCol30({
  ratio = "30-70",
  narrowSide,
  leftMedia,
  rightMedia,
}: ProjectSectionTwoCol30Props) {
  const narrow =
    ratio === "40-60" ? "w-[40%]" : ratio === "35-65" ? "w-[35%]" : "w-[30%]";
  const wide =
    ratio === "40-60" ? "w-[60%]" : ratio === "35-65" ? "w-[65%]" : "w-[70%]";
  const leftWidth = narrowSide === "left" ? narrow : wide;
  const rightWidth = narrowSide === "left" ? wide : narrow;

  return (
    <div className="flex w-full gap-4 min-h-0">
      <div className={`min-w-0 shrink-0 ${leftWidth}`}>
        <ProjectSectionMedia media={leftMedia} />
      </div>
      <div className={`min-w-0 shrink-0 ${rightWidth}`}>
        <ProjectSectionMedia media={rightMedia} />
      </div>
    </div>
  );
}
