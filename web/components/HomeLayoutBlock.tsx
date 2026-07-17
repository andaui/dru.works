"use client";

import Image from "next/image";
import NextLink from "next/link";
import { sanityImageLoader } from "@/lib/sanity";
import HomeBadgePill from "@/components/HomeBadgePill";
import AutoVideo from "@/components/AutoVideo";

export type HomepageLayout =
  | "full-80"
  | "two-up-65-35"
  | "left-42"
  | "center-70"
  | "two-up-20-30"
  | "right-70"
  | "left-60"
  | "grid-3";

export interface LayoutMedia {
  url: string;
  alt: string;
  type: "image" | "video";
  /** True pixel dimensions (from Sanity metadata) — keeps aspect correct + resolution sharp. */
  width?: number;
  height?: number;
}

export interface HomeLayoutProject {
  id: string;
  layout: HomepageLayout;
  cover: LayoutMedia | null;
  /** First gallery image — used as the second frame in two-up layouts. */
  secondary?: LayoutMedia | null;
  title?: string | null;
  caption?: string | null;
  href?: string | null;
  /** Link for the second frame in two-up layouts (defaults to `href`). */
  secondaryHref?: string | null;
  /** Badge label shown on the cover (e.g. "Coming soon" or custom). */
  tag?: string | null;
}

function Media({
  media,
  sizes,
  frame,
  priority,
}: {
  media: LayoutMedia | null;
  sizes: string;
  /** "square" = 1:1 at every breakpoint. "wide" = 1:1 on mobile, natural height from `sm` up. */
  frame: "square" | "wide";
  priority?: boolean;
}) {
  const box = "relative w-full overflow-hidden rounded-none bg-zinc-100 dark:bg-white/[0.06]";
  // Mobile is always a square tile (matches the 3-col grid); wide layouts relax to natural from sm.
  const shape =
    frame === "wide"
      ? "w-full aspect-square object-cover object-center sm:aspect-auto sm:h-auto"
      : "w-full aspect-square object-cover object-center";

  if (!media) {
    return <div className={`${box} ${frame === "wide" ? "aspect-square sm:aspect-[3/2]" : "aspect-square"}`} aria-hidden />;
  }
  if (media.type === "video") {
    return (
      <div className={box}>
        <AutoVideo src={media.url} alt={media.alt} className={`block ${shape}`} />
      </div>
    );
  }
  return (
    <div className={box}>
      <Image
        loader={sanityImageLoader}
        src={media.url}
        alt={media.alt}
        width={media.width || 1600}
        height={media.height || 1067}
        quality={90}
        className={shape}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <p className="hidden sm:block mt-4 font-plex text-[14px] leading-[21px] text-foreground max-w-[720px]">
      {text}
    </p>
  );
}

/** Wrap media in a project link when a slug is available. */
function Linked({ href, children }: { href?: string | null; children: React.ReactNode }) {
  if (href) {
    return (
      <NextLink href={href} className="block w-full">
        {children}
      </NextLink>
    );
  }
  return <>{children}</>;
}

/**
 * Renders one homepage project at its chosen layout width/alignment.
 * `grid-3` renders a single square tile; the parent groups three per row.
 */
export default function HomeLayoutBlock({ project }: { project: HomeLayoutProject }) {
  const { layout, cover, secondary, caption, href, secondaryHref, tag } = project;
  const pill = tag ? <HomeBadgePill label={tag} /> : null;

  switch (layout) {
    case "full-80":
      return (
        <div className="w-full lg:w-[80%]">
          <Linked href={href}>
            <div className="relative">
              {pill}
              <Media media={cover} sizes="(max-width:1024px) 100vw, 80vw" frame="wide" />
            </div>
          </Linked>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "center-70":
      return (
        <div className="w-full lg:w-[70%] lg:mx-auto">
          <Linked href={href}>
            <div className="relative">
              {pill}
              <Media media={cover} sizes="(max-width:1024px) 100vw, 70vw" frame="wide" />
            </div>
          </Linked>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "right-70":
      return (
        <div className="w-full lg:w-[70%] lg:ml-auto">
          <Linked href={href}>
            <div className="relative">
              {pill}
              <Media media={cover} sizes="(max-width:1024px) 100vw, 70vw" frame="wide" />
            </div>
          </Linked>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "left-42":
      return (
        <div className="w-full sm:w-[60%] lg:w-[43%]">
          <Linked href={href}>
            <div className="relative">
              {pill}
              <Media media={cover} sizes="(max-width:1024px) 60vw, 43vw" frame="square" />
            </div>
          </Linked>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "left-60":
      return (
        <div className="w-full lg:w-[66%]">
          <Linked href={href}>
            <div className="relative">
              {pill}
              <Media media={cover} sizes="(max-width:1024px) 100vw, 66vw" frame="square" />
            </div>
          </Linked>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "two-up-65-35":
      return (
        <div className="w-full flex flex-col sm:flex-row items-start justify-between gap-[28px]">
          <div className="w-full sm:w-[65%]">
            <Linked href={href}>
              <div className="relative">
                {pill}
                <Media media={cover} sizes="(max-width:640px) 100vw, 65vw" frame="square" />
              </div>
            </Linked>
          </div>
          <div className="w-full sm:w-[33%]">
            <Linked href={secondaryHref ?? href}>
              <Media media={secondary ?? cover} sizes="(max-width:640px) 100vw, 33vw" frame="square" />
            </Linked>
          </div>
          {caption ? <Caption text={caption} /> : null}
        </div>
      );

    case "two-up-20-30":
      return (
        <div className="w-full flex flex-col sm:flex-row items-end justify-between gap-[28px]">
          <div className="w-full sm:w-[21%]">
            <Linked href={secondaryHref ?? href}>
              <Media media={secondary ?? cover} sizes="(max-width:640px) 100vw, 21vw" frame="square" />
            </Linked>
          </div>
          <div className="w-full sm:w-[33%]">
            <Linked href={href}>
              <div className="relative">
                {pill}
                <Media media={cover} sizes="(max-width:640px) 100vw, 33vw" frame="square" />
              </div>
            </Linked>
          </div>
        </div>
      );

    case "grid-3":
    default:
      return (
        <Linked href={href}>
          <div className="relative">
            {pill}
            <Media media={cover} sizes="(max-width:768px) 100vw, 33vw" frame="square" />
          </div>
        </Linked>
      );
  }
}
