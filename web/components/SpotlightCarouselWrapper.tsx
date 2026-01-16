"use client";

import { useEffect, useState } from "react";
import SpotlightCarousel from "./SpotlightCarousel";

interface MediaData {
  url: string;
  alt: string;
  text?: string;
  type: 'image' | 'video';
}

interface SpotlightCarouselWrapperProps {
  items: MediaData[];
}

export default function SpotlightCarouselWrapper({ items }: SpotlightCarouselWrapperProps) {
  // Default to true (mobile) for SSR safety - prevents hydration mismatch
  const [isMobile, setIsMobile] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted immediately
    setHasMounted(true);
    
    // Check if we're on mobile - only render on desktop
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                            window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileDevice);
    };

    // Check immediately (synchronously if possible)
    if (typeof window !== 'undefined') {
      checkMobile();
    }

    // Also check on resize (but throttle it)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Don't render anything during SSR or on mobile - completely skip mounting
  // This prevents any background processing on mobile
  if (!hasMounted || isMobile || items.length === 0) {
    return null;
  }

  return <SpotlightCarousel items={items} />;
}

