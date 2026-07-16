import HomeProjectCard from "@/components/HomeProjectCard";
import HomeLandingHero from "@/components/HomeLandingHero";
import HomeHeroIntro from "@/components/HomeHeroIntro";
import HomeApproachBlock from "@/components/HomeApproachBlock";
import HomeClientsPricing from "@/components/HomeClientsPricing";
import HomeLayoutBlock, {
  type HomeLayoutProject,
  type HomepageLayout,
  type LayoutMedia,
} from "@/components/HomeLayoutBlock";
import HomePricingCalculator, {
  type HomePricingSideImage,
  type HomePricingTierRates,
} from "@/components/HomePricingCalculator";
import HomeTestimonialsGrid, {
  type HomeTestimonialItem,
} from "@/components/HomeTestimonialsGrid";
import HomeFooterClock from "@/components/HomeFooterClock";
import SpotlightCarouselWrapper from "@/components/SpotlightCarouselWrapper";
import {
  client,
  featuredWorkQuery,
  homepageWorkQuery,
  homeIndexQuery,
  heroTestimonialsQuery,
  spotlightQuery,
  pageDataQuery,
  navigationPagesQuery,
  pricingAndDesignersQuery,
  urlFor,
} from "@/lib/sanity";
import { parseServicesPageSectionsForHome } from "@/lib/servicesHomeSections";

async function getHomeTestimonials() {
  try {
    return (await client.fetch(heroTestimonialsQuery)) || [];
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

function processOneMedia(media: any, fallbackTitle: string): { url: string; alt: string; type: "image" | "video" } | null {
  if (!media) return null;
  if (media._type === "image" && media.asset) {
    try {
      const imageUrl = urlFor(media)
        .width(1692)
        .height(1246)
        .fit("crop")
        .quality(90)
        .format("jpg")
        .url();
      return { url: imageUrl, alt: media.alt || fallbackTitle || "Project image", type: "image" };
    } catch {
      if (media.asset?.url) {
        return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project image", type: "image" };
      }
    }
  }
  if (media._type === "file" && media.asset?.mimeType?.startsWith?.("video/") && media.asset?.url) {
    return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project video", type: "video" };
  }
  return null;
}

/** Homepage 7:8 grid — no Sanity crop; scale down only so the full frame is visible. */
function processGridCoverImage(media: any, fallbackTitle: string): { url: string; alt: string; type: "image" } | null {
  if (!media || media._type !== "image" || !media.asset) return null;
  try {
    const imageUrl = urlFor(media).width(1600).fit("max").quality(90).format("jpg").url();
    return { url: imageUrl, alt: media.alt || fallbackTitle || "Project image", type: "image" };
  } catch {
    if (media.asset?.url) {
      return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project image", type: "image" };
    }
  }
  return null;
}

/** Homepage layout blocks. Returns the raw Sanity asset URL + real dimensions so the
 *  next/image Sanity loader can request correctly-sized variants straight from the CDN. */
function processLayoutMedia(media: any, fallbackTitle: string): LayoutMedia | null {
  if (!media) return null;
  if (media._type === "image" && media.asset?.url) {
    const dims = media.asset?.metadata?.dimensions;
    return {
      url: media.asset.url,
      alt: media.alt || fallbackTitle || "Project image",
      type: "image",
      width: dims?.width,
      height: dims?.height,
    };
  }
  if (media._type === "file" && media.asset?.mimeType?.startsWith?.("video/") && media.asset?.url) {
    return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project video", type: "video" };
  }
  return null;
}

/** Default editorial layout order (Figma sequence) used by the fallback when no sections are configured. */
const POSITIONAL_LAYOUTS: HomepageLayout[] = [
  "two-up-65-35",
  "left-42",
  "center-70",
  "two-up-20-30",
  "right-70",
  "left-60",
  "grid-3",
  "grid-3",
  "grid-3",
];

/** Resolve a project reference into its cover + second image + link. */
function resolveProjectRef(item: any) {
  const title = item.projectTitle || "Project";
  const coverMedia = item.cover?.[0] ?? (Array.isArray(item.images) ? item.images[0] : null);
  const cover = processLayoutMedia(coverMedia, title);
  const galleryImages = Array.isArray(item.images) ? item.images : [];
  const secondaryMedia = galleryImages.find((m: any) => m && m !== coverMedia) ?? galleryImages[0] ?? null;
  const secondary = processLayoutMedia(secondaryMedia, title);
  // Badge label: custom tag wins, else "Coming soon" when enabled, else none.
  const tag =
    (item.homepageTag && String(item.homepageTag).trim()) ||
    (item.comingSoon ? "Coming soon" : null);
  return {
    id: item._id || "project",
    title,
    cover,
    secondary,
    href: item.slug ? `/work/${item.slug}` : null,
    tag,
  };
}

/** Fallback path: assign the positional Figma layout to each legacy project by order. */
function toLayoutProject(item: any, index: number): HomeLayoutProject {
  const p = resolveProjectRef(item);
  return {
    id: `${p.id}-${index}`,
    layout: POSITIONAL_LAYOUTS[index % POSITIONAL_LAYOUTS.length],
    cover: p.cover,
    secondary: p.secondary,
    title: p.title,
    caption: null,
    href: p.href,
    tag: p.tag,
  };
}

/** Group consecutive grid-3 projects into rows of three; everything else stands alone. */
type SequenceUnit =
  | { type: "grid"; items: HomeLayoutProject[] }
  | { type: "single"; item: HomeLayoutProject };

/** Turn Sanity Homepage sections into render units (the primary path). */
function sectionsToUnits(sections: any[]): SequenceUnit[] {
  const units: SequenceUnit[] = [];
  sections.forEach((section: any, si: number) => {
    const layout = (section?.layout as HomepageLayout) || "center-70";
    const caption = section?.caption ?? null;
    const projs = (section?.projects || [])
      .filter(Boolean)
      .filter(isNotMotionStudies)
      .map(resolveProjectRef);
    if (!projs.length) return;

    if (layout === "grid-3") {
      units.push({
        type: "grid",
        items: projs.map((p: ReturnType<typeof resolveProjectRef>, i: number) => ({
          id: `${p.id}-s${si}-${i}`,
          layout: "grid-3" as HomepageLayout,
          cover: p.cover,
          secondary: null,
          title: p.title,
          caption: null,
          href: p.href,
          tag: p.tag,
        })),
      });
      return;
    }

    if (layout === "two-up-65-35" || layout === "two-up-20-30") {
      const big = projs[0];
      const small = projs[1];
      units.push({
        type: "single",
        item: {
          id: `${big.id}-s${si}`,
          layout,
          cover: big.cover,
          secondary: small ? small.cover : big.secondary,
          title: big.title,
          caption,
          href: big.href,
          secondaryHref: small?.href ?? big.href,
          tag: big.tag,
        },
      });
      return;
    }

    const p = projs[0];
    units.push({
      type: "single",
      item: {
        id: `${p.id}-s${si}`,
        layout,
        cover: p.cover,
        secondary: p.secondary,
        title: p.title,
        caption,
        href: p.href,
        tag: p.tag,
      },
    });
  });
  return units;
}

function groupSequence(projects: HomeLayoutProject[]): SequenceUnit[] {
  const units: SequenceUnit[] = [];
  for (const p of projects) {
    if (p.layout === "grid-3") {
      const last = units[units.length - 1];
      if (last && last.type === "grid" && last.items.length < 3) {
        last.items.push(p);
      } else {
        units.push({ type: "grid", items: [p] });
      }
    } else {
      units.push({ type: "single", item: p });
    }
  }
  return units;
}

function processWorkItemImages(item: any) {
  const processed: Array<{ url: string; alt: string; type: "image" | "video" }> = [];
  if (!item.images || !Array.isArray(item.images)) return processed;
  const title = item.projectTitle || "Project";
  item.images.forEach((media: any) => {
    const one = processOneMedia(media, title);
    if (one) processed.push(one);
  });
  return processed;
}

async function getFeaturedWork() {
  try {
    const workItems = await client.fetch(featuredWorkQuery);
    return workItems || [];
  } catch (error) {
    console.error('Error fetching featured work:', error);
    return [];
  }
}

async function getSpotlightItems() {
  try {
    const spotlightItems = await client.fetch(spotlightQuery);
    return spotlightItems || [];
  } catch (error) {
    console.error('Error fetching spotlight items:', error);
    return [];
  }
}

async function getPageData(slug: string) {
  try {
    const pageData = await client.fetch(pageDataQuery(slug));
    return pageData || null;
  } catch (error) {
    console.error(`Error fetching ${slug} page data:`, error);
    return null;
  }
}

async function getAboutPageData() {
  return getPageData('about');
}

async function getNavigationPages() {
  try {
    const pages = await client.fetch(navigationPagesQuery);
    return pages || [];
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    return [];
  }
}

async function getHomepageWork() {
  try {
    const data = await client.fetch(homepageWorkQuery);
    return data || null;
  } catch (error) {
    console.error('Error fetching homepage work:', error);
    return null;
  }
}

async function getPricingAndDesigners() {
  try {
    return await client.fetch(pricingAndDesignersQuery);
  } catch (error) {
    console.error("Error fetching pricing & designers:", error);
    return null;
  }
}

function sanityImageToSideImage(
  imageField: { asset?: unknown; alt?: string | null } | null | undefined,
  fallbackAlt: string,
): HomePricingSideImage | undefined {
  if (!imageField?.asset) return undefined;
  try {
    const src = urlFor(imageField as Parameters<typeof urlFor>[0])
      .width(106)
      .height(112)
      .fit("crop")
      .quality(90)
      .format("jpg")
      .url();
    const alt =
      (imageField.alt && String(imageField.alt).trim()) || fallbackAlt;
    return { src, alt };
  } catch {
    const url = (imageField.asset as { url?: string })?.url;
    if (!url) return undefined;
    return { src: url, alt: fallbackAlt };
  }
}

export const revalidate = 60; // Revalidate every 60 seconds

type WorkWithMedia = {
  item: any;
  processed: any[];
  /** Featured 2-col / main hero / below-logos */
  cover: { url: string; alt: string; type: "image" | "video" } | null;
  /** Homepage 3-col grid (7:8); falls back to cover when unset */
  gridCover: { url: string; alt: string; type: "image" | "video" } | null;
};

function toWorkWithMedia(item: any): WorkWithMedia {
  const processed = processWorkItemImages(item);
  const title = item.projectTitle || "Project";
  const coverFromSchema = item.cover?.[0] ? processOneMedia(item.cover[0], title) : null;
  const cover = coverFromSchema ?? processed[0] ?? null;

  const gridFromField = item.gridCover?.[0] ? processGridCoverImage(item.gridCover[0], title) : null;
  const gridFromHeroCover =
    !gridFromField && item.cover?.[0]?._type === "image"
      ? processGridCoverImage(item.cover[0], title)
      : null;
  const firstGalleryImage = Array.isArray(item.images)
    ? item.images.find((m: any) => m?._type === "image" && m?.asset)
    : null;
  const gridFromGallery =
    !gridFromField && !gridFromHeroCover && firstGalleryImage
      ? processGridCoverImage(firstGalleryImage, title)
      : null;

  const gridCover = gridFromField ?? gridFromHeroCover ?? gridFromGallery ?? cover;
  return { item, processed, cover, gridCover };
}

function isNotMotionStudies(item: { projectTitle?: string | null }): boolean {
  return (item?.projectTitle || "").trim().toLowerCase() !== "motion studies";
}

function normalizeIndexColumns(
  cols: { items?: string[] | null }[] | null | undefined,
): string[][] {
  if (!cols?.length) return [];
  return cols.map((col) =>
    (col.items || []).map((s) => String(s).trim()).filter(Boolean),
  );
}

function columnsHaveItems(cols: string[][]): boolean {
  return cols.some((c) => c.length > 0);
}

async function getHomeIndex() {
  try {
    return await client.fetch(homeIndexQuery);
  } catch (e) {
    console.error("Error fetching home index:", e);
    return null;
  }
}

export default async function Home() {
  // Fetch navigation pages, homepage/work page data, spotlight, testimonials, about page data from Sanity
  const navigationPages = await getNavigationPages();
  const [homepageData, homeIndex] = await Promise.all([
    getPageData("work"),
    getHomeIndex(),
  ]);

  const homepageWork = await getHomepageWork();
  const rawSpotlightItems = await getSpotlightItems();
  const rawTestimonials = await getHomeTestimonials();
  const aboutPageData = await getAboutPageData();
  const servicesPageData = await getPageData("services");
  const pricingDoc = await getPricingAndDesigners();

  let monthlyRateSideImage: HomePricingSideImage | undefined;
  let teamPricingSideImages: HomePricingSideImage[] | undefined;
  let pricingRates: Partial<HomePricingTierRates> | undefined;
  let pricingMaxTeamSize = 8;

  if (pricingDoc) {
    const dru = sanityImageToSideImage(pricingDoc.druPortrait, "Dru");
    monthlyRateSideImage = dru;

    const extras = (pricingDoc.additionalDesignerPhotos || [])
      .map((row: { photo?: unknown }, index: number) =>
        sanityImageToSideImage(
          row.photo as { asset?: unknown; alt?: string | null },
          `Designer ${index + 1}`,
        ),
      )
      .filter(Boolean) as HomePricingSideImage[];

    if (dru) {
      teamPricingSideImages = [dru, ...extras];
    } else if (extras.length > 0) {
      teamPricingSideImages = extras;
    }

    const partial: Partial<HomePricingTierRates> = {};
    if (Number.isFinite(pricingDoc.baseMonthlyLead)) {
      partial.baseMonthly = pricingDoc.baseMonthlyLead as number;
    }
    if (Number.isFinite(pricingDoc.rateAdditional1)) {
      partial.rateAdditional1 = pricingDoc.rateAdditional1 as number;
    }
    if (Number.isFinite(pricingDoc.rateAdditional2)) {
      partial.rateAdditional2 = pricingDoc.rateAdditional2 as number;
    }
    if (Number.isFinite(pricingDoc.rateAdditional3Plus)) {
      partial.rateAdditional3Plus = pricingDoc.rateAdditional3Plus as number;
    }
    if (Object.keys(partial).length > 0) {
      pricingRates = partial;
    }

    if (
      typeof pricingDoc.maxTeamSize === "number" &&
      pricingDoc.maxTeamSize >= 1
    ) {
      pricingMaxTeamSize = Math.min(50, pricingDoc.maxTeamSize);
    }
  }

  let featuredThree: WorkWithMedia[];
  let gridItems: WorkWithMedia[];

  if (homepageWork?.featuredTwoCol?.length || homepageWork?.featuredMain || homepageWork?.gridItems?.length) {
    // Use Homepage Work schema: ordered 2-col, main, grid
    const twoCol = (homepageWork.featuredTwoCol || [])
      .filter(Boolean)
      .filter(isNotMotionStudies)
      .map(toWorkWithMedia);
    const main =
      homepageWork.featuredMain && isNotMotionStudies(homepageWork.featuredMain)
        ? [toWorkWithMedia(homepageWork.featuredMain)]
        : [];
    featuredThree = [...twoCol.slice(0, 2), ...main].slice(0, 3);
    gridItems = (homepageWork.gridItems || [])
      .filter(Boolean)
      .filter(isNotMotionStudies)
      .map(toWorkWithMedia);
  } else {
    // Fallback: work from page sections or all featured work, grid by order only
    const workItemsRaw = homepageData?.sections
      ?.filter((item: any) => item?._type === 'featuredWork')
        .map((item: any) => ({
        _id: item._id,
        _type: item._type,
        projectTitle: item.projectTitle,
        projectDescriptionShort: item.projectDescriptionShort,
        teamContribution: item.teamContribution,
        creative: item.creative ?? null,
        roleImpact: item.roleImpact ?? null,
        order: item.order,
        cover: item.cover || [],
        gridCover: item.gridCover || [],
        images: item.images || [],
      })) || await getFeaturedWork();
    const workItems = (workItemsRaw || []).filter(isNotMotionStudies);
    const allWithMedia = workItems.map((item: any) => toWorkWithMedia(item));
    featuredThree = allWithMedia.slice(0, 3);
    gridItems = allWithMedia.slice(3).sort((a: WorkWithMedia, b: WorkWithMedia) => (a.item.order ?? 0) - (b.item.order ?? 0));
  }

  const belowLogosProject =
    homepageWork?.belowLogosProject && isNotMotionStudies(homepageWork.belowLogosProject)
      ? toWorkWithMedia(homepageWork.belowLogosProject)
      : null;

  const indexClientColsRaw = normalizeIndexColumns(homeIndex?.clientColumns);
  const indexServicesColsRaw = normalizeIndexColumns(homeIndex?.servicesColumns);

  // Index singleton overrides Work title for the Index tab; else Work hero title
  const heroTitle =
    (homeIndex?.title && String(homeIndex.title).trim()) ||
    homepageData?.heroTitle ||
    "Design partner with engineering\nfluency";

  const indexClientColumns = columnsHaveItems(indexClientColsRaw)
    ? indexClientColsRaw
    : undefined;
  const indexServicesColumns = columnsHaveItems(indexServicesColsRaw)
    ? indexServicesColsRaw
    : undefined;
  const indexContactButtonText =
    (homeIndex?.contactButtonText && String(homeIndex.contactButtonText).trim()) ||
    "Contact";

  const pageTitles = (navigationPages as { slug: string; title: string }[]).reduce(
    (acc, page) => {
      acc[page.slug] = page.title;
      return acc;
    },
    {} as Record<string, string>,
  );
  const navAboutTitle = pageTitles.about || "About";
  const navServicesTitle = pageTitles.services || "Services";

  const servicesSectionsForHome = parseServicesPageSectionsForHome(
    servicesPageData?.sections,
  );

  const homeGridTestimonials: HomeTestimonialItem[] = rawTestimonials.map(
    (testimonial: any) => {
      let photoUrl: string | null = null;
      const photoAlt =
        testimonial?.personPhoto?.alt || testimonial?.person || "Person photo";
      if (testimonial?.personPhoto?.asset) {
        try {
          photoUrl = urlFor(testimonial.personPhoto)
            .width(114)
            .height(114)
            .fit("crop")
            .quality(90)
            .format("jpg")
            .url();
        } catch {
          if (testimonial.personPhoto.asset?.url) {
            photoUrl = testimonial.personPhoto.asset.url;
          }
        }
      }
      const body =
        (testimonial.testimonialLong && testimonial.testimonialLong.trim()) ||
        testimonial.testimonialShort ||
        "";
      return {
        _id: testimonial._id,
        person: testimonial.person || "",
        role: testimonial.role || "",
        company: testimonial.company || "",
        body,
        photoUrl,
        photoAlt,
      };
    },
  );

  // Process spotlight items from Sanity
  const processedSpotlightItems = rawSpotlightItems.map((item: any) => {
    const media = item.media;
    let mediaUrl = '';
    let mediaAlt = '';
    let mediaType: 'image' | 'video' = 'image';

    if (media?.type === 'image' && media?.image?.asset) {
      try {
        // Use fit('max') to preserve full image without cropping
        // Set a high max height to ensure quality, but let width be auto
        mediaUrl = urlFor(media.image)
          .height(1200) // High resolution for quality (desktop)
          .fit('max') // Preserve full image, no cropping
          .quality(90)
          .format('jpg')
          .url();
        mediaAlt = media.image.alt || item.title || 'Spotlight image';
        mediaType = 'image';
      } catch (error) {
        console.error('Error building spotlight image URL:', error);
        if (media.image.asset?.url) {
          mediaUrl = media.image.asset.url;
          mediaAlt = media.image.alt || item.title || 'Spotlight image';
        }
      }
    } else if (media?.type === 'video' && media?.video?.asset) {
      mediaUrl = media.video.asset.url;
      mediaAlt = item.title || 'Spotlight video';
      mediaType = 'video';
    }

    return {
      url: mediaUrl,
      alt: mediaAlt,
      text: item.title || '',
      type: mediaType,
    };
  }).filter((item: any) => item.url); // Filter out items without valid media URLs

  // ---- New homepage sequence (Figma redesign) ----
  // Figma nav uses "Projects" (the Sanity page title is "Work").
  const navProjectsTitle = "Projects";

  // Fallback ordering: flatten legacy fields (used only when no Homepage sections are set).
  const legacyFlat = [
    ...(homepageWork?.featuredTwoCol || []),
    ...(homepageWork?.featuredMain ? [homepageWork.featuredMain] : []),
    ...(homepageWork?.gridItems || []),
    ...(homepageWork?.belowLogosProject ? [homepageWork.belowLogosProject] : []),
  ];
  const seenProjectIds = new Set<string>();
  const layoutProjects: HomeLayoutProject[] = legacyFlat
    .filter(Boolean)
    .filter(isNotMotionStudies)
    .filter((item: any) => {
      const id = item?._id;
      if (!id) return true;
      if (seenProjectIds.has(id)) return false;
      seenProjectIds.add(id);
      return true;
    })
    .map((item: any, i: number) => toLayoutProject(item, i));

  // Primary path: Homepage sections from Sanity; fall back to the positional legacy layout.
  const sequenceUnits: SequenceUnit[] = homepageWork?.homepageSections?.length
    ? sectionsToUnits(homepageWork.homepageSections)
    : groupSequence(layoutProjects);

  // Approach block (80% width, above the notes): cover + badge from the "Recent" project,
  // else the first section/legacy project. The reel is intentionally not shown.
  const recentRef = homepageWork?.recentProject
    ? resolveProjectRef(homepageWork.recentProject)
    : null;
  const firstSectionProject = homepageWork?.homepageSections?.[0]?.projects?.[0];
  const firstSectionRef = firstSectionProject ? resolveProjectRef(firstSectionProject) : null;
  const approachSource =
    (recentRef?.cover ? recentRef : null) ??
    (firstSectionRef?.cover ? firstSectionRef : null) ??
    (layoutProjects[0]?.cover
      ? { cover: layoutProjects[0].cover, tag: layoutProjects[0].tag }
      : null);
  const approachCover: LayoutMedia | null = approachSource?.cover ?? null;
  const approachTag: string | null = approachSource?.tag ?? null;

  // Pricing strip
  const baseMonthly = pricingRates?.baseMonthly ?? pricingDoc?.baseMonthlyLead ?? 20000;
  const monthlyRateValue = `GBP ${Number(baseMonthly).toLocaleString("en-GB")}`;
  const teamDetail =
    (pricingDoc?.howIWorkDescription && String(pricingDoc.howIWorkDescription).trim()) ||
    (pricingDoc?.moreInfoDescription && String(pricingDoc.moreInfoDescription).trim()) ||
    null;

  return (
    <div className="relative w-full bg-background min-h-screen overflow-x-hidden">
      {/* 1 — Hero: logo + top-right nav + intro text */}
      <HomeHeroIntro
        introParagraph={homepageData?.homepageDescription ?? null}
        aboutContent={aboutPageData?.homepageDescription ?? null}
        services={indexServicesColumns ? indexServicesColumns.flat() : undefined}
        projectsLabel={navProjectsTitle}
        aboutLabel={navAboutTitle}
        servicesLabel={navServicesTitle}
      />

      {/* 2 — Approach: 80% cover + four notes */}
      <HomeApproachBlock cover={approachCover} tag={approachTag} />

      {/* 3 — Clients + pricing */}
      <HomeClientsPricing
        clientColumns={indexClientColumns}
        monthlyRateValue={monthlyRateValue}
        teamDetail={teamDetail}
      />

      {/* 4 — Project layout sequence.
           Spacing: 264px below clients/pricing; 140px between sections; but a 3-col grid,
           and any section following a two-up 20/30, sit just 36px below. */}
      {sequenceUnits.length > 0 && (
        <div className="w-full px-[2.5%] sm:px-6 pt-[120px] lg:pt-[264px] flex flex-col">
          {sequenceUnits.map((unit, i) => {
            const prev = sequenceUnits[i - 1];
            const prevIsTwoUp2030 =
              prev?.type === "single" && prev.item.layout === "two-up-20-30";
            const isGrid = unit.type === "grid";
            const mt =
              i === 0
                ? ""
                : isGrid || prevIsTwoUp2030
                  ? "mt-[36px]"
                  : "mt-[100px] lg:mt-[140px]";
            return unit.type === "grid" ? (
              <div
                key={`grid-${i}`}
                className={`${mt} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[28px]`}
              >
                {unit.items.map((item) => (
                  <HomeLayoutBlock key={item.id} project={item} />
                ))}
              </div>
            ) : (
              <div key={unit.item.id} className={mt}>
                <HomeLayoutBlock project={unit.item} />
              </div>
            );
          })}
        </div>
      )}

      {/* 5 — Testimonials (2-col). No left padding so cards sit close to the edge. */}
      <div className="w-full pr-[2.5%] sm:pr-6 pt-[120px] lg:pt-[180px]">
        <HomeTestimonialsGrid testimonials={homeGridTestimonials} />
      </div>

      {/* 6 — Footer: world clocks + sign-off */}
      <footer className="w-full px-[2.5%] sm:px-6 pt-[120px] lg:pt-[200px] pb-[40px]">
        <HomeFooterClock />
      </footer>

      {/*
        Legacy homepage — kept intentionally (per redesign brief) but not rendered.
        Restore by changing `false` to a real condition.
      */}
      {false && (
        <>
          <HomeLandingHero
            heroTitle={heroTitle}
            homepageDescription={homepageData?.homepageDescription}
            aboutPageDescription={aboutPageData?.homepageDescription}
            servicesPageDescription={servicesPageData?.homepageDescription}
            servicesHeroTitle={servicesPageData?.heroTitle ?? null}
            servicesSectionsForHome={servicesSectionsForHome}
            heroReelVideoUrl={homepageWork?.heroReelVideo?.asset?.url ?? null}
            aboutLabel={navAboutTitle}
            servicesLabel={navServicesTitle}
            indexClientColumns={indexClientColumns}
            indexServicesColumns={indexServicesColumns}
            indexContactButtonText={indexContactButtonText}
          />
          <HomePricingCalculator
            maxDesigners={pricingMaxTeamSize}
            pricingRates={pricingRates}
            monthlyRateSideImage={monthlyRateSideImage}
            teamPricingSideImages={teamPricingSideImages}
            moreInfoTitle={pricingDoc?.moreInfoTitle ?? null}
            moreInfoDescription={pricingDoc?.moreInfoDescription ?? null}
            howIWorkTitle={pricingDoc?.howIWorkTitle ?? null}
            howIWorkDescription={pricingDoc?.howIWorkDescription ?? null}
          />
          {featuredThree.length >= 3 &&
            featuredThree.map(({ item, cover, gridCover }: WorkWithMedia) => (
              <HomeProjectCard
                key={item._id}
                cover={cover ?? gridCover}
                variant="hero-half"
                title={item.projectTitle}
                creative={item.creative}
                href={item.slug ? `/work/${item.slug}` : null}
                comingSoon={item.comingSoon}
              />
            ))}
          {gridItems.map(({ item, gridCover }: WorkWithMedia, i: number) => (
            <HomeProjectCard
              key={item._id || i}
              cover={gridCover}
              variant="grid"
              gridPortrait
              title={item.projectTitle}
              creative={item.creative ?? null}
              href={item.slug ? `/work/${item.slug}` : null}
              comingSoon={item.comingSoon}
            />
          ))}
          {belowLogosProject && (
            <HomeProjectCard
              cover={belowLogosProject?.cover ?? null}
              variant="hero-main"
              title={belowLogosProject?.item.projectTitle}
              creative={belowLogosProject?.item.creative}
              href={belowLogosProject?.item.slug ? `/work/${belowLogosProject?.item.slug}` : "/work"}
              comingSoon={belowLogosProject?.item.comingSoon}
            />
          )}
          {processedSpotlightItems.length > 0 && (
            <SpotlightCarouselWrapper items={processedSpotlightItems} />
          )}
        </>
      )}
    </div>
  );
}
