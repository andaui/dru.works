import type { HomeTestimonialItem } from "@/components/HomeTestimonialsGrid";

/** Figma 2190:6 — company · name · role header, then the quote in IBM Plex. No avatar. */
export default function TestimonialCard({ t }: { t: HomeTestimonialItem }) {
  const metaClass = "font-inter font-normal text-[13px] leading-[19px] text-[#757575] dark:text-muted m-0";

  return (
    <article className="flex flex-col gap-[21px] items-start p-6 sm:p-[28px]">
      <div className="flex flex-col gap-[7px] items-start w-full">
        {t.company ? <p className={`${metaClass} whitespace-nowrap`}>{t.company}</p> : null}
        <div className="flex flex-col gap-px items-start w-full">
          {t.person ? (
            <p className="font-plex font-semibold text-[14px] leading-[23px] text-foreground m-0">
              {t.person}
            </p>
          ) : null}
          {t.role ? <p className={metaClass}>{t.role}</p> : null}
        </div>
      </div>
      <p className="font-plex text-[14px] leading-[21px] text-foreground w-full whitespace-pre-wrap m-0">
        {t.body}
      </p>
    </article>
  );
}
