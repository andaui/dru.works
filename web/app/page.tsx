import Header from "@/components/Header";
import WorkFeatureCard from "@/components/WorkFeatureCard";
import HeroTestimonial from "@/components/HeroTestimonial";
import SpotlightCarouselWrapper from "@/components/SpotlightCarouselWrapper";
import Link from "@/components/Link";
import NextLink from "next/link";
import Clients from "@/components/Clients";
import Image from "next/image";
import { client, featuredWorkQuery, heroTestimonialsQuery, spotlightQuery, pageDataQuery, clientsSectionQuery, urlFor } from "@/lib/sanity";

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

async function getAboutPageData() {
  try {
    const pageData = await client.fetch(pageDataQuery('about'));
    return pageData || null;
  } catch (error) {
    console.error('Error fetching about page data:', error);
    return null;
  }
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

export default async function Home() {
  // Fetch featured work, testimonials, spotlight items, about page data, and clients section from Sanity
  const workItems = await getFeaturedWork();
  const rawTestimonials = await getHeroTestimonials();
  const rawSpotlightItems = await getSpotlightItems();
  const aboutPageData = await getAboutPageData();
  const clientLogos = await getClientsSection();
  
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
          .quality(80) // Reduced quality for better mobile performance
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

  // Calculate approximate height needed: 758px (start) + 500px (carousel space) + (cards * 623px) + (gaps * 106px) + 200px bottom spacing
  const carouselHeight = 500; // Space for carousel
  const estimatedHeight = workItems.length > 0 
    ? 758 + carouselHeight + (workItems.length * 623) + ((workItems.length - 1) * 106) + 200
    : 1000 + carouselHeight + 200;
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .homepage-container {
            min-height: ${Math.max(estimatedHeight, 1000)}px;
          }
        }
      `}} />
      <div className="homepage-container relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" />


      {/* Hero Section */}
      <div className="w-full flex justify-start md:justify-center pt-[30px] pb-[76px] lg:pt-[120px] lg:pb-[156px] px-[2.5%] sm:px-[24px]">
        <div className="flex w-[90%] max-w-[700px] flex-col items-start md:items-center gap-[22px]">
          <div className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-black text-left md:text-center tracking-[-0.25px]">
            <p className="mb-0">Design partner with</p>
            <p>engineering fluency</p>
          </div>
          <HeroTestimonial
            testimonials={processedTestimonials}
          />
        </div>
      </div>

      {/* Content Section - Normal Flow */}
      <div className="w-full">
        {/* Pricing and CTA Section - 22px above line */}
        <div className="w-full flex flex-col md:flex-row justify-start md:justify-between items-start md:items-end px-[2.5%] sm:px-[24px] mb-[22px] gap-[22px] md:gap-0">
          {/* Pricing Section - Left Side */}
          <div className="flex items-end gap-[22px]">
            <div className="flex shrink-0 flex-col items-start gap-px font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap">
              <p className="relative shrink-0">Monthly</p>
              <p className="relative shrink-0">Quarterly</p>
              <p className="relative shrink-0">Bi-annual</p>
              <p className="relative shrink-0">Annual</p>
            </div>
            <div className="flex shrink-0 w-[67px] flex-col items-start gap-px font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap">
              <p className="relative shrink-0">GBP 25,000</p>
              <p className="relative shrink-0">GBP 70,000</p>
              <p className="relative shrink-0">GBP 135,000</p>
              <p className="relative shrink-0">GBP 255,000</p>
            </div>
          </div>

          {/* CTA Button */}
          <NextLink href="/about#mentorship" className="flex items-center justify-end gap-[4px] group transition-colors">
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap group-hover:text-black transition-colors">
              Interested in Team Design Sessions?
            </p>
            <div className="shrink-0" style={{ width: '14px', height: '14px' }}>
              <svg className="block size-full max-w-none" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.046 9.49858L3.42871 8.88129L8.01881 4.28328H4.47335L4.48127 3.42857H9.49081V8.44602H8.62818L8.6361 4.90057L4.046 9.49858Z"
                  fill="#989898"
                  className="group-hover:fill-black transition-colors"
                />
              </svg>
            </div>
          </NextLink>
        </div>

        <div className="w-screen h-px bg-[#e5e5e5] -ml-[2.5%] sm:ml-0 sm:w-full" />

        {/* Spotlight Carousel - Only renders on desktop, completely skipped on mobile */}
        {processedSpotlightItems.length > 0 && (
          <SpotlightCarouselWrapper items={processedSpotlightItems} />
        )}

        {/* About Page Hero Description - 138px below carousel, aligned with carousel (24px left on sm+ screens) */}
        {aboutPageData?.heroDescription && (
          <div className="px-[2.5%] sm:pl-[24px] sm:pr-0 mt-[48px] mb-[90px] lg:mt-[138px] lg:mb-[170px]">
            <div className="font-normal text-[16px] leading-[23px] not-italic text-black w-[788px] max-w-[calc(100%-48px)]">
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
        <div className="w-screen h-px bg-[#e5e5e5] -ml-[2.5%] sm:ml-0 sm:w-full" style={{ marginTop: aboutPageData?.heroDescription ? '0' : '98px' }} />

      </div>

      {/* Work Feature Cards Section */}
      <div className="w-full px-[2.5%] lg:pl-[24px] lg:pr-0 flex flex-col items-start gap-[46px] lg:gap-[106px] mt-[40px] lg:mt-[80px]">
        {workItems.length > 0 ? (
          workItems.map((item: any, index: number) => {
            // Process all images and videos from Sanity
            const processedImages: Array<{ url: string; alt: string; type: 'image' | 'video' }> = [];
            
            if (item.images && Array.isArray(item.images)) {
              item.images.forEach((media: any) => {
                if (media._type === 'image' && media.asset) {
                  try {
                    // Optimize image sizes for mobile: Much smaller on mobile to prevent crashes
                    // Desktop: 1692px (2x for retina), Mobile: 600px max (much smaller for mobile performance)
                    // Next.js Image component will handle further optimization
                    const imageUrl = urlFor(media)
                      .width(1692) // Max width for desktop retina (846 * 2)
                      .height(1246) // Max height for desktop retina (623 * 2)
                      .fit('crop')
                      .quality(75) // Lower quality for better mobile performance and smaller file sizes
                      .format('jpg') // Use JPEG for better compression
                      .url();
                    const imageAlt = media.alt || item.projectTitle || 'Project image';
                    processedImages.push({ url: imageUrl, alt: imageAlt, type: 'image' });
                  } catch (error) {
                    console.error('Error building image URL:', error);
                    // Fallback to direct asset URL if URL builder fails
                    if (media.asset?.url) {
                      processedImages.push({
                        url: media.asset.url,
                        alt: media.alt || item.projectTitle || 'Project image',
                        type: 'image',
                      });
                    }
                  }
                } else if (media._type === 'file' && media.asset && media.asset.mimeType?.startsWith('video/')) {
                  // Process video files - check mimeType to confirm it's a video
                  const videoUrl = media.asset.url;
                  const videoAlt = media.alt || item.projectTitle || 'Project video';
                  if (videoUrl) {
                    processedImages.push({ url: videoUrl, alt: videoAlt, type: 'video' });
                  }
                }
              });
            }

            return (
              <WorkFeatureCard
                key={item._id || index}
                projectTitle={item.projectTitle}
                projectDescriptionShort={item.projectDescriptionShort}
                projectDescriptionLong={item.projectDescriptionLong}
                teamContribution={item.teamContribution}
                images={processedImages}
              />
            );
          })
        ) : (
          <div className="text-[#989898] text-sm">No featured work items found. Please add items in Sanity Studio.</div>
        )}
      </div>

      {/* Clients Section */}
      {clientLogos.length > 0 && (
        <>
          {/* Horizontal line with 200px gap from featured work */}
          <div className="w-screen h-px bg-[#e5e5e5] -ml-[2.5%] sm:ml-0 sm:w-full mt-[80px] lg:mt-[200px]" />
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

      </div>
    </>
  );
}
