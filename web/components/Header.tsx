'use client';

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavigationPage {
  slug: string;
  title: string;
}

interface HeaderProps {
  currentPage?: "work" | "about" | "services";
  navigationPages?: NavigationPage[];
}

export default function Header({ currentPage, navigationPages = [] }: HeaderProps) {
  // Create a map of slug to title for easy lookup
  const pageTitles = navigationPages.reduce((acc, page) => {
    acc[page.slug] = page.title;
    return acc;
  }, {} as Record<string, string>);
  
  // Fallback titles if not found in Sanity
  const workTitle = pageTitles['work'] || 'Work';
  const aboutTitle = pageTitles['about'] || 'About';
  const servicesTitle = pageTitles['services'] || 'Services';
  const [emailCopied, setEmailCopied] = useState(false);

  const showHome = currentPage != null;
  
  const handleContactClick = async () => {
    try {
      await navigator.clipboard.writeText('carterandrew93@gmail.com');
      setEmailCopied(true);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <nav className="w-full flex justify-start sm:justify-center items-center gap-[24px] text-[14px] leading-[35px] not-italic font-inter pt-[28px] sm:pt-[12px] pb-[24px] px-[2.5%] sm:px-0 relative">
        {/* Home - far left (hidden on mobile) */}
        {showHome && (
          <div className="absolute left-[2.5%] sm:left-[22px] z-50 pointer-events-auto hidden md:block">
            <Link
              href="/"
              className="relative shrink-0 z-50 pointer-events-auto transition-opacity text-foreground opacity-40 hover:opacity-70 text-[14px] leading-[35px] font-inter"
            >
              Home
            </Link>
          </div>
        )}
        <div className="flex items-center gap-[24px]">
          <Link href="/work" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "work" ? "text-foreground opacity-100" : "text-foreground opacity-40 hover:opacity-70"}`}>
            {workTitle}
          </Link>
          <Link href="/about" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "about" ? "text-foreground opacity-100" : "text-foreground opacity-40 hover:opacity-70"}`}>
            {aboutTitle}
          </Link>
          <Link href="/services" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "services" ? "text-foreground opacity-100" : "text-foreground opacity-40 hover:opacity-70"}`}>
            {servicesTitle}
          </Link>
        </div>

        {/* Contact - Visible on all screen sizes */}
        <div className="absolute right-[2.5%] sm:right-[22px] flex items-center gap-[24px] z-50 pointer-events-auto">
          <ThemeToggle />
          {/* Always render the same structure to avoid hydration mismatch */}
          {/* Email copied state - only show on desktop after email copied */}
          <span className={`text-foreground opacity-40 ${emailCopied ? 'hidden md:block' : 'hidden'}`}>
            Email copied
          </span>
          <a 
            href="mailto:carterandrew93@gmail.com" 
            className={`text-foreground opacity-100 ${emailCopied ? 'hidden md:block' : 'hidden'}`}
          >
            Open mail
          </a>
          {/* Button for desktop - hidden on mobile via CSS, hidden when email copied */}
          <button
            onClick={handleContactClick}
            className={`text-foreground opacity-100 bg-transparent border-none p-0 font-inherit cursor-pointer ${emailCopied ? 'hidden' : 'hidden md:block'}`}
          >
            Contact
          </button>
          {/* Link for mobile - only visible on mobile via CSS */}
          <a 
            href="mailto:carterandrew93@gmail.com" 
            className={`text-foreground opacity-100 ${emailCopied ? 'hidden' : 'block md:hidden'}`}
          >
            Contact
          </a>
        </div>
    </nav>
  );
}

