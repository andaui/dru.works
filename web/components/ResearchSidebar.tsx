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
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isOverSidebar, setIsOverSidebar] = React.useState(false);
  const [hasBeenOverSidebar, setHasBeenOverSidebar] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const hasBeenOverSidebarRef = React.useRef(false);

  // Handle mount/unmount with animation
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(false);
      setHasBeenOverSidebar(false); // Reset when sidebar opens
      hasBeenOverSidebarRef.current = false; // Reset ref
      // Use double requestAnimationFrame to ensure browser paints initial state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      setHasBeenOverSidebar(false); // Reset when sidebar closes
      hasBeenOverSidebarRef.current = false; // Reset ref
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

  // Track mouse position and check if over sidebar
  React.useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is over sidebar
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        const isOver = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        setIsOverSidebar(isOver);
        // Track if user has been over sidebar at least once
        if (isOver && !hasBeenOverSidebarRef.current) {
          hasBeenOverSidebarRef.current = true;
          setHasBeenOverSidebar(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  // Always render the same structure to avoid hydration mismatch
  return (
    <>
      {/* Backdrop - click outside to close */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          shouldRender && isAnimating ? 'opacity-100' : 'opacity-0'
        } ${shouldRender ? 'pointer-events-auto' : 'pointer-events-none'} ${shouldRender ? '' : 'hidden'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Cursor text - "Click to close" following cursor when outside sidebar */}
      {isOpen && !isOverSidebar && isAnimating && hasBeenOverSidebar && shouldRender && (
        <div
          className="fixed pointer-events-none z-[10000] font-inter text-[14px] leading-[35px] not-italic whitespace-nowrap"
          style={{
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
            transform: 'translate(0, 0)',
            color: '#979797',
          }}
        >
          Click to close
        </div>
      )}
      
      {/* Sidebar - scales with viewport height, black background, 100vh height */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 bg-black z-[9999] flex flex-col items-center transition-transform duration-300 ease-in-out ${
          shouldRender && isAnimating ? 'translate-x-0' : 'translate-x-full'
        } ${shouldRender ? '' : 'hidden'}`}
        style={{ 
          width: 'calc(573px * (100vh / 1080px))',
          minWidth: '320px',
          maxWidth: '573px',
          height: '100vh'
        }}
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

        {/* Content area - flex to fill remaining space */}
        <div className="flex flex-col items-start shrink-0 flex-1 min-h-0 pl-[28px] pr-[54px] pt-[38px] pb-0 w-full">
          <div className="flex flex-col items-start gap-[30px] w-full">
            {/* Text section - 20px gap between heading and paragraph */}
            <div className="flex flex-col items-start gap-[20px] w-full">
              {/* Heading - 28px font size, leading 33px, font-light, opacity-90 */}
              <p className="font-inter font-light leading-[33px] text-[28px] text-[#fcfcfc] opacity-90 w-full whitespace-pre-wrap">
                A dedicated space showcasing explorations within art, design, and technology.
              </p>
              
              {/* Paragraph - 16px font size, leading 23px, opacity-80 */}
              <p className="font-inter font-light leading-[23px] text-[16px] text-[#fcfcfc] opacity-80 w-full whitespace-pre-wrap">
                This work is approached with lack of constraint in mind, with an opportunity to learn new skills techniques, and methods of thinking and showing some of the clients work.
              </p>
            </div>

            {/* Button section */}
            <div className="flex flex-col items-start w-full">
              <Link 
                href="/infinite-canvas" 
                className="bg-[#3b3b3b] flex gap-[4px] items-center px-[14px] py-[10px] rounded-[8px] transition-opacity hover:opacity-90" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <p className="font-inter font-normal leading-[35px] text-[16px] text-[#d7d7d7] whitespace-pre">
                  Go to research
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

