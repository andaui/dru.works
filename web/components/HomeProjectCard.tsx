"use client";

import Image from "next/image";

interface CoverMedia {
  url: string;
  alt: string;
  type: "image" | "video";
}

interface HomeProjectCardProps {
  cover: CoverMedia | null;
  /** 'hero-half' | 'hero-center' | 'hero-main' (70% width, height auto) | 'grid' */
  variant: "hero-half" | "hero-center" | "hero-main" | "grid";
  /** Shown below image for hero variants (project title) */
  title?: string | null;
  /** Shown below title for hero variants (creative credit) */
  creative?: string | null;
}

const captionBlock = (title?: string | null, creative?: string | null) =>
  (title || creative) ? (
    <div className="mt-4 flex flex-col gap-1.5">
      {title && (
        <div className="text-foreground" style={{ fontSize: 16, lineHeight: "19px" }}>
          {title}
        </div>
      )}
      {creative && (
        <div className="text-muted" style={{ fontSize: 13, lineHeight: "19px" }}>
          {creative}
        </div>
      )}
    </div>
  ) : null;

export default function HomeProjectCard({ cover, variant, title, creative }: HomeProjectCardProps) {
  if (!cover) {
    return (
      <div
        className="bg-border flex items-center justify-center text-muted text-sm"
        style={
          variant === "grid"
            ? { aspectRatio: "846/623" }
            : undefined
        }
      >
        No image
      </div>
    );
  }

  const isVideo = cover.type === "video";

  if (variant === "grid") {
    return (
      <div className="w-full">
        <div className="relative w-full aspect-[846/623] overflow-hidden bg-border">
          {isVideo ? (
            <video
              src={cover.url}
              className="object-cover object-center w-full h-full"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
        </div>
        {title && (
          <div className="mt-3 font-inter font-normal text-muted" style={{ fontSize: 13, lineHeight: "19px" }}>
            {title}
          </div>
        )}
      </div>
    );
  }

  // hero-main: 70% width (parent), height auto from image
  if (variant === "hero-main") {
    return (
      <div className="w-full">
        <div className="w-full overflow-hidden bg-border">
          {isVideo ? (
            <video
              src={cover.url}
              className="w-full h-auto block object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={cover.url}
              alt={cover.alt}
              width={1200}
              height={800}
              className="w-full h-auto object-cover object-center"
              sizes="70vw"
            />
          )}
        </div>
        {captionBlock(title, creative)}
      </div>
    );
  }

  // Hero half/center: auto height from image/video
  return (
    <div className="w-full">
      <div className="w-full overflow-hidden bg-border">
        {isVideo ? (
          <video
            src={cover.url}
            className="w-full h-auto block object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={cover.url}
            alt={cover.alt}
            width={846}
            height={623}
            className="w-full h-auto object-cover object-center"
            sizes={variant === "hero-half" ? "50vw" : "70vw"}
          />
        )}
      </div>
      {captionBlock(title, creative)}
    </div>
  );
}
