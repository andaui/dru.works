'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Calculate and set page height based on sections
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

    // Calculate immediately and after a short delay to ensure DOM is ready
    calculateHeight();
    setTimeout(calculateHeight, 100);
    setTimeout(calculateHeight, 500);

    // Handle hash-based scrolling
    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        // Try to find section by ID or by matching section title
        const sectionElement = document.getElementById(hash);
        if (sectionElement) {
          // Find the grey header strip (the first child div)
          const headerStrip = sectionElement.firstElementChild as HTMLElement;
          if (headerStrip) {
            setTimeout(() => {
              headerStrip.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }, 100);
          }
        } else {
          // Try to find by section title match (case-insensitive, spaces to hyphens)
          const normalizedHash = hash.toLowerCase().replace(/\s+/g, '-');
          const allSections = document.querySelectorAll('[id]');
          for (const section of Array.from(allSections)) {
            const sectionTitle = section.querySelector('p')?.textContent?.toLowerCase().replace(/\s+/g, '-');
            if (sectionTitle === normalizedHash || section.id.toLowerCase().includes(normalizedHash)) {
              const headerStrip = section.firstElementChild as HTMLElement;
              if (headerStrip) {
                setTimeout(() => {
                  headerStrip.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                  });
                }, 100);
                break;
              }
            }
          }
        }
      }
    };

    // Handle initial hash on page load
    if (window.location.hash) {
      setTimeout(handleHashScroll, 300);
    }

    // Handle hash changes
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
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

        // It's a section
        const sectionId = item._id || `section-${item.sectionTitle?.toLowerCase().replace(/\s+/g, '-') || index}`;
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

