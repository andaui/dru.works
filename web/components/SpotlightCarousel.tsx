"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface ImageData {
  url: string;
  alt: string;
}

interface SpotlightCarouselProps {
  images: ImageData[];
}

export default function SpotlightCarousel({ images }: SpotlightCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lockedScrollYRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);
  const scrollDistanceRef = useRef<number>(800);

  useEffect(() => {
    if (!containerRef.current || !scrollContainerRef.current || images.length === 0) return;

    const container = containerRef.current;
    const scrollContainer = scrollContainerRef.current;

    const calculateScrollableWidth = () => {
      const totalWidth = scrollContainer.scrollWidth;
      const viewportWidth = container.clientWidth;
      return Math.max(0, totalWidth - viewportWidth);
    };

    const updateCarouselPosition = (progress: number) => {
      const scrollableWidth = calculateScrollableWidth();
      const translateX = progress * scrollableWidth;
      scrollContainer.style.transform = `translateX(-${translateX}px)`;
      progressRef.current = progress;
    };

    // Initialize
    progressRef.current = 0;
    updateCarouselPosition(0);
    const scrollableWidth = calculateScrollableWidth();
    scrollDistanceRef.current = Math.max(scrollableWidth, 800);

    const handleWheel = (e: WheelEvent) => {
      // CRITICAL: Lock IMMEDIATELY if active, before ANY other processing
      // This prevents fast scrolls from bypassing the lock
      if (isActiveRef.current && lockedScrollYRef.current > 0) {
        // Check boundaries first (before locking)
        const isAtStart = progressRef.current <= 0;
        const isAtEnd = progressRef.current >= 1;
        const isAtBoundary = (isAtStart && e.deltaY < 0) || (isAtEnd && e.deltaY > 0);
        
        // If at boundary, deactivate and allow normal scroll
        if (isAtBoundary) {
          isActiveRef.current = false;
          lockedScrollYRef.current = 0;
          return; // Allow normal scroll
        }
        
        // Lock immediately and prevent default BEFORE any other processing
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        e.preventDefault();
        e.stopPropagation();
      }

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.08;
      
      // Check if carousel is at the trigger point (within 50px tolerance)
      const distanceFromTrigger = rect.top - triggerPoint;
      const isAtTriggerPoint = Math.abs(distanceFromTrigger) <= 50 && rect.bottom > 0;
      const isWithinActiveZone = Math.abs(distanceFromTrigger) <= 50 && rect.bottom > 0;

      // Check boundaries for activation check
      const isAtStart = progressRef.current <= 0;
      const isAtEnd = progressRef.current >= 1;
      const isAtBoundary = (isAtStart && e.deltaY < 0) || (isAtEnd && e.deltaY > 0);

      if (!isActiveRef.current) {
        // Only activate when carousel reaches the trigger point
        if (isAtTriggerPoint) {
          isActiveRef.current = true;
          lockedScrollYRef.current = window.scrollY;
          // Lock immediately upon activation
          window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          e.preventDefault();
          e.stopPropagation();
        } else {
          return;
        }
      } else {
        // If active, deactivate if carousel moves too far from trigger zone
        if (!isWithinActiveZone) {
          isActiveRef.current = false;
          lockedScrollYRef.current = 0;
          return;
        }
      }

      // Control carousel (we're already locked and prevented default above if active)
      if (isActiveRef.current && !isAtBoundary) {
        const progressDelta = e.deltaY / scrollDistanceRef.current;
        let newProgress = progressRef.current + progressDelta;
        newProgress = Math.max(0, Math.min(1, newProgress));

        progressRef.current = newProgress;
        updateCarouselPosition(newProgress);

        // Lock again after updating (redundant but ensures lock)
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
      }
    };

    // Handle scroll events for fast scrolling - zero tolerance
    const handleScroll = () => {
      if (!isActiveRef.current || lockedScrollYRef.current === 0) return;
      
      // Check if at boundary - if so, don't lock (allow scroll)
      const isAtStart = progressRef.current <= 0;
      const isAtEnd = progressRef.current >= 1;
      if (isAtStart || isAtEnd) {
        // At boundary, don't lock - allow normal scroll
        return;
      }
      
      // Immediately lock - no drift check, just lock
      window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
    };

    // Continuous scroll lock - runs every frame, locks aggressively
    let rafId: number;
    const lockScroll = () => {
      if (isActiveRef.current && lockedScrollYRef.current > 0) {
        // Only lock if not at boundaries (boundary handling is done in wheel handler)
        const isAtStart = progressRef.current <= 0;
        const isAtEnd = progressRef.current >= 1;
        if (!isAtStart && !isAtEnd) {
          // Lock every frame without checking - maximum aggression
          window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          
          // Double-lock using microtask for fast scrolls
          Promise.resolve().then(() => {
            if (isActiveRef.current && lockedScrollYRef.current > 0) {
              const isAtStart = progressRef.current <= 0;
              const isAtEnd = progressRef.current >= 1;
              if (!isAtStart && !isAtEnd) {
                window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
              }
            }
          });
        }
      }
      rafId = requestAnimationFrame(lockScroll);
    };

    lockScroll();
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    // Scroll handler as backup - passive for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      const scrollableWidth = calculateScrollableWidth();
      scrollDistanceRef.current = Math.max(scrollableWidth, 800);
      updateCarouselPosition(progressRef.current);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className="text-left"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          lineHeight: '20px',
          marginTop: '52px',
          marginBottom: '28px',
          marginLeft: '24px',
        }}
      >
        Spotlight
      </div>
      <div 
        ref={containerRef}
        className="w-full overflow-hidden"
        style={{ 
          minHeight: '582px',
        }}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-8"
          style={{
            paddingLeft: '40%',
            transition: 'none',
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative shrink-0 flex items-center h-[582px] max-md:h-[400px] max-lg:h-[500px]"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="object-contain h-full w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
