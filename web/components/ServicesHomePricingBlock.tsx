import Image from "next/image";
import type { ServicesHomeSectionParsed } from "@/lib/servicesHomeSections";

/** Matches HomePricingCalculator row spacing */
const pricingRowTextPb = "pb-[calc(var(--spacing)*1)]";

function Rule() {
  return <div className="h-px w-full bg-border shrink-0" aria-hidden />;
}

/** “How I work” body copy in HomePricingCalculator */
const descriptionStyle =
  "font-soehne font-normal text-foreground/50 m-0 whitespace-pre-line text-[20px] leading-[29px]";

const sectionHeadingStyle =
  `font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0 ${pricingRowTextPb}`;

type ServicesHomePricingBlockProps = {
  data: ServicesHomeSectionParsed;
  /** First section beside hero left column — no top rule. */
  variant: "heroRight" | "fullWidth";
};

export default function ServicesHomePricingBlock({
  data,
  variant,
}: ServicesHomePricingBlockProps) {
  const { sectionTitle, descriptionTexts, listItemGroups, featuredImage } = data;
  const hasDesc = descriptionTexts.length > 0;
  const hasList = listItemGroups.some((g) => g.length > 0);

  const body = (
    <div className="min-w-0 flex flex-col w-full gap-0">
      <div className="pt-1 pb-0">
        <h2 className={sectionHeadingStyle}>{sectionTitle}</h2>
        {/* No rule between title and list when there is no description */}
        {!(hasList && !hasDesc) ? <Rule /> : null}
      </div>

      {hasDesc ? (
        <div className="pt-1">
          <div className="w-full pt-[42px] pb-[42px]">
            {descriptionTexts.map((t, i) => (
              <p key={i} className={`${descriptionStyle} ${pricingRowTextPb}`}>
                {t}
              </p>
            ))}
          </div>
          {/* No rule above list when list follows description */}
          {!hasList ? <Rule /> : null}
        </div>
      ) : null}

      {hasList ? (
        <div className="pt-1">
          <div className="flex flex-col gap-3 w-full">
            {listItemGroups.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-1 w-full">
                {group.map((line, li) => (
                  <p key={`${gi}-${li}`} className={descriptionStyle}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {featuredImage ? (
        <div className="mt-[52px] w-full overflow-hidden rounded-[24px]">
          {featuredImage.kind === "video" ? (
            <video
              src={featuredImage.url}
              className="block w-full max-w-full h-auto rounded-[24px]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={sectionTitle ? `Video: ${sectionTitle}` : "Video"}
            />
          ) : featuredImage.width && featuredImage.height ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt || sectionTitle}
              width={featuredImage.width}
              height={featuredImage.height}
              className="h-auto w-full max-w-full rounded-[24px]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- intrinsic dimensions from file when Sanity omits metadata
            <img
              src={featuredImage.url}
              alt={featuredImage.alt || sectionTitle}
              className="h-auto w-full max-w-full rounded-[24px]"
            />
          )}
        </div>
      ) : null}
    </div>
  );

  if (variant === "heroRight") {
    return <div className="w-full">{body}</div>;
  }

  /** Same 12-col layout as HomePricingCalculator: content in the right half (cols 7–12). */
  return (
    <div className="flex flex-col gap-1 w-full">
      <Rule />
      <div className="grid grid-cols-12 gap-x-1 gap-y-6 lg:gap-y-4 w-full items-start px-0 sm:px-0">
        <div className="hidden lg:block lg:col-span-6 shrink-0" aria-hidden />
        <div className="col-span-12 lg:col-span-6 min-w-0 flex flex-col w-full gap-0">
          {body}
        </div>
      </div>
    </div>
  );
}
