import HomeProjectCard from "@/components/HomeProjectCard";
import HomeLandingHero from "@/components/HomeLandingHero";
import HomePricingCalculator, {
  type HomePricingSideImage,
  type HomePricingTierRates,
} from "@/components/HomePricingCalculator";
import HomeTestimonialsGrid, {
  type HomeTestimonialItem,
} from "@/components/HomeTestimonialsGrid";
import SpotlightCarouselWrapper from "@/components/SpotlightCarouselWrapper";
import HeroDescriptionWithCompanyAccent from "@/components/HeroDescriptionWithCompanyAccent";
import {
  client,
  featuredWorkQuery,
  homepageWorkQuery,
  heroTestimonialsQuery,
  spotlightQuery,
  pageDataQuery,
  navigationPagesQuery,
  pricingAndDesignersQuery,
  urlFor,
} from "@/lib/sanity";

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

export default async function Home() {
  // Fetch navigation pages, homepage/work page data, spotlight, testimonials, about page data from Sanity
  const navigationPages = await getNavigationPages();
  const homepageData = await getPageData('work');
  
  const homepageWork = await getHomepageWork();
  const rawSpotlightItems = await getSpotlightItems();
  const rawTestimonials = await getHomeTestimonials();
  const aboutPageData = await getAboutPageData();
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
    const twoCol = (homepageWork.featuredTwoCol || []).filter(Boolean).map(toWorkWithMedia);
    const main = homepageWork.featuredMain ? [toWorkWithMedia(homepageWork.featuredMain)] : [];
    featuredThree = [...twoCol.slice(0, 2), ...main].slice(0, 3);
    gridItems = (homepageWork.gridItems || []).filter(Boolean).map(toWorkWithMedia);
  } else {
    // Fallback: work from page sections or all featured work, grid by order only
    const workItems = homepageData?.sections
      ?.filter((item: any) => item?._type === 'featuredWork')
        .map((item: any) => ({
        _id: item._id,
        _type: item._type,
        projectTitle: item.projectTitle,
        projectDescriptionShort: item.projectDescriptionShort,
        projectDescriptionLong: item.projectDescriptionLong,
        teamContribution: item.teamContribution,
        creative: item.creative ?? null,
        order: item.order,
        cover: item.cover || [],
        gridCover: item.gridCover || [],
        images: item.images || [],
      })) || await getFeaturedWork();
    const allWithMedia = (workItems || []).map((item: any) => toWorkWithMedia(item));
    featuredThree = allWithMedia.slice(0, 3);
    gridItems = allWithMedia.slice(3).sort((a: WorkWithMedia, b: WorkWithMedia) => (a.item.order ?? 0) - (b.item.order ?? 0));
  }

  const belowLogosProject = homepageWork?.belowLogosProject
    ? toWorkWithMedia(homepageWork.belowLogosProject)
    : null;

  // Get hero title from homepage data, with fallback
  const heroTitle =
    homepageData?.heroTitle || "Design partner with engineering\nfluency";

  const pageTitles = (navigationPages as { slug: string; title: string }[]).reduce(
    (acc, page) => {
      acc[page.slug] = page.title;
      return acc;
    },
    {} as Record<string, string>,
  );
  const navAboutTitle = pageTitles.about || "About";
  const navServicesTitle = pageTitles.services || "Services";

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

  return (
    <div className="relative w-full bg-background min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <HomeLandingHero
        heroTitle={heroTitle}
        heroDescription={homepageData?.heroDescription}
        aboutLabel={navAboutTitle}
        servicesLabel={navServicesTitle}
      />

      <div className="w-full px-[2.5%] sm:px-6 pb-12 lg:pb-16">
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
      </div>

      {/* Content Section - Normal Flow */}
      <div className="w-full relative z-0">
        {/* Featured projects: desktop only (2-col row + main 70%). On mobile these appear in the grid below. */}
        {featuredThree.length >= 3 && (
          <section className="hidden md:block w-full pt-8 lg:pt-12 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
              <div className="min-w-0">
                <HomeProjectCard cover={featuredThree[0].cover} variant="hero-half" title={featuredThree[0].item.projectTitle} creative={featuredThree[0].item.creative} href={featuredThree[0].item.slug ? `/work/${featuredThree[0].item.slug}` : null} comingSoon={featuredThree[0].item.comingSoon} />
              </div>
              <div className="min-w-0">
                <HomeProjectCard cover={featuredThree[1].cover} variant="hero-half" title={featuredThree[1].item.projectTitle} creative={featuredThree[1].item.creative} href={featuredThree[1].item.slug ? `/work/${featuredThree[1].item.slug}` : null} comingSoon={featuredThree[1].item.comingSoon} />
              </div>
              <div className="min-w-0 w-full md:col-span-2 flex md:justify-center pt-0 md:pt-[120px]">
                <div className="w-full md:max-w-[70%]">
                  <HomeProjectCard cover={featuredThree[2].cover} variant="hero-main" title={featuredThree[2].item.projectTitle} creative={featuredThree[2].item.creative} href={featuredThree[2].item.slug ? `/work/${featuredThree[2].item.slug}` : null} comingSoon={featuredThree[2].item.comingSoon} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials — after featured work, before Spotlight (mobile: below pricing with section spacing) */}
        <div className="w-full px-[2.5%] sm:px-6 mt-16 lg:mt-0 lg:pt-20">
          <HomeTestimonialsGrid testimonials={homeGridTestimonials} />
        </div>

        {/* Spotlight Carousel — below testimonials (desktop only) */}
        {processedSpotlightItems.length > 0 && (
          <section className="hidden md:block w-full pt-16 lg:pt-[100px]">
            <SpotlightCarouselWrapper items={processedSpotlightItems} />
          </section>
        )}

        {/* About Page Hero Description — same grid + right column as HomeLandingHero intro (col 7–12, typography match) */}
        {aboutPageData?.heroDescription && (
          <div className="w-full px-[2.5%] sm:px-6 mt-[48px] mb-[90px] lg:mt-[138px] lg:mb-[170px]">
            <div className="grid grid-cols-12 gap-x-1 gap-y-10 lg:gap-y-8 w-full">
              <div className="col-span-12 lg:col-span-6 lg:col-start-7 min-w-0">
                <div className="flex flex-col gap-8 lg:gap-[31px] w-full">
                  <HeroDescriptionWithCompanyAccent
                    text={aboutPageData.heroDescription}
                    className="font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground m-0 whitespace-pre-line"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Work grid: 3 cols (md+), 16px column gap, 152px row gap, 58px horizontal padding; 7:8 tiles with 20px radius. Mobile: 1 col, featured three then remaining grid items (hidden md+ in hero strip). */}
      <div className="w-full mt-[40px] lg:mt-[80px] px-[58px]">
        {(featuredThree.length >= 3 || gridItems.length > 0) ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-[152px] md:grid-cols-3">
            {featuredThree.length >= 3 &&
              featuredThree.map(({ item, gridCover }: WorkWithMedia) => (
                <div key={item._id} className="md:hidden min-w-0">
                  <HomeProjectCard
                    cover={gridCover}
                    variant="grid"
                    gridPortrait
                    title={item.projectTitle}
                    creative={item.creative ?? null}
                    href={item.slug ? `/work/${item.slug}` : null}
                    comingSoon={item.comingSoon}
                  />
                </div>
              ))}
            {gridItems.map(({ item, gridCover }: WorkWithMedia, i: number) => (
              <div key={item._id || i} className="min-w-0">
                <HomeProjectCard
                  cover={gridCover}
                  variant="grid"
                  gridPortrait
                  title={item.projectTitle}
                  creative={item.creative ?? null}
                  href={item.slug ? `/work/${item.slug}` : null}
                  comingSoon={item.comingSoon}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted text-sm">No featured work items found. Please add items in Sanity Studio.</div>
        )}
      </div>

      {/* Project below logos: desktop only, 40% width (hero-main) */}
      {belowLogosProject && (
        <section className="hidden md:block w-full pt-[240px] pb-[40px] lg:pb-[200px]">
          <div className="w-full flex justify-center px-6">
            <div className="w-full max-w-[40%]">
              <HomeProjectCard
                cover={belowLogosProject.cover}
                variant="hero-main"
                title={belowLogosProject.item.projectTitle}
                creative={belowLogosProject.item.creative}
                href={belowLogosProject.item.slug ? `/work/${belowLogosProject.item.slug}` : "/work"}
                comingSoon={belowLogosProject.item.comingSoon}
              />
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
