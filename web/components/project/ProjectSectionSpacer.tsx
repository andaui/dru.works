"use client";

type SpacerHeight = "24" | "40" | "60" | "80" | "100";

interface ProjectSectionSpacerProps {
  height?: SpacerHeight | null;
}

const heightMap: Record<SpacerHeight, string> = {
  "24": "h-6",
  "40": "h-[40px]",
  "60": "h-[60px]",
  "80": "h-[80px]",
  "100": "h-[100px]",
};

/** Renders vertical space: 24px, 40px, 60px, 80px, or 100px. */
export default function ProjectSectionSpacer({ height }: ProjectSectionSpacerProps) {
  const key = height && height in heightMap ? (height as SpacerHeight) : "24";
  return <div className={`w-full min-w-0 shrink-0 ${heightMap[key]}`} aria-hidden />;
}
