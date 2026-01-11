import Header from "@/components/Header";
import Section from "@/components/Section";
import { client, sectionsQuery } from "@/lib/sanity";

async function getSections() {
  try {
    const sections = await client.fetch(sectionsQuery);
    return sections || [];
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

export default async function About() {
  const sections = await getSections();
  return (
    <div className="relative w-full bg-[#fcfcfc] min-h-screen overflow-x-hidden">
      <Header currentPage="about" />

      {/* Title */}
      <h1 className="absolute left-[24px] top-[127px] font-medium text-[40px] leading-[47px] not-italic text-black tracking-[-0.25px] w-[356px] max-w-[calc(100%-48px)]">
        My approach to building products
      </h1>

      {/* Content Text */}
      <div className="absolute left-[24px] top-[256px] font-normal text-[16px] leading-[23px] not-italic text-black w-[788px] max-w-[calc(100%-48px)]">
        <p className="mb-0">
          I work as a design partner for product teams, focusing on visual design and building high quality interfaces. I care deeply about craft, clarity, and the details that make products feel considered and reliable.
        </p>
        <p className="mb-0">&nbsp;</p>
        <p>
          I often collaborate with other designers and engineers depending on the needs of the project, and have worked with teams at [Google, Revolut, BlackRock, Intercom, Bumble and others]
        </p>
      </div>

      {/* Separator Line */}
      <div className="absolute left-0 right-0 top-[598px] h-px bg-[#e5e5e5]" />

      {/* Bottom Navigation Links */}
      <div className="absolute left-[24px] top-[555px] flex items-center gap-[16px] font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-nowrap">
        <p className="relative shrink-0">Focus and experience</p>
        <p className="relative shrink-0">Clients</p>
        <p className="relative shrink-0">How I work</p>
        <p className="relative shrink-0">Team Design Sessions</p>
        <p className="relative shrink-0">Side projects</p>
      </div>

      {/* Sections */}
      {sections.length > 0 && (
        <div className="absolute left-0 top-[648px] w-full flex flex-col gap-[24px] items-start">
          {sections.map((section: any, index: number) => (
            <Section
              key={section._id || index}
              sectionTitle={section.sectionTitle}
              blocks={section.blocks || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

