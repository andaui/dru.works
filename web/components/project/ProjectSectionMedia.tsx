"use client";

import Image from "next/image";
import type { ProjectMediaResult } from "@/lib/projectMedia";

interface ProjectSectionMediaProps {
  media: ProjectMediaResult;
  className?: string;
}

/** Renders a single image or video slot with auto height. Empty slot is not rendered (caller handles gap). */
export default function ProjectSectionMedia({ media, className = "" }: ProjectSectionMediaProps) {
  if (!media) return null;

  if (media.type === "video") {
    return (
      <div className={`w-full overflow-hidden rounded-[24px] bg-transparent ${className}`}>
        <video
          src={media.url}
          className="w-full h-auto block object-cover object-center origin-center scale-[1.01]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={media.alt}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-[24px] bg-transparent ${className}`}>
      <Image
        src={media.url}
        alt={media.alt}
        width={2800}
        height={1867}
        className="w-full h-auto object-cover object-center"
        sizes="100vw"
        quality={95}
        placeholder="empty"
      />
    </div>
  );
}
