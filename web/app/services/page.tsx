import Header from "@/components/Header";
import AboutPageLayout from "@/components/AboutPageLayout";
import { client, pageSectionsQuery } from "@/lib/sanity";

async function getSections() {
  try {
    // Sections and testimonials are already returned in the correct order from the query
    const items = await client.fetch(pageSectionsQuery('services'));
    return items || [];
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

async function getSectionsForNav() {
  try {
    // Get only sections (not testimonials) for navigation
    const items = await client.fetch(pageSectionsQuery('services'));
    const sections = (items || []).filter((item: any) => item._type === 'section');
    return sections;
  } catch (error) {
    console.error('Error fetching sections for nav:', error);
    return [];
  }
}

export default async function Services() {
  const sections = await getSections();
  const sectionsForNav = await getSectionsForNav();
  return (
    <div data-about-page className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden">
      <Header currentPage="services" />

      <AboutPageLayout
        heroContent={
          <>
            {/* Title */}
            <h1 className="font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] max-w-[452px]">
              Products, Websites, Team design sessions, AI Expertise
            </h1>
          </>
        }
        sections={sections}
        sectionsForNav={sectionsForNav}
      />
    </div>
  );
}

