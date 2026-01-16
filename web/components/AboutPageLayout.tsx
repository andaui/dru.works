'use client';

import SectionNav from './SectionNav';
import AboutPageContent from './AboutPageContent';

interface AboutPageLayoutProps {
  heroContent: React.ReactNode;
  sections: any[];
  sectionsForNav: any[];
}

export default function AboutPageLayout({
  heroContent,
  sections,
  sectionsForNav,
}: AboutPageLayoutProps) {
  return (
    <>
      {/* Hero Section - Uses normal flow */}
      <div className="relative w-full pt-[30px] pb-[76px] lg:pt-[70px] lg:pb-0 px-[2.5%] sm:px-[24px]">
        {heroContent}
      </div>

      {/* Spacer for gap between paragraph and navigation */}
      <div className="h-0 lg:h-[160px]" />

      {/* Navigation and Content Container - Uses normal flow */}
      <div className="relative w-full">
        {/* Bottom Navigation Links */}
        {sectionsForNav.length > 0 && (
          <div className="relative pt-[43px] overflow-visible px-[2.5%] sm:px-[24px]" data-nav-container>
            <SectionNav sections={sectionsForNav} />
          </div>
        )}

        {/* Separator Line - 24px below navigation */}
        {sectionsForNav.length > 0 && (
          <div className="w-screen h-px bg-[#e5e5e5] mt-[24px] -ml-[2.5%] sm:ml-0 sm:w-full" />
        )}

        {/* Sections - Uses normal flow */}
        {sections.length > 0 && (
          <AboutPageContent sections={sections} />
        )}
      </div>
    </>
  );
}
