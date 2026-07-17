"use client";

import Image from "next/image";
import { sanityImageLoader } from "@/lib/sanity";
import HomeBadgePill from "@/components/HomeBadgePill";

interface CoverMedia {
  url: string;
  alt: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

interface ApproachNote {
  title: string;
  body: string;
}

/** Figma 2190:97 — the four "On the…" notes. Overridable via props once moved into Sanity. */
const DEFAULT_NOTES: ApproachNote[] = [
  {
    title: "On the work",
    body:
      "I work best with product teams and founders who value clear communication, trust, and focus. I don’t take full-time roles or sit in daily standups. Instead, I run a structured async process that delivers fast, high-quality design work without the drag of unnecessary meetings.",
  },
  {
    title: "On new ideas",
    body:
      "I’m curious by default. Every project is a chance to try something I haven’t tried before. I don’t recycle solutions.",
  },
  {
    title: "On delivery",
    body: "I am rigid about time and promises. Work lands when we agreed it would.",
  },
];

type HomeApproachBlockProps = {
  cover?: CoverMedia | null;
  /** Badge shown on the cover (e.g. "Latest" / "Coming soon"). */
  tag?: string | null;
  notes?: ApproachNote[];
};

export default function HomeApproachBlock({
  cover,
  tag,
  notes = DEFAULT_NOTES,
}: HomeApproachBlockProps) {
  return (
    <section className="w-full px-[2.5%] sm:px-6 pt-[64px] lg:pt-[120px]" aria-label="Approach">
      {/* 80% media block, left aligned */}
      <div className="w-full lg:w-[80%]">
        <div className="relative w-full overflow-hidden rounded-none bg-zinc-100 dark:bg-white/[0.06]">
          {tag ? <HomeBadgePill label={tag} /> : null}
          {cover ? (
            cover.type === "video" ? (
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
                loader={sanityImageLoader}
                src={cover.url}
                alt={cover.alt}
                width={cover.width || 1600}
                height={cover.height || 1067}
                quality={90}
                className="w-full h-auto object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
            )
          ) : (
            <div className="w-full aspect-[1332/892]" aria-hidden />
          )}
        </div>
      </div>

      {/* 4-column notes */}
      <div className="w-full lg:w-[80%] mt-8 lg:mt-[32px] flex flex-col sm:flex-row sm:flex-wrap gap-[48px]">
        {notes.map((note) => (
          <div key={note.title} className="flex flex-col gap-[9px] w-full sm:w-[294px]">
            <p className="m-0 font-plex font-semibold text-[14px] leading-[23px] text-foreground">
              {note.title}
            </p>
            <p className="m-0 font-plex text-[14px] leading-[21px] text-foreground">
              {note.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
