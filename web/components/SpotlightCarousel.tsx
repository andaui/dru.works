"use client";

import { useEffect, useRef, useState } from "react";

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
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M13.4173 21.5455L11.7767 19.9262L18.531 13.1719H1.03809V10.8282H18.531L11.7767 4.09521L13.4173 2.45459L22.9628 12L13.4173 21.5455Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CarouselItem({ item }: CarouselItemProps) {
  return (
    <div className="relative shrink-0">
      <div
        className="relative flex items-center overflow-hidden rounded-[16px]"
        style={{ height: 'clamp(300px, 40vw, 582px)', backgroundColor: 'transparent' }}
      >
        {item.type === 'video' ? (
          <video
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
    </div>
  );
}

export default function SpotlightCarousel({ items }: SpotlightCarouselProps) {
  const itemCount = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  const clearScrollLock = useRef<(() => void) | null>(null);

  const goToItem = (index: number) => {
    const el = containerRef.current;
    const i = Math.max(0, Math.min(index, itemCount - 1));
    if (!el) return;

    // Clear any previous scroll-end cleanup
    if (clearScrollLock.current) {
      clearScrollLock.current();
      clearScrollLock.current = null;
    }

    isScrollingRef.current = true;

    const unlock = () => {
      isScrollingRef.current = false;
      clearScrollLock.current = null;
    };

    if (i === 0) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const target = itemRefs.current[i];
      if (!target) {
        isScrollingRef.current = false;
        return;
      }
      const targetLeft = target.getBoundingClientRect().left;
      const containerLeft = el.getBoundingClientRect().left;
      const delta = targetLeft - containerLeft;
      el.scrollBy({ left: delta, behavior: 'smooth' });
    }

    // Only allow scroll listener to update index after scroll has really finished
    const onScrollEnd = () => {
      el.removeEventListener('scrollend', onScrollEnd);
      unlock();
    };
    el.addEventListener('scrollend', onScrollEnd);
    const fallback = setTimeout(() => {
      el.removeEventListener('scrollend', onScrollEnd);
      unlock();
    }, 800);

    clearScrollLock.current = () => {
      el.removeEventListener('scrollend', onScrollEnd);
      clearTimeout(fallback);
      unlock();
    };
  };

  const goPrev = () => {
    if (currentIndex <= 0) return;
    const targetIndex = currentIndex - 1;
    setCurrentIndex(targetIndex);
    goToItem(targetIndex);
  };

  const goNext = () => {
    if (currentIndex >= itemCount - 1) return;
    const targetIndex = currentIndex + 1;
    setCurrentIndex(targetIndex);
    goToItem(targetIndex);
  };

  // Sync currentIndex from scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el || itemCount === 0) return;

    const updateIndex = () => {
      if (isScrollingRef.current) return; // don't overwrite during arrow-triggered scroll
      const containerLeft = el.getBoundingClientRect().left;
      let bestIndex = 0;
      for (let i = 0; i < itemCount; i++) {
        const node = itemRefs.current[i];
        if (!node) continue;
        const nodeLeft = node.getBoundingClientRect().left;
        if (nodeLeft <= containerLeft + 15) bestIndex = i;
        else break;
      }
      setCurrentIndex(bestIndex);
    };

    el.addEventListener('scroll', updateIndex, { passive: true });
    updateIndex();
    return () => el.removeEventListener('scroll', updateIndex);
  }, [itemCount]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="w-[calc(100%+5%)] sm:w-full -ml-[2.5%] -mr-[2.5%] sm:mx-0">
      <div className="flex items-center justify-between pr-[calc(2.5%+12px)] sm:pr-[36px] mb-7">
        <div className="text-left pl-[2.5%] sm:pl-[24px] font-soehne font-normal text-[26px] sm:text-[29px] leading-[34px] sm:leading-[37px] tracking-[-0.25px] text-foreground">
          Spotlight
        </div>
        {itemCount > 1 && (
          <div className="flex items-center gap-[42px] shrink-0">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-0 text-black dark:text-white hover:opacity-70 disabled:opacity-20 disabled:pointer-events-none transition-opacity"
              aria-label="Previous item"
            >
              <IconArrowRight className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex >= itemCount - 1}
              className="p-0 text-black dark:text-white hover:opacity-70 disabled:opacity-20 disabled:pointer-events-none transition-opacity"
              aria-label="Next item"
            >
              <IconArrowRight />
            </button>
          </div>
        )}
      </div>
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden pl-[2.5%] sm:pl-[24px] scrollbar-hide"
        style={{
          minHeight: 'clamp(300px, 40vw, 582px)',
        }}
      >
        <div className="flex gap-5">
          {items.map((item, index) => (
            <div
              key={index}
              ref={(el) => { itemRefs.current[index] = el; }}
              className="shrink-0"
            >
              <CarouselItem item={item} />
            </div>
          ))}
          {/* Right-side breathing room so next item never touches viewport edge */}
          <div className="shrink-0 w-[calc(2.5%+12px)] sm:w-[36px]" aria-hidden />
        </div>
      </div>
    </div>
  );
}
