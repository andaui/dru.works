import Header from "@/components/Header";
import WorkFeatureCard from "@/components/WorkFeatureCard";
import { client, featuredWorkQuery, urlFor } from "@/lib/sanity";

async function getFeaturedWork() {
  try {
    const workItems = await client.fetch(featuredWorkQuery);
    return workItems || [];
  } catch (error) {
    console.error('Error fetching featured work:', error);
    return [];
  }
}

export default async function Home() {
  // Fetch featured work from Sanity
  const workItems = await getFeaturedWork();

  // Calculate approximate height needed: 758px (start) + (cards * 623px) + (gaps * 106px)
  const estimatedHeight = workItems.length > 0 
    ? 758 + (workItems.length * 623) + ((workItems.length - 1) * 106)
    : 1000;
  
  return (
    <div className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden" style={{ minHeight: `${Math.max(estimatedHeight, 1000)}px` }}>
      <Header />

      {/* Pricing Section - Left Side */}
      <div className="absolute left-[1.25%] lg:left-[24px] top-[588px] flex items-start gap-[22px]">
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

      {/* Separator Line */}
      <div className="absolute left-0 right-0 top-[688px] h-px bg-[#e5e5e5]" />

      {/* Hero Section */}
      <div className="absolute left-1/2 top-[266px] -translate-x-1/2 flex w-[90%] max-w-[475px] flex-col items-center gap-[19px]">
        <div className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-black text-center tracking-[-0.25px]">
          <p className="mb-0">Design partner </p>
          <p>with technical skills</p>
        </div>
        <div className="flex w-full max-w-[459px] flex-col items-center gap-[13px]">
          <div className="flex items-center justify-center w-full">
            <p className="relative shrink-0 font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-center">
              Andrew didn't just deliver designs—he helped us build from the ground up.
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="relative shrink-0 size-[21px]">
              <div className="size-full rounded-full bg-gray-300" />
            </div>
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap">
              Egor, Co Founder of Jamie
            </p>
          </div>
        </div>
      </div>

      {/* Work Feature Cards Section */}
      <div className="absolute left-[1.25%] lg:left-[24px] right-[1.25%] lg:right-0 top-[758px] flex flex-col items-start gap-[106px]">
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

      {/* CTA Button */}
      <div className="absolute right-[1.25%] lg:right-[24px] top-[648px] flex items-center justify-center gap-[2px]">
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
  );
}
