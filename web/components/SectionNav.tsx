'use client';

interface SectionNavProps {
  sections: Array<{ _id: string; sectionTitle: string }>;
}

export default function SectionNav({ sections }: SectionNavProps) {
  const scrollToSection = (sectionId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Small delay to ensure page height is calculated
    setTimeout(() => {
      const sectionElement = document.getElementById(sectionId);
      if (!sectionElement) {
        console.error(`Section with id "${sectionId}" not found`);
        return;
      }

      // Find the grey header strip (the first child div)
      const headerStrip = sectionElement.firstElementChild as HTMLElement;
      if (!headerStrip) {
        return;
      }

      // Use scrollIntoView to scroll the header strip to the top
      headerStrip.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  };

  return (
    <div className="absolute left-[24px] top-[555px] flex items-center gap-[16px] font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-nowrap">
      {sections.map((section) => {
        const sectionId = section._id || `section-${section.sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <button
            key={section._id}
            onClick={(e) => scrollToSection(sectionId, e)}
            className="relative shrink-0 cursor-pointer hover:text-black transition-colors"
            type="button"
          >
            {section.sectionTitle}
          </button>
        );
      })}
    </div>
  );
}

