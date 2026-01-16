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

interface CarouselItemProps {
  item: MediaData;
  index: number;
  isFirst?: boolean;
}

function CarouselItem({ item, index, isFirst = false }: CarouselItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    const updateTextWidth = () => {
      if (imageRef.current && itemRef.current) {
        const imageWidth = imageRef.current.offsetWidth;
        const textElement = itemRef.current.querySelector('p');
        if (textElement) {
          textElement.style.maxWidth = `${imageWidth}px`;
        }
      }
    };

    // Update on load and resize
    updateTextWidth();
    window.addEventListener('resize', updateTextWidth);
    
    // Also update after image loads
    if (imageRef.current) {
      if (item.type === 'image' && imageRef.current instanceof HTMLImageElement) {
        imageRef.current.addEventListener('load', updateTextWidth);
      } else if (item.type === 'video' && imageRef.current instanceof HTMLVideoElement) {
        imageRef.current.addEventListener('loadedmetadata', updateTextWidth);
      }
    }

    return () => {
      window.removeEventListener('resize', updateTextWidth);
      if (imageRef.current) {
        if (item.type === 'image' && imageRef.current instanceof HTMLImageElement) {
          imageRef.current.removeEventListener('load', updateTextWidth);
        } else if (item.type === 'video' && imageRef.current instanceof HTMLVideoElement) {
          imageRef.current.removeEventListener('loadedmetadata', updateTextWidth);
        }
      }
    };
  }, [item.type]);

  return (
    <div
      ref={itemRef}
      className={`relative shrink-0 flex flex-col items-start gap-[12px] ${isFirst ? 'pl-[2.5%] lg:pl-[24px]' : ''}`}
    >
      <div className="relative flex items-center" style={{ height: 'clamp(300px, 40vw, 582px)', backgroundColor: 'transparent' }}>
        {item.type === 'video' ? (
          <video
            ref={imageRef as React.RefObject<HTMLVideoElement>}
            src={item.url}
            className="object-contain w-auto"
            autoPlay
            loop
            muted
            playsInline
            style={{ 
              backgroundColor: 'transparent',
              height: 'clamp(300px, 40vw, 582px)',
              maxHeight: '582px'
            }}
          />
        ) : (
          <img
            ref={imageRef as React.RefObject<HTMLImageElement>}
            src={item.url}
            alt={item.alt}
            className="object-contain w-auto"
            style={{ 
              backgroundColor: 'transparent',
              height: 'clamp(300px, 40vw, 582px)',
              maxHeight: '582px'
            }}
          />
        )}
      </div>
      <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] text-left break-words" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        {item.text || 'Text'}
      </p>
    </div>
  );
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
  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const lastTouchYRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (!containerRef.current || !scrollContainerRef.current || items.length === 0) return;

    // Since this component is wrapped by SpotlightCarouselWrapper which prevents mobile mounting,
    // we can assume we're always on desktop here
    const isMobile = false; // Always desktop - wrapper handles mobile exclusion
    
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
      // Debug: log scrollable status
      if (process.env.NODE_ENV === 'development') {
        console.log('SpotlightCarousel scrollable:', isScrollableRef.current, 'width:', scrollableWidth);
      }
    };
    
    // Check immediately and after a short delay to ensure DOM is ready
    checkIfScrollable();
    setTimeout(checkIfScrollable, 100);
    setTimeout(checkIfScrollable, 500);
    
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

    const checkAndActivate = (deltaY: number) => {
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
        if (isAtEnd && deltaY > 0) {
          isActiveRef.current = false;
          // Don't reset lockedScrollYRef - keep current scroll position to prevent snapping
          justUnlockedRef.current = true;
          // Clear the flag after a short delay to prevent immediate reactivation
          setTimeout(() => {
            justUnlockedRef.current = false;
          }, 100);
          // Don't prevent default - let scroll continue naturally
          return false;
        }

        // If at start and scrolling up, unlock and allow scroll
        if (isAtStart && deltaY < 0) {
          isActiveRef.current = false;
          // Don't reset lockedScrollYRef - keep current scroll position to prevent snapping
          justUnlockedRef.current = true;
          // Clear the flag after a short delay to prevent immediate reactivation
          setTimeout(() => {
            justUnlockedRef.current = false;
          }, 100);
          // Don't prevent default - let scroll continue naturally
          return false;
        }

        // Not at boundaries - lock scroll and control carousel
        // Lock scroll position first
        window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });

        // Update carousel
        const progressDelta = deltaY / scrollDistanceRef.current;
        let newProgress = progressRef.current + progressDelta;
        newProgress = Math.max(0, Math.min(1, newProgress));
        updateCarouselPosition(newProgress);
        return true; // Should prevent default
      }
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      const shouldPrevent = checkAndActivate(e.deltaY);
      if (shouldPrevent) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
        lastTouchYRef.current = e.touches[0].clientY;
        
        // Check trigger point on touch start (similar to wheel handler)
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const triggerPoint = viewportHeight * 0.08;
        const isAtTrigger = Math.abs(rect.top - triggerPoint) < 2;

        // Activate if at trigger point, not already active, and carousel is scrollable
        if (isAtTrigger && !isActiveRef.current && isScrollableRef.current) {
          isActiveRef.current = true;
          const containerTopAbsolute = window.scrollY + rect.top;
          lockedScrollYRef.current = containerTopAbsolute - triggerPoint;
          triggerPointRef.current = triggerPoint;
          window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          requestAnimationFrame(() => {
            window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = lastTouchYRef.current - currentY; // Inverted: swipe up = positive deltaY
        const deltaX = Math.abs(currentX - touchStartXRef.current);
        
        // Only handle vertical swipes (ignore horizontal swipes)
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 1) {
          // If active, control carousel
          if (isActiveRef.current) {
            const isAtStart = progressRef.current <= 0;
            const isAtEnd = progressRef.current >= 1;

            // Check boundaries FIRST - unlock before preventing default
            if (isAtEnd && deltaY > 0) {
              isActiveRef.current = false;
              // Don't reset lockedScrollYRef - keep current scroll position to prevent snapping
              justUnlockedRef.current = true;
              setTimeout(() => {
                justUnlockedRef.current = false;
              }, 100);
              return; // Don't prevent default - let scroll continue
            }

            if (isAtStart && deltaY < 0) {
              isActiveRef.current = false;
              // Don't reset lockedScrollYRef - keep current scroll position to prevent snapping
              justUnlockedRef.current = true;
              setTimeout(() => {
                justUnlockedRef.current = false;
              }, 100);
              return; // Don't prevent default - let scroll continue
            }

            // Not at boundaries - lock scroll and control carousel
            window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
            e.preventDefault();
            e.stopPropagation();

            // Update carousel - use smaller scroll distance for touch to make it more responsive
            const touchScrollDistance = scrollDistanceRef.current * 0.5; // More sensitive for touch
            const progressDelta = deltaY / touchScrollDistance;
            let newProgress = progressRef.current + progressDelta;
            newProgress = Math.max(0, Math.min(1, newProgress));
            updateCarouselPosition(newProgress);
          } else {
            // Not active yet, but check if we should activate (in case touch started before reaching trigger)
            checkAndActivate(deltaY);
          }
        }
        
        lastTouchYRef.current = currentY;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = 0;
      touchStartXRef.current = 0;
      lastTouchYRef.current = 0;
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
    // Since wrapper ensures we're always on desktop, we can use full functionality
    const lockScroll = () => {
      // Only continue if component is still mounted
      if (!isMountedRef.current) return;

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
          const scrollDiff = Math.abs(window.scrollY - lockedScrollYRef.current);
          const threshold = 0.5; // Desktop threshold
          if (scrollDiff > threshold) {
            window.scrollTo({ top: lockedScrollYRef.current, behavior: 'auto' });
          }
        }
        // At boundaries - don't lock at all to allow smooth unlock
      }
      
      // Always use requestAnimationFrame on desktop (wrapper ensures we're never on mobile)
      // Only schedule next frame if component is still mounted
      if (isMountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(lockScroll);
      }
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(lockScroll);

    // Check trigger on scroll
    const handleScroll = () => {
      checkTrigger();
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

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
      // Mark as unmounted to stop animation loop
      isMountedRef.current = false;
      
      // Cancel any pending animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-[calc(100%+5%)] lg:w-full -ml-[2.5%] -mr-[2.5%] lg:mx-0" style={{ marginTop: '52px' }}>
      <div
        className="hidden md:block text-left pl-[2.5%] lg:pl-[24px]"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          lineHeight: '20px',
          marginBottom: '28px',
        }}
      >
        Spotlight
      </div>
      <div 
        ref={containerRef}
        className="w-full overflow-hidden"
        style={{ 
          minHeight: 'clamp(300px, 40vw, 582px)',
        }}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-5"
          style={{
            transition: 'none',
          }}
        >
          {items.map((item, index) => (
            <CarouselItem key={index} item={item} index={index} isFirst={index === 0} />
          ))}
          {/* Spacer for right padding - creates scrollable space (10% of container width) */}
          <div ref={spacerRef} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
