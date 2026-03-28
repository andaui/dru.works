"use client";

import { useState } from "react";
import type { HomeTestimonialItem } from "@/components/HomeTestimonialsGrid";
import TestimonialPixelAvatar from "@/components/TestimonialPixelAvatar";

export default function TestimonialCard({ t }: { t: HomeTestimonialItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="flex flex-col gap-[21px] items-start p-5 sm:p-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex gap-[15px] items-start w-full">
        {t.photoUrl ? (
          <TestimonialPixelAvatar
            src={t.photoUrl}
            alt={t.photoAlt}
            hovered={hovered}
          />
        ) : (
          <div
            className="relative shrink-0 size-[57px] rounded-sm bg-border dark:bg-white/10"
            aria-hidden
          />
        )}
        <div className="flex flex-col gap-px font-inter font-normal text-[13px] leading-[19px] min-w-0 flex-1">
          <p className="text-[#111011] dark:text-foreground m-0">{t.person}</p>
          <p className="text-[#757575] dark:text-muted m-0">{t.role}</p>
          <p className="text-[#757575] dark:text-muted m-0">{t.company}</p>
        </div>
      </div>
      <div className="font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[27px] tracking-[-0.25px] text-foreground w-full whitespace-pre-wrap">
        {t.body}
      </div>
    </article>
  );
}
