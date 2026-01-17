import Header from "@/components/Header";
import AboutPageLayout from "@/components/AboutPageLayout";
import { client, pageDataQuery, navigationPagesQuery } from "@/lib/sanity";

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

async function getNavigationPages() {
  try {
    const pages = await client.fetch(navigationPagesQuery);
    return pages || [];
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    return [];
  }
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Services() {
  const navigationPages = await getNavigationPages();
  const pageData = await getPageData();
  const sections = pageData?.sections || [];
  const sectionsForNav = await getSectionsForNav();
  
  return (
    <div data-about-page className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden px-[2.5%] sm:px-0">
      <Header currentPage="services" navigationPages={navigationPages} />

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

