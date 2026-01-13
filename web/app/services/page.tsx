import Header from "@/components/Header";
import AboutPageLayout from "@/components/AboutPageLayout";
import { client, pageDataQuery } from "@/lib/sanity";

async function getPageData() {
  try {
    const pageData = await client.fetch(pageDataQuery('services'));
    return pageData || null;
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

async function getSectionsForNav() {
  try {
    // Get only sections (not testimonials) for navigation
    const pageData = await client.fetch(pageDataQuery('services'));
    const sections = (pageData?.sections || []).filter((item: any) => item._type === 'section');
    return sections;
  } catch (error) {
    console.error('Error fetching sections for nav:', error);
    return [];
  }
}

export default async function Services() {
  const pageData = await getPageData();
  const sections = pageData?.sections || [];
  const sectionsForNav = await getSectionsForNav();
  
  return (
    <div data-about-page className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden">
      <Header currentPage="services" />

      <AboutPageLayout
        heroContent={
          <>
            {/* Title */}
            {pageData?.heroTitle && (
              <h1 className="font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] max-w-[452px]">
                {pageData.heroTitle}
              </h1>
            )}
          </>
        }
        sections={sections}
        sectionsForNav={sectionsForNav}
      />
    </div>
  );
}

