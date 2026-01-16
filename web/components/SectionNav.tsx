'use client';

import { useEffect, useRef } from 'react';

interface SectionNavProps {
  sections: Array<{ _id: string; sectionTitle: string }>;
}

export default function SectionNav({ sections }: SectionNavProps) {
  const gradientRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const updateGradientPosition = () => {
      if (gradientRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        gradientRef.current.style.top = `${containerRect.top}px`;
        gradientRef.current.style.height = `${containerRect.height}px`;
      }
    };

    updateGradientPosition();
    window.addEventListener('scroll', updateGradientPosition);
    window.addEventListener('resize', updateGradientPosition);

    return () => {
      window.removeEventListener('scroll', updateGradientPosition);
      window.removeEventListener('resize', updateGradientPosition);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      {/* Scrollable container that extends beyond window */}
      <div className="flex items-center gap-[16px] font-normal text-[13px] leading-[19px] not-italic text-[#989898] overflow-x-auto scrollbar-hide pl-[2.5%] sm:pl-[24px] pr-[54px] -mx-[2.5%] sm:-mx-[24px]">
        {sections.map((section) => {
          const sectionId = section._id || `section-${section.sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
          return (
            <button
              key={section._id}
              onClick={(e) => scrollToSection(sectionId, e)}
              className="relative shrink-0 cursor-pointer hover:text-black transition-colors whitespace-nowrap"
              type="button"
            >
              {section.sectionTitle}
            </button>
          );
        })}
      </div>
      {/* Fade gradient positioned at window edge */}
      <div 
        ref={gradientRef}
        className="fixed w-[40px] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to left, #fcfcfc 0%, rgba(252, 252, 252, 0.8) 40%, rgba(252, 252, 252, 0.4) 70%, transparent 100%)',
          right: '0px',
        }}
      />
    </div>
  );
}

