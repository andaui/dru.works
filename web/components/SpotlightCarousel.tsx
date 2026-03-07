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

    updateTextWidth();
    window.addEventListener('resize', updateTextWidth);

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
      className="relative shrink-0 flex flex-col items-start gap-[12px]"
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
  const itemCount = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
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

  const updateSpacerWidth = () => {
    if (spacerRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      spacerRef.current.style.width = `${Math.max(0, containerWidth * 0.1 - 30)}px`;
    }
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

  useEffect(() => {
    updateSpacerWidth();
    window.addEventListener('resize', updateSpacerWidth);
    return () => window.removeEventListener('resize', updateSpacerWidth);
  }, [itemCount]);

  useEffect(() => {
    const t = setTimeout(updateSpacerWidth, 150);
    return () => clearTimeout(t);
  }, [itemCount]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="w-[calc(100%+5%)] sm:w-full -ml-[2.5%] -mr-[2.5%] sm:mx-0">
      <div className="flex items-center justify-between pr-[2.5%] sm:pr-[24px]">
        <div
          className="text-left pl-[2.5%] sm:pl-[24px]"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            lineHeight: '20px',
            marginBottom: '28px',
          }}
        >
          Spotlight
        </div>
        {itemCount > 1 && (
          <div className="flex items-center gap-2 -mt-5 mb-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Previous item"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex >= itemCount - 1}
              className="p-2 rounded-full text-muted hover:text-foreground hover:bg-foreground/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Next item"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
              <CarouselItem item={item} index={index} isFirst={index === 0} />
            </div>
          ))}
          <div ref={spacerRef} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
