'use client';

import Link from "next/link";
import { useState } from "react";
import ResearchSidebar from "./ResearchSidebar";

interface NavigationPage {
  slug: string;
  title: string;
}

interface HeaderProps {
  currentPage?: "work" | "about" | "services" | "intro";
  navigationPages?: NavigationPage[];
}

export default function Header({ currentPage = "work", navigationPages = [] }: HeaderProps) {
  // Create a map of slug to title for easy lookup
  const pageTitles = navigationPages.reduce((acc, page) => {
    acc[page.slug] = page.title;
    return acc;
  }, {} as Record<string, string>);
  
  // Fallback titles if not found in Sanity
  const workTitle = pageTitles['work'] || 'Work';
  const aboutTitle = pageTitles['about'] || 'About';
  const servicesTitle = pageTitles['services'] || 'Services';
  const [isResearchSidebarOpen, setIsResearchSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex justify-start sm:justify-center items-center gap-[24px] text-[14px] leading-[35px] not-italic font-inter pt-[28px] sm:pt-[12px] pb-[24px] px-[2.5%] sm:px-0 relative">
        {/* Navigation - Visible on all screen sizes */}
        <div className="flex items-center gap-[24px]">
          <Link href="/" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "work" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
            {workTitle}
          </Link>
          <Link href="/about" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "about" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
            {aboutTitle}
          </Link>
          <Link href="/services" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "services" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
            {servicesTitle}
          </Link>
          {/* Research - Hidden on mobile, visible on tablet and up */}
          <button
            onClick={() => setIsResearchSidebarOpen(true)}
            className={`hidden md:block relative shrink-0 z-50 pointer-events-auto cursor-pointer bg-transparent border-none p-0 font-inherit transition-opacity ${currentPage === "intro" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}
          >
            Research
          </button>
        </div>

        {/* Contact Link - Visible on all screen sizes */}
        <Link 
          href="/contact" 
          className="absolute right-[2.5%] sm:right-[22px] shrink-0 z-50 pointer-events-auto text-black opacity-100"
        >
          Contact
        </Link>
      </nav>

      <ResearchSidebar
        isOpen={isResearchSidebarOpen}
        onClose={() => setIsResearchSidebarOpen(false)}
      />
    </>
  );
}

