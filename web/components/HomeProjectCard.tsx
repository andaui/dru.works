"use client";

import Image from "next/image";
import NextLink from "next/link";

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
  /** When set, the card links to this href (e.g. project detail page) */
  href?: string | null;
  /** When true, show "Coming soon" on the right aligned with the project title */
  comingSoon?: boolean | null;
}

const captionBlock = (title?: string | null, creative?: string | null, comingSoon?: boolean | null) =>
  (title || creative || comingSoon) ? (
    <div className="mt-4 flex flex-col gap-1.5">
      {(title || comingSoon) && (
        <div className="flex justify-between items-baseline gap-2 w-full" style={{ fontSize: 16, lineHeight: "19px" }}>
          {title ? (
            <span className="text-foreground">{title}</span>
          ) : (
            <span />
          )}
          {comingSoon && (
            <span className="text-muted-foreground shrink-0 pr-3 opacity-80">Coming soon</span>
          )}
        </div>
      )}
      {creative && (
        <div className="text-muted" style={{ fontSize: 13, lineHeight: "19px" }}>
          {creative}
        </div>
      )}
    </div>
  ) : null;

function CardContent({
  cover,
  variant,
  title,
  creative,
  comingSoon,
}: {
  cover: CoverMedia;
  variant: HomeProjectCardProps["variant"];
  title?: string | null;
  creative?: string | null;
  comingSoon?: boolean | null;
}) {
  const isVideo = cover.type === "video";

  if (variant === "grid") {
    return (
      <>
        <div className="relative w-full aspect-[846/623] overflow-hidden">
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
        {(title || comingSoon) && (
          <div className="mt-3 flex justify-between items-baseline gap-2 w-full font-inter font-normal text-muted" style={{ fontSize: 13, lineHeight: "19px" }}>
            {title ? <span>{title}</span> : <span />}
            {comingSoon && <span className="text-muted-foreground shrink-0 pr-3 opacity-80">Coming soon</span>}
          </div>
        )}
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

export default function HomeProjectCard({ cover, variant, title, creative, href, comingSoon }: HomeProjectCardProps) {
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

  const content = (
    <CardContent cover={cover} variant={variant} title={title} creative={creative} comingSoon={comingSoon} />
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
