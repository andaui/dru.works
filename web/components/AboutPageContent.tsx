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
      image?: {
        asset?: {
          url?: string;
          _id?: string;
        };
        alt?: string;
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
  }, [sections]);

  return (
    <div ref={containerRef} className="absolute left-0 top-[648px] w-full flex flex-col gap-[75px] items-start pb-[200px]">
      {sections.map((item: any, index: number) => {
        // Check if it's a testimonial or section
        if (item._type === 'testimonial') {
          return (
            <div key={item._id || index} data-testimonial={item._id}>
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

