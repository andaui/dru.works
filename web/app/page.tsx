import Header from "@/components/Header";
import WorkFeatureCard from "@/components/WorkFeatureCard";
import HeroTestimonial from "@/components/HeroTestimonial";
import SpotlightCarousel from "@/components/SpotlightCarousel";
import { client, featuredWorkQuery, heroTestimonialsQuery, spotlightQuery, urlFor } from "@/lib/sanity";

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

export default async function Home() {
  // Fetch featured work, testimonials, and spotlight items from Sanity
  const workItems = await getFeaturedWork();
  const rawTestimonials = await getHeroTestimonials();
  const rawSpotlightItems = await getSpotlightItems();
  
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
          .height(1200) // High resolution for quality
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

  // Calculate approximate height needed: 758px (start) + 500px (carousel space) + (cards * 623px) + (gaps * 106px) + 200px bottom spacing
  const carouselHeight = 500; // Space for carousel
  const estimatedHeight = workItems.length > 0 
    ? 758 + carouselHeight + (workItems.length * 623) + ((workItems.length - 1) * 106) + 200
    : 1000 + carouselHeight + 200;
  
  return (
    <div className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden pb-[200px]" style={{ minHeight: `${Math.max(estimatedHeight, 1000)}px` }}>
      <Header currentPage="work" />


      {/* Hero Section */}
      <div className="w-full flex justify-center pt-[266px] pb-[156px]">
        <div className="flex w-[90%] max-w-[700px] flex-col items-center gap-[22px]">
          <div className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-black text-center tracking-[-0.25px]">
            <p className="mb-0">Design partner </p>
            <p>with technical skills</p>
          </div>
          <HeroTestimonial
            testimonials={processedTestimonials}
          />
        </div>
      </div>

      {/* Content Section - Normal Flow */}
      <div className="w-full">
        {/* Pricing and CTA Section - 22px above line */}
        <div className="w-full flex justify-between items-end px-[1.25%] lg:px-[24px] mb-[22px]">
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
          <div className="flex items-center justify-center gap-[2px]">
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap">
              Interested in Team Design Sessions?
            </p>
            <div className="relative shrink-0 size-[14px]">
              <svg className="block size-full max-w-none" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 3L9 7L5 11"
                  stroke="#989898"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-[#e5e5e5]" />

        {/* Spotlight Carousel */}
        {processedSpotlightItems.length > 0 && (
          <SpotlightCarousel items={processedSpotlightItems} />
        )}

        {/* Second Separator Line - 98px below carousel */}
        <div className="w-full h-px bg-[#e5e5e5]" style={{ marginTop: '98px' }} />

        {/* Work Heading - 12px below line */}
        <div
          className="text-left"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            lineHeight: '20px',
            marginTop: '12px',
            marginLeft: '24px',
            marginBottom: '104px',
          }}
        >
          Work
        </div>
      </div>

      {/* Work Feature Cards Section */}
      <div className="w-full px-[1.25%] lg:px-[24px] flex flex-col items-start gap-[106px]">
        {workItems.length > 0 ? (
          workItems.map((item: any, index: number) => {
            // Process all images from Sanity
            const processedImages: Array<{ url: string; alt: string }> = [];
            
            if (item.images && Array.isArray(item.images)) {
              item.images.forEach((image: any) => {
                // Only process image types (skip videos for now)
                if (image._type === 'image' && image.asset) {
                  try {
                    // Request higher resolution (2x for retina displays) and high quality
                    const imageUrl = urlFor(image)
                      .width(1692) // 2x the display width (846 * 2) for retina
                      .height(1246) // 2x the display height (623 * 2) for retina
                      .fit('crop')
                      .quality(90) // High quality (0-100, default is usually 75)
                      .format('jpg') // Use JPEG for better compression
                      .url();
                    const imageAlt = image.alt || item.projectTitle || 'Project image';
                    processedImages.push({ url: imageUrl, alt: imageAlt });
                  } catch (error) {
                    console.error('Error building image URL:', error);
                    // Fallback to direct asset URL if URL builder fails
                    if (image.asset?.url) {
                      processedImages.push({
                        url: image.asset.url,
                        alt: image.alt || item.projectTitle || 'Project image',
                      });
                    }
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

    </div>
  );
}
