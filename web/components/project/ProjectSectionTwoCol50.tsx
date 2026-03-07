"use client";

import ProjectSectionMedia from "./ProjectSectionMedia";
import type { ProjectMediaResult } from "@/lib/projectMedia";

interface ProjectSectionTwoCol50Props {
  leftMedia: ProjectMediaResult;
  rightMedia: ProjectMediaResult;
}

/** 2 columns 50% each. Empty column still reserves 50% (gap). */
export default function ProjectSectionTwoCol50({ leftMedia, rightMedia }: ProjectSectionTwoCol50Props) {
  return (
    <div className="grid grid-cols-2 w-full gap-4 min-h-0">
      <div className="min-w-0 w-full">
        <ProjectSectionMedia media={leftMedia} />
      </div>
      <div className="min-w-0 w-full">
        <ProjectSectionMedia media={rightMedia} />
      </div>
    </div>
  );
}
