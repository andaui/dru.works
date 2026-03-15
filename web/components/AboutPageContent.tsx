'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Section from './Section';
import PageTestimonial from './PageTestimonial';

interface AboutPageContentProps {
  sections: Array<{
    _id: string;
    _type: string;
    sectionTitle?: string;
    blocks?: any[];
    featuredImage?: {
      type?: 'image' | 'video';
      image?: {
        asset?: {
          url?: string;
          _id?: string;
          metadata?: {
            dimensions?: {
              width?: number;
              height?: number;
            };
          };
        };
        alt?: string;
      };
      video?: {
        asset?: {
          url?: string;
          _id?: string;
          mimeType?: string;
          metadata?: {
            dimensions?: {
              width?: number;
              height?: number;
            };
          };
        };
      };
      text?: string;
    };
    // Testimonial fields
    testimonialShort?: string;
    testimonialLong?: string;
    person?: string;
    role?: string;
    company?: string;
    personPhoto?: {
      asset?: {
        url?: string;
        _id?: string;
        metadata?: {
          dimensions?: {
            width?: number;
            height?: number;
          };
        };
      };
      alt?: string;
    };
  }>;
}

export default function AboutPageContent({ sections }: AboutPageContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top before paint when landing with a hash (avoids "jump" from browser's hash scroll)
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [sections]);

  useEffect(() => {
    // Detect mobile for performance optimizations
    const isMobile = (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) || 
                    (typeof window !== 'undefined' && window.innerWidth < 768);

    // Calculate and set page height based on sections
    // Throttle this on mobile to reduce DOM queries
    let heightCalculationTimeout: NodeJS.Timeout;
    const calculateHeight = () => {
      if (containerRef.current) {
        // Find the last section or testimonial
        const items = containerRef.current.querySelectorAll('[id], [data-testimonial]');
        if (items.length > 0) {
          const lastItem = items[items.length - 1] as HTMLElement;
          const rect = lastItem.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const totalHeight = rect.bottom + scrollTop + 200; // Add padding
          const pageContainer = document.querySelector('[data-about-page]') as HTMLElement;
          if (pageContainer) {
            pageContainer.style.minHeight = `${totalHeight}px`;
          }
        }
      }
    };

    // Calculate immediately, but throttle on mobile
    if (isMobile) {
      // On mobile, only calculate once after a delay to reduce initial load
      heightCalculationTimeout = setTimeout(calculateHeight, 300);
    } else {
      // On desktop, calculate multiple times for accuracy
      calculateHeight();
      setTimeout(calculateHeight, 100);
      setTimeout(calculateHeight, 500);
    }

    // Handle hash-based scrolling: show top of page first, then scroll to section
    const scrollToSection = (hash: string) => {
      const scrollBehavior: ScrollBehavior = isMobile ? 'auto' : 'smooth';
      const scrollDelay = isMobile ? 0 : 100;

      const doScrollToSection = () => {
        const sectionElement = document.getElementById(hash);
        if (sectionElement) {
          const headerStrip = sectionElement.firstElementChild as HTMLElement;
          if (headerStrip) {
            headerStrip.scrollIntoView({
              behavior: scrollBehavior,
              block: 'start',
              inline: 'nearest',
            });
          }
          return;
        }
        const normalizedHash = hash.toLowerCase().replace(/\s+/g, '-');
        const allSections = document.querySelectorAll('[id]');
        for (const section of Array.from(allSections)) {
          const sectionTitle = section.querySelector('p')?.textContent?.toLowerCase().replace(/\s+/g, '-');
          if (sectionTitle === normalizedHash || section.id.toLowerCase().includes(normalizedHash)) {
            const headerStrip = section.firstElementChild as HTMLElement;
            if (headerStrip) {
              headerStrip.scrollIntoView({
                behavior: scrollBehavior,
                block: 'start',
                inline: 'nearest',
              });
            }
            break;
          }
        }
      };

      if (scrollDelay > 0) {
        setTimeout(doScrollToSection, scrollDelay);
      } else {
        doScrollToSection();
      }
    };

    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Top already forced in useLayoutEffect; wait at top then scroll to section
        const delayBeforeScroll = isMobile ? 150 : 500;
        setTimeout(() => scrollToSection(hash), delayBeforeScroll);
      }
    };

    // Handle initial hash on page load (scroll to top was done in useLayoutEffect)
    if (window.location.hash) {
      const initialDelay = isMobile ? 100 : 50; // Short delay so DOM is ready
      setTimeout(handleHashScroll, initialDelay);
    }

    // Handle hash changes
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      clearTimeout(heightCalculationTimeout);
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [sections]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-[75px] items-start pt-[25px] pb-[200px]">
      {sections.map((item: any, index: number) => {
        // Check if it's a testimonial or section
        if (item._type === 'testimonial') {
          return (
            <div key={item._id || index} data-testimonial={item._id} className="w-full">
              <PageTestimonial testimonial={item} />
            </div>
          );
        }

        // It's a section - use slug-based id so anchor links (e.g. /about#section-how-i-work) work
        const sectionSlug = item.sectionTitle?.toLowerCase().replace(/\s+/g, '-') || `section-${index}`;
        const sectionId = sectionSlug.startsWith('section-') ? sectionSlug : `section-${sectionSlug}`;
        return (
          <Section
            key={item._id || index}
            sectionTitle={item.sectionTitle || ''}
            blocks={item.blocks || []}
            sectionId={sectionId}
            featuredImage={item.featuredImage}
          />
        );
      })}
    </div>
  );
}

