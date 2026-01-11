import Header from "@/components/Header";
import AboutPageLayout from "@/components/AboutPageLayout";
import { client, pageSectionsQuery } from "@/lib/sanity";

async function getSections() {
  try {
    // Sections and testimonials are already returned in the correct order from the query
    const items = await client.fetch(pageSectionsQuery('about'));
    return items || [];
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

async function getSectionsForNav() {
  try {
    // Get only sections (not testimonials) for navigation
    const items = await client.fetch(pageSectionsQuery('about'));
    const sections = (items || []).filter((item: any) => item._type === 'section');
    return sections;
  } catch (error) {
    console.error('Error fetching sections for nav:', error);
    return [];
  }
}

export default async function About() {
  const sections = await getSections();
  const sectionsForNav = await getSectionsForNav();
  return (
    <div data-about-page className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden">
      <Header currentPage="about" />

      <AboutPageLayout
        heroContent={
          <>
            {/* Title */}
            <h1 className="font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] w-[356px] max-w-[calc(100%-48px)] mb-[34px]">
              My approach to building products
            </h1>

            {/* Content Text */}
            <div className="font-normal text-[16px] leading-[23px] not-italic text-black w-[788px] max-w-[calc(100%-48px)]">
              <p className="mb-0">
                I work as a design partner for product teams, focusing on visual design and building high quality interfaces. I care deeply about craft, clarity, and the details that make products feel considered and reliable.
              </p>
              <p className="mb-0">&nbsp;</p>
              <p>
                I often collaborate with other designers and engineers depending on the needs of the project, and have worked with teams at [Google, Revolut, BlackRock, Intercom, Bumble and others]
              </p>
            </div>
          </>
        }
        sections={sections}
        sectionsForNav={sectionsForNav}
      />
    </div>
  );
}

