"use client";

import ProjectSectionMedia from "./ProjectSectionMedia";
import type { ProjectMediaResult } from "@/lib/projectMedia";

interface ProjectSectionOneColProps {
  width: "100" | "70" | "40";
  media: ProjectMediaResult;
}

/** 1 column: 100%, 70%, or 40% width (70/40 only from md up). On mobile always full width. */
export default function ProjectSectionOneCol({ width, media }: ProjectSectionOneColProps) {
  const widthClass =
    width === "100"
      ? "w-full"
      : width === "70"
        ? "w-full md:max-w-[70%] md:mx-auto"
        : "w-full md:max-w-[40%] md:mx-auto";

  return (
    <div className={widthClass}>
      <div className="w-full min-w-0">
        <ProjectSectionMedia media={media} />
      </div>
    </div>
  );
}
