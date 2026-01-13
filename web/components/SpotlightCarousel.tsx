"use client";

import { useEffect, useRef } from "react";

interface MediaData {
  url: string;
  alt: string;
  text?: string;
  type: 'image' | 'video';
}

interface SpotlightCarouselProps {
  items: MediaData[];
}

export default function SpotlightCarousel({ items }: SpotlightCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lockedScrollYRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);
  const triggerPointRef = useRef<number>(0);
  const justUnlockedRef = useRef<boolean>(false);
  const scrollDistanceRef = useRef<number>(1000);
  const isScrollableRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !scrollContainerRef.current || items.length === 0) return;

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
    
    // Check if carousel is scrollable (has content that extends beyond viewport)
    const checkIfScrollable = () => {
      const scrollableWidth = calculateScrollableWidth();
      // Only consider scrollable if there's at least 10px of scrollable content
      isScrollableRef.current = scrollableWidth > 10;
    };
    
    checkIfScrollable();
    
    // Reduce multiplier from 2 to 1.2 for faster scrolling
    scrollDistanceRef.current = Math.max(calculateScrollableWidth() * 1.4, 1000);

    // Set spacer width to 10% of container width
    const updateSpacerWidth = () => {
      if (spacerRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        spacerRef.current.style.width = `${containerWidth * 0.1}px`;
      }
    };
    updateSpacerWidth();

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.08;

      // Check if carousel has reached trigger point (8% from top)
      const isAtTrigger = Math.abs(rect.top - triggerPoint) < 2;

      // Activate if at trigger point, not already active, and carousel is scrollable
      if (isAtTrigger && !isActiveRef.current && isScrollableRef.current) {
        isActiveRef.current = true;
        // Calculate exact lock position: container should be at triggerPoint (8% from top)
        // Use the same formula as checkTrigger for consistency
        const containerTopAbsolute = window.scrollY + rect.top;
        lockedScrollYRef.current = containerTopAbsolute - triggerPoint;
        triggerPointRef.current = triggerPoint;
        // Lock immediately to exact position - do this multiple times to ensure it sticks
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        requestAnimationFrame(() => {
          window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        });
      }

      // If active, control carousel
      if (isActiveRef.current) {
        const isAtStart = progressRef.current <= 0;
        const isAtEnd = progressRef.current >= 1;

        // Check boundaries FIRST - unlock before preventing default
        // If at end and scrolling down, unlock and allow scroll
        if (isAtEnd && e.deltaY > 0) {
          isActiveRef.current = false;
          lockedScrollYRef.current = 0;
          justUnlockedRef.current = true;
          // Clear the flag after a short delay to prevent immediate reactivation
          setTimeout(() => {
            justUnlockedRef.current = false;
          }, 100);
          // Don't prevent default - let scroll continue naturally
          return;
        }

        // If at start and scrolling up, unlock and allow scroll
        if (isAtStart && e.deltaY < 0) {
          isActiveRef.current = false;
          lockedScrollYRef.current = 0;
          justUnlockedRef.current = true;
          // Clear the flag after a short delay to prevent immediate reactivation
          setTimeout(() => {
            justUnlockedRef.current = false;
          }, 100);
          // Don't prevent default - let scroll continue naturally
          return;
        }

        // Not at boundaries - lock scroll and control carousel
        // Lock scroll position first
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        e.preventDefault();
        e.stopPropagation();

        // Update carousel
        const progressDelta = e.deltaY / scrollDistanceRef.current;
        let newProgress = progressRef.current + progressDelta;
        newProgress = Math.max(0, Math.min(1, newProgress));
        updateCarouselPosition(newProgress);
      }
    };

    let lastTop = container.getBoundingClientRect().top;

    // Check trigger point continuously
    const checkTrigger = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.08;
      const currentTop = rect.top;

      // Check if at trigger or crossed it
      const isAtTrigger = Math.abs(currentTop - triggerPoint) < 2;
      const crossedTrigger = (lastTop > triggerPoint && currentTop <= triggerPoint) || 
                             (lastTop < triggerPoint && currentTop >= triggerPoint);

      // Don't reactivate if we just unlocked (prevents immediate reactivation)
      // Only activate if carousel is scrollable
      if ((isAtTrigger || crossedTrigger) && !isActiveRef.current && !justUnlockedRef.current && rect.bottom > 0 && isScrollableRef.current) {
        isActiveRef.current = true;
        // Calculate exact lock position: container should be at triggerPoint (8% from top)
        // This formula ensures container.top = triggerPoint when locked
        // We calculate based on the container's absolute position in the document
        const containerTopAbsolute = window.scrollY + rect.top;
        lockedScrollYRef.current = containerTopAbsolute - triggerPoint;
        triggerPointRef.current = triggerPoint;
        // Lock immediately to exact position - do this multiple times to ensure it sticks
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        // Double-lock in next frame to catch any drift
        requestAnimationFrame(() => {
          window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
        });
      }

      // Deactivate if moved away significantly or if carousel is no longer scrollable
      if (isActiveRef.current) {
        const distanceFromTrigger = Math.abs(currentTop - triggerPoint);
        if (distanceFromTrigger > 200 || !isScrollableRef.current) {
          isActiveRef.current = false;
          lockedScrollYRef.current = 0;
        }
      }

      lastTop = currentTop;
    };

    // Lock scroll when active and check trigger continuously
    const lockScroll = () => {
      // Check trigger every frame
      checkTrigger();

      // Only lock if active, not just unlocked, and not at boundaries
      if (isActiveRef.current && lockedScrollYRef.current > 0 && !justUnlockedRef.current) {
        const isAtStart = progressRef.current <= 0;
        const isAtEnd = progressRef.current >= 1;

        // Only lock if not at boundaries - this allows smooth unlocking
        if (!isAtStart && !isAtEnd) {
          // Always lock to the exact same stored position
          // Check if we've drifted and correct it
          if (Math.abs(window.scrollY - lockedScrollYRef.current) > 0.5) {
            window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          }
        }
        // At boundaries - don't lock at all to allow smooth unlock
      }
      requestAnimationFrame(lockScroll);
    };

    lockScroll();

    // Check trigger on scroll
    const handleScroll = () => {
      checkTrigger();
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      // Update spacer width on resize
      updateSpacerWidth();
      // Recheck if carousel is scrollable after resize
      checkIfScrollable();
      // Recalculate scroll distance on resize
      scrollDistanceRef.current = Math.max(calculateScrollableWidth() * 1.4, 1000);
      updateCarouselPosition(progressRef.current);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [items.length]);

  if (items.length === 0) {
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
          className="flex gap-5"
          style={{
            paddingLeft: '40%',
            transition: 'none',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="relative shrink-0 flex flex-col items-start gap-[12px]"
            >
              <div className="relative flex items-center" style={{ height: '582px', backgroundColor: 'transparent' }}>
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="object-contain h-[582px] w-auto"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ backgroundColor: 'transparent' }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="object-contain h-[582px] w-auto"
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
              </div>
              <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] w-full text-left">
                {item.text || 'Text'}
              </p>
            </div>
          ))}
          {/* Spacer for right padding - creates scrollable space (10% of container width) */}
          <div ref={spacerRef} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
