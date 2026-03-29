"use client";

import Image from "next/image";
import NextLink from "next/link";

interface CoverMedia {
  url: string;
  alt: string;
  type: "image" | "video";
}

/** Comma-separated string from CMS, or separate entries if the schema uses an array. */
type CreativeInput = string | string[] | null | undefined;

function parseCreativeParts(creative: CreativeInput): string[] {
  if (creative == null) return [];
  if (Array.isArray(creative)) {
    return creative.map((s) => String(s).trim()).filter(Boolean);
  }
  const t = creative.trim();
  if (!t) return [];
  return t
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface HomeProjectCardProps {
  cover: CoverMedia | null;
  /** 'hero-half' | 'hero-center' | 'hero-main' (70% width, height auto) | 'grid' */
  variant: "hero-half" | "hero-center" | "hero-main" | "grid";
  /** Shown below image for hero variants (project title) */
  title?: string | null;
  /** Shown below title for hero variants (creative credit) */
  creative?: CreativeInput;
  /** When set, the card links to this href (e.g. project detail page) */
  href?: string | null;
  /** When true, show "soon" in a second column (intrinsic width), 24px from title/creative */
  comingSoon?: boolean | null;
  /** When variant is `grid`, use 7:8 aspect and 20px rounded media (homepage); default keeps legacy tile proportions. */
  gridPortrait?: boolean;
}

const titleRowClass =
  "font-soehne font-normal text-[17px] leading-[37px] tracking-[-0.25px]";

const creativeTypeClass =
  "font-soehne font-normal text-[13px] leading-[19px] text-black/40 dark:text-white/50";

const creativeTagsClass = `flex flex-wrap items-baseline gap-x-3 gap-y-1 w-full ${creativeTypeClass}`;

const captionBlock = (title?: string | null, creative?: CreativeInput, comingSoon?: boolean | null) => {
  const creativeParts = parseCreativeParts(creative);
  const hasCreative = creativeParts.length > 0;
  if (!title && !comingSoon && !hasCreative) return null;
  return (
    <div className="mt-3 w-full pl-1 pr-4">
      <div className="flex items-start gap-6 w-full">
        <div className="min-w-0 flex-1 flex flex-col gap-0">
          {title ? (
            <div className={`text-black dark:text-white ${titleRowClass}`}>{title}</div>
          ) : null}
          {hasCreative ? (
            <div className={creativeTagsClass}>
              {creativeParts.map((part, i) => (
                <span key={`${part}-${i}`}>{part}</span>
              ))}
            </div>
          ) : null}
        </div>
        {comingSoon ? (
          <span className={`shrink-0 w-fit whitespace-nowrap pt-1 ${creativeTypeClass}`}>soon</span>
        ) : null}
      </div>
    </div>
  );
};

function CardContent({
  cover,
  variant,
  title,
  creative,
  comingSoon,
  gridPortrait,
}: {
  cover: CoverMedia;
  variant: HomeProjectCardProps["variant"];
  title?: string | null;
  creative?: CreativeInput;
  comingSoon?: boolean | null;
  gridPortrait?: boolean;
}) {
  const isVideo = cover.type === "video";

  if (variant === "grid") {
    const gridMediaClass = gridPortrait
      ? "relative w-full aspect-[7/8] overflow-hidden rounded-[20px] bg-zinc-100 dark:bg-white/[0.06]"
      : "relative w-full aspect-[846/623] overflow-hidden";
    const gridImgObject = gridPortrait ? "object-contain object-center" : "object-cover object-center";
    return (
      <>
        <div className={gridMediaClass}>
          {isVideo ? (
            <video
              src={cover.url}
              className={`${gridPortrait ? "object-contain object-center" : "object-cover object-center"} w-full h-full`}
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
              className={gridImgObject}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
        </div>
        {captionBlock(title, creative, comingSoon)}
      </>
    );
  }

  if (variant === "hero-main") {
    return (
      <>
        <div className="w-full overflow-hidden rounded-[20px]">
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
        {captionBlock(title, creative, comingSoon)}
      </>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-[20px]">
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
      {captionBlock(title, creative, comingSoon)}
    </>
  );
}

export default function HomeProjectCard({
  cover,
  variant,
  title,
  creative,
  href,
  comingSoon,
  gridPortrait,
}: HomeProjectCardProps) {
  if (!cover) {
    return (
      <div
        className={`bg-border flex items-center justify-center text-muted text-sm${variant === "grid" && gridPortrait ? " rounded-[20px]" : ""}`}
        style={
          variant === "grid"
            ? { aspectRatio: gridPortrait ? "7/8" : "846/623" }
            : undefined
        }
      >
        No image
      </div>
    );
  }

  const content = (
    <CardContent
      cover={cover}
      variant={variant}
      title={title}
      creative={creative}
      comingSoon={comingSoon}
      gridPortrait={gridPortrait}
    />
  );

  const wrapperClass = "w-full block";

  if (href) {
    return (
      <NextLink href={href} className={wrapperClass}>
        {content}
      </NextLink>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
