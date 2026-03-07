"use client";

import ProjectSectionMedia from "./ProjectSectionMedia";
import type { ProjectMediaResult } from "@/lib/projectMedia";

interface ProjectSectionOneColProps {
  width: "100" | "70" | "40";
  media: ProjectMediaResult;
}

/** 1 column: 100%, 70%, or 40% width. Center aligned. Empty still reserves width. */
export default function ProjectSectionOneCol({ width, media }: ProjectSectionOneColProps) {
  const widthClass =
    width === "100" ? "w-full" : width === "70" ? "w-full max-w-[70%] mx-auto" : "w-full max-w-[40%] mx-auto";

  return (
    <div className={widthClass}>
      <div className="w-full min-w-0">
        <ProjectSectionMedia media={media} />
      </div>
    </div>
  );
}
