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
      
      {/* Sidebar - 573px width, black background, 100vh height with proportional scaling */}
      <div
        className={`fixed top-0 right-0 bg-black z-[9999] flex flex-col items-center transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '573px', height: '100vh' }}
      >
        {/* Close button - 11px from top, 9px from right */}
        <button
          onClick={onClose}
          className="absolute z-10 cursor-pointer transition-opacity hover:opacity-70"
          style={{ top: '11px', right: '9px' }}
          aria-label="Close sidebar"
        >
          <img src="/close-icon.svg" alt="Close" className="block" />
        </button>

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
        <div className="flex flex-col items-start shrink-0 flex-1 min-h-0 pl-[24px] pr-[54px] w-full" style={{ paddingTop: '44px', paddingBottom: '30px' }}>
          {/* View link with arrow - 4px gap, 24px text, #d7d7d7 color, underlined - at top */}
          <div className="flex flex-col items-start gap-[40px] w-full">
            <Link href="/infinite-canvas" className="flex gap-[4px] items-center" target="_blank" rel="noopener noreferrer">
              <p className="font-inter font-normal leading-[35px] text-[24px] text-[#d7d7d7] underline whitespace-pre" style={{ textUnderlineOffset: '8px' }}>
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

            {/* Text section - 20px gap between heading and paragraph */}
            <div className="flex flex-col items-start gap-[20px] w-full">
              {/* Heading - 30px font size, leading 33px */}
              <p className="font-inter font-normal leading-[33px] text-[30px] text-[#fcfcfc] w-full whitespace-pre-wrap">
                A dedicated space showcasing explorations within art, design, and technology.
              </p>
              
              {/* Paragraph */}
              <p className="font-inter font-normal leading-[23px] text-[16px] text-[#fcfcfc] w-full whitespace-pre-wrap">
                This work is approached with lack of constraint in mind, with an opportunity to learn new skills techniques, and methods of thinking and showing some of the clients work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

