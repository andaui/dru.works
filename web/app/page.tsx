import Header from "@/components/Header";
import HomeProjectCard from "@/components/HomeProjectCard";
import HeroTestimonial from "@/components/HeroTestimonial";
import SpotlightCarouselWrapper from "@/components/SpotlightCarouselWrapper";
import Link from "@/components/Link";
import NextLink from "next/link";
import Clients from "@/components/Clients";
import Price2Col from "@/components/Price2Col";
import Image from "next/image";
import { client, featuredWorkQuery, homepageWorkQuery, heroTestimonialsQuery, spotlightQuery, pageDataQuery, clientsSectionQuery, navigationPagesQuery, urlFor } from "@/lib/sanity";

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

async function getHeroTestimonials() {
  try {
    const testimonials = await client.fetch(heroTestimonialsQuery);
    return testimonials || [];
  } catch (error) {
    console.error('Error fetching hero testimonials:', error);
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

async function getClientsSection() {
  try {
    const clientsSection = await client.fetch(clientsSectionQuery);
    if (!clientsSection) return [];
    
    // Extract logos from all blocks and content items
    const allLogos: any[] = [];
    if (clientsSection.blocks) {
      clientsSection.blocks.forEach((block: any) => {
        if (block.content) {
          block.content.forEach((content: any) => {
            if (content._type === 'clients' && content.logos) {
              allLogos.push(...content.logos);
            }
          });
        }
      });
    }
    return allLogos;
  } catch (error) {
    console.error('Error fetching clients section:', error);
    return [];
  }
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

export const revalidate = 60; // Revalidate every 60 seconds

type WorkWithMedia = { item: any; processed: any[]; cover: { url: string; alt: string; type: "image" | "video" } | null };

function toWorkWithMedia(item: any): WorkWithMedia {
  const processed = processWorkItemImages(item);
  const title = item.projectTitle || "Project";
  const coverFromSchema = item.cover?.[0] ? processOneMedia(item.cover[0], title) : null;
  return { item, processed, cover: coverFromSchema ?? processed[0] ?? null };
}

export default async function Home() {
  // Fetch navigation pages, homepage/work page data, testimonials, spotlight items, about page data, and clients section from Sanity
  const navigationPages = await getNavigationPages();
  const homepageData = await getPageData('work');
  
  const homepageWork = await getHomepageWork();
  const rawTestimonials = await getHeroTestimonials();
  const rawSpotlightItems = await getSpotlightItems();
  const aboutPageData = await getAboutPageData();
  const clientLogos = await getClientsSection();

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
  const heroTitle = homepageData?.heroTitle || "Design partner with\nengineering fluency";
  
  // Extract pricing data from pricing section
  // First try to find it in the work page sections
  let pricingSection = homepageData?.sections?.find((item: any) => 
    item?._type === 'section' && item?.sectionTitle?.toLowerCase() === 'pricing'
  );
  
  // If not found in work page, try fetching it directly as a standalone section
  if (!pricingSection) {
    try {
      const pricingSectionData = await client.fetch(`*[_type == "section" && (sectionTitle == "Pricing" || sectionTitle == "pricing")][0] {
        _id,
        _type,
        sectionTitle,
        blocks[] {
          _key,
          content[] {
            _type,
            _key,
            items[] {
              label,
              price
            }
          }
        }
      }`);
      pricingSection = pricingSectionData;
    } catch (error) {
      console.error('Error fetching pricing section:', error);
    }
  }
  
  // Find price2Col content in the pricing section
  let pricingItems: Array<{ label: string; price: string }> | null = null;
  if (pricingSection?.blocks) {
    for (const block of pricingSection.blocks) {
      if (block.content) {
        const priceContent = block.content.find((content: any) => content._type === 'price2Col');
        if (priceContent?.items && Array.isArray(priceContent.items) && priceContent.items.length > 0) {
          // Validate items structure
          const validItems = priceContent.items.filter((item: any) => 
            item && typeof item === 'object' && 'label' in item && 'price' in item
          );
          if (validItems.length > 0) {
            pricingItems = validItems;
            break;
          }
        }
      }
    }
  }
  
  // Debug logging (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('Pricing section found:', !!pricingSection);
    console.log('Pricing items:', pricingItems);
  }
  
  // Process testimonials data on the server
  const processedTestimonials = rawTestimonials.map((testimonial: any) => {
    // Process person photo
    let personPhotoUrl: string | null = null;
    let personPhotoAlt: string = '';
    
    if (testimonial?.personPhoto?.asset) {
      try {
        personPhotoUrl = urlFor(testimonial.personPhoto)
          .width(42) // 21px * 2 for retina
          .height(42)
          .fit('crop')
          .quality(90)
          .format('jpg')
          .url();
        personPhotoAlt = testimonial.personPhoto.alt || testimonial.person || 'Person photo';
      } catch (error) {
        console.error('Error building person photo URL:', error);
        if (testimonial.personPhoto.asset?.url) {
          personPhotoUrl = testimonial.personPhoto.asset.url;
          personPhotoAlt = testimonial.personPhoto.alt || testimonial.person || 'Person photo';
        }
      }
    }
    
    // Format role and company
    // Use "of" for founder roles, "at" for other roles
    const role = testimonial?.role || '';
    const company = testimonial?.company || '';
    const isFounderRole = role.toLowerCase().includes('founder') || role.toLowerCase().includes('co-founder');
    const roleAtCompany = role && company 
      ? isFounderRole 
        ? `${role} of ${company}`
        : `${role} at ${company}`
      : '';
    
    return {
      _id: testimonial._id,
      testimonialShort: testimonial.testimonialShort || '',
      person: testimonial.person || '',
      roleAtCompany,
      personPhotoUrl,
      personPhotoAlt,
    };
  });

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
    <div className="relative w-full max-w-[1900px] mx-auto bg-background min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" navigationPages={navigationPages} />

      {/* Hero Section */}
      <div className="w-full flex justify-start md:justify-center pt-[30px] pb-[76px] lg:pt-[120px] lg:pb-[156px] px-[2.5%] sm:px-[24px]">
        <div className="flex w-[90%] max-w-[700px] flex-col items-start md:items-center gap-[22px]">
          <div className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-foreground text-left md:text-center tracking-[-0.25px]">
            {heroTitle.split('\n').map((line: string, index: number) => (
              <p key={index} className="mb-0">{line}</p>
            ))}
          </div>
          <HeroTestimonial
            testimonials={processedTestimonials}
          />
        </div>
      </div>

      {/* Content Section - Normal Flow */}
      <div className="w-full relative z-0">
        {/* Pricing and CTA Section - 22px above line */}
        {pricingItems && (
          <div className="w-full flex flex-col md:flex-row justify-start md:justify-between items-start md:items-end px-[2.5%] sm:px-[24px] mb-[22px] gap-[22px] md:gap-0">
            {/* Pricing Section - Left Side */}
            <Price2Col items={pricingItems} />

            {/* CTA Button */}
            <NextLink href="/about#mentorship" className="flex items-center justify-end gap-[4px] group transition-colors">
              <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-muted text-nowrap group-hover:text-foreground transition-colors">
                Interested in Team Design Sessions?
              </p>
              <div className="shrink-0 text-muted group-hover:text-foreground transition-colors" style={{ width: '14px', height: '14px' }}>
                <svg className="block size-full max-w-none" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.046 9.49858L3.42871 8.88129L8.01881 4.28328H4.47335L4.48127 3.42857H9.49081V8.44602H8.62818L8.6361 4.90057L4.046 9.49858Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </NextLink>
          </div>
        )}

        <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />

        {/* Featured projects: 2-col row + main 70%. Configure in Sanity → Homepage Work. */}
        {featuredThree.length >= 3 && (
          <section className="w-full pt-8 lg:pt-12 px-6">
            <div className="grid grid-cols-2 w-full gap-4">
              <div className="min-w-0">
                <HomeProjectCard cover={featuredThree[0].cover} variant="hero-half" title={featuredThree[0].item.projectTitle} creative={featuredThree[0].item.creative} href={featuredThree[0].item.slug ? `/work/${featuredThree[0].item.slug}` : null} />
              </div>
              <div className="min-w-0">
                <HomeProjectCard cover={featuredThree[1].cover} variant="hero-half" title={featuredThree[1].item.projectTitle} creative={featuredThree[1].item.creative} href={featuredThree[1].item.slug ? `/work/${featuredThree[1].item.slug}` : null} />
              </div>
            </div>
            <div className="w-full flex justify-center pt-[120px]">
              <div className="w-full max-w-[70%]">
                <HomeProjectCard cover={featuredThree[2].cover} variant="hero-main" title={featuredThree[2].item.projectTitle} creative={featuredThree[2].item.creative} href={featuredThree[2].item.slug ? `/work/${featuredThree[2].item.slug}` : null} />
              </div>
            </div>
          </section>
        )}

        {/* Spotlight Carousel - below featured projects */}
        {processedSpotlightItems.length > 0 && (
          <section className="w-full pt-[130px]">
            <SpotlightCarouselWrapper items={processedSpotlightItems} />
          </section>
        )}

        {/* About Page Hero Description - 138px below carousel, aligned with carousel (24px left on sm+ screens) */}
        {aboutPageData?.heroDescription && (
          <div className="px-[2.5%] sm:pl-[24px] sm:pr-0 mt-[48px] mb-[90px] lg:mt-[138px] lg:mb-[170px]">
            <div className="font-normal text-[16px] leading-[23px] not-italic text-foreground w-[788px] max-w-[calc(100%-48px)]">
              <p className="whitespace-pre-line mb-0">
                {aboutPageData.heroDescription}
              </p>
            </div>
            {/* About Link - 28px gap from description */}
            <div style={{ marginTop: '28px' }}>
              <Link text="About" url="/about" />
            </div>
          </div>
        )}

        {/* Second Separator Line - 170px below about section (or 98px below carousel if no about section) */}
        <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" style={{ marginTop: aboutPageData?.heroDescription ? '0' : '98px' }} />

      </div>

      {/* Work grid: first row 2 cols, then rows of 3 cols. Order controlled by Order field in Sanity. */}
      <div className="w-full px-[2.5%] lg:px-[24px] mt-[40px] lg:mt-[80px]">
        {gridItems.length > 0 ? (
          <div className="flex flex-col">
            {/* First row: 2 projects; 78px gap to second row; 16px col gap */}
            <div className="grid grid-cols-2 gap-x-4 mb-[78px]">
              {gridItems.slice(0, 2).map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }, i: number) => (
                <HomeProjectCard key={item._id || i} cover={cover} variant="grid" title={item.projectTitle} href={item.slug ? `/work/${item.slug}` : null} />
              ))}
            </div>
            {/* Following rows: 3 per row; 52px between rows */}
            {gridItems.slice(2).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-[52px]">
                {gridItems.slice(2).map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }, i: number) => (
                  <HomeProjectCard key={item._id || i} cover={cover} variant="grid" title={item.projectTitle} href={item.slug ? `/work/${item.slug}` : null} />
                ))}
              </div>
            )}
          </div>
        ) : featuredThree.length === 0 && gridItems.length === 0 ? (
          <div className="text-muted text-sm">No featured work items found. Please add items in Sanity Studio.</div>
        ) : null}
      </div>

      {/* Clients Section */}
      {clientLogos.length > 0 && (
        <>
          {/* Horizontal line with 200px gap from featured work */}
          <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2 mt-[80px] lg:mt-[200px]" />
          <div className="w-full" style={{ marginTop: '32px' }}>
            {/* Clients Title - matching Spotlight styling */}
            <div
              className="text-left pl-[2.5%] lg:pl-[24px] mb-4 md:mb-0"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                lineHeight: '20px',
                marginTop: '12px',
              }}
            >
              Clients
            </div>
            {/* Clients Logos - Right Side, aligned to top and far right */}
            <div className="w-full flex flex-col md:flex-row items-start gap-0 px-0">
              <div className="flex-1 w-full md:w-auto pt-0 flex justify-start md:justify-start lg:justify-end">
                <div className="w-full md:w-auto">
                  <Clients logos={clientLogos} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Project below logos: 40% width, links to project detail or work */}
      {belowLogosProject && (
        <section className="w-full flex justify-center px-6 pt-[240px] pb-[40px] lg:pb-[200px]">
          <div className="w-full max-w-[40%]">
            <HomeProjectCard
              cover={belowLogosProject.cover}
              variant="hero-main"
              title={belowLogosProject.item.projectTitle}
              creative={belowLogosProject.item.creative}
              href={belowLogosProject.item.slug ? `/work/${belowLogosProject.item.slug}` : "/work"}
            />
          </div>
        </section>
      )}
    </div>
  );
}
