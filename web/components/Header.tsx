'use client';

import Link from "next/link";
import { useState } from "react";
import ResearchSidebar from "./ResearchSidebar";

interface HeaderProps {
  currentPage?: "work" | "about" | "services" | "intro";
}

export default function Header({ currentPage = "work" }: HeaderProps) {
  const [isResearchSidebarOpen, setIsResearchSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex justify-start md:justify-center items-center gap-[24px] text-[14px] leading-[35px] not-italic font-inter pt-[12px] pb-[24px] px-[2.5%] lg:px-0 relative">
        <Link href="/" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "work" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
          Work
        </Link>
        <Link href="/about" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "about" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
          About
        </Link>
        <Link href="/services" className={`relative shrink-0 z-50 pointer-events-auto transition-opacity ${currentPage === "services" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}>
          Services & Sessions
        </Link>
        <button
          onClick={() => setIsResearchSidebarOpen(true)}
          className={`relative shrink-0 z-50 pointer-events-auto cursor-pointer bg-transparent border-none p-0 font-inherit transition-opacity ${currentPage === "intro" ? "text-black opacity-100" : "text-black opacity-40 hover:opacity-70"}`}
        >
          Research
        </button>
        <Link 
          href="/contact" 
          className="absolute right-[22px] shrink-0 z-50 pointer-events-auto text-black opacity-100"
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

