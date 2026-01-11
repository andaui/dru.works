import Header from "@/components/Header";
import SectionNav from "@/components/SectionNav";
import AboutPageContent from "@/components/AboutPageContent";
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

      {/* Title */}
      <h1 className="absolute left-[24px] top-[127px] font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] max-w-[452px]">
        Products, Websites, Team design sessions, AI Expertise
      </h1>

      {/* Separator Line */}
      <div className="absolute left-0 right-0 top-[598px] h-px bg-[#e5e5e5]" />

      {/* Bottom Navigation Links */}
      {sectionsForNav.length > 0 && <SectionNav sections={sectionsForNav} />}

      {/* Sections */}
      {sections.length > 0 && <AboutPageContent sections={sections} />}
    </div>
  );
}

