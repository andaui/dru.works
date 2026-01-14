'use client';

import * as React from 'react';
import Link from 'next/link';

interface ResearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResearchSidebar({ isOpen, onClose }: ResearchSidebarProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  // Handle mount/unmount with animation
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(false);
      // Use double requestAnimationFrame to ensure browser paints initial state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop - click outside to close */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar - 417px width, black background, 100vh height with proportional scaling */}
      <div
        className={`fixed top-0 right-0 bg-black z-[9999] flex flex-col items-center transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '417px', height: '100vh' }}
      >
        {/* Video at the top - aspect ratio 2466/1720, scales with viewport */}
        <div className="w-full relative flex-shrink-0" style={{ aspectRatio: '2466/1720' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            controlsList="nodownload"
          >
            <source src="/research-preview.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Content area - flex to fill remaining space, ensures View is always visible */}
        <div className="flex flex-col items-start shrink-0 w-[363px] flex-1 min-h-0 pr-[27px] justify-between" style={{ paddingTop: '44px' }}>
          {/* Text section - 22px gap between heading and paragraph */}
          <div className="flex flex-col items-start gap-[22px] w-full">
            {/* Heading - 30px font size */}
            <p className="font-inter font-normal leading-[35px] text-[30px] text-[#d8d8d8] w-full whitespace-pre-wrap">
              A dedicated space to showcase explorations within art, design, and technology.
            </p>
            
            {/* Paragraph */}
            <p className="font-inter font-normal leading-[23px] text-[16px] text-[#d8d8d8] w-full whitespace-pre-wrap">
              The work is approached with lack of constraint in mind, with an opportunity to learn new skills techniques, and methods of thinking.
            </p>
          </div>

          {/* View link with arrow - 4px gap, 24px text, #d7d7d7 color, underlined - always at bottom */}
          <div className="flex flex-col items-start flex-shrink-0" style={{ marginBottom: '12.62vh' }}>
            <Link href="/infinite-canvas" className="flex gap-[4px] items-center">
              <p className="font-inter font-normal leading-[35px] text-[24px] text-[#d7d7d7] underline whitespace-pre">
                View
              </p>
              {/* Arrow icon - 22x22px, upward-right arrow */}
              <div className="relative shrink-0" style={{ width: '22px', height: '22px' }}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 16.5L16.5 5.5M16.5 5.5H5.5M16.5 5.5V16.5"
                    stroke="#d7d7d7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
            
            {/* "or close" text - 6px gap below View, #FCFCFC 50% opacity, 70% on hover, clickable */}
            <button
              onClick={onClose}
              className="font-inter font-normal leading-[35px] text-[16px] text-[#fcfcfc] mt-[6px] cursor-pointer transition-opacity opacity-50 hover:opacity-70"
            >
              or close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

