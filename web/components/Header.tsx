'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [emailCopied, setEmailCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleContactClick = async () => {
    try {
      await navigator.clipboard.writeText('carterandrew93@gmail.com');
      setEmailCopied(true);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

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

        {/* Contact - Visible on all screen sizes */}
        <div className="absolute right-[2.5%] sm:right-[22px] flex items-center gap-[24px] z-50 pointer-events-auto">
          {!isMounted ? (
            <button
              className="text-black opacity-100 bg-transparent border-none p-0 font-inherit cursor-pointer"
              disabled
            >
              Contact
            </button>
          ) : isMobile ? (
            // Mobile: just open mail directly
            <a 
              href="mailto:carterandrew93@gmail.com" 
              className="text-black opacity-100"
            >
              Contact
            </a>
          ) : emailCopied ? (
            // Desktop: show transitions
            <>
              <span className="text-black opacity-40">Email copied</span>
              <a 
                href="mailto:carterandrew93@gmail.com" 
                className="text-black opacity-100"
              >
                Open mail
              </a>
            </>
          ) : (
            <button
              onClick={handleContactClick}
              className="text-black opacity-100 bg-transparent border-none p-0 font-inherit cursor-pointer"
            >
              Contact
            </button>
          )}
        </div>
      </nav>

      <ResearchSidebar
        isOpen={isResearchSidebarOpen}
        onClose={() => setIsResearchSidebarOpen(false)}
      />
    </>
  );
}

