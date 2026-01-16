"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

interface ProcessedTestimonial {
  _id: string;
  testimonialShort: string;
  person: string;
  roleAtCompany: string;
  personPhotoUrl: string | null;
  personPhotoAlt: string;
}

interface HeroTestimonialProps {
  testimonials: ProcessedTestimonial[];
}

export default function HeroTestimonial({
  testimonials,
}: HeroTestimonialProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    // Detect mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                    (typeof window !== 'undefined' && window.innerWidth < 768);

    // Use IntersectionObserver to pause when not visible (especially on mobile)
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        
        if (isVisible) {
          // Resume rotation when visible
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
            }, 5000);
          }
        } else {
          // Pause rotation when not visible (saves battery/CPU on mobile)
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px', // Start checking slightly before it's visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Start interval if visible on mount
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 5000);
      }
    }

    return () => {
      observer.disconnect();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <div className="flex w-full max-w-[700px] flex-col items-center gap-[16px]">
        <div className="flex items-center justify-center w-full">
          <p className="relative shrink-0 font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-center">
            No testimonials available. Please add testimonials in Sanity Studio.
          </p>
        </div>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div ref={containerRef} className="flex w-full max-w-[700px] flex-col items-start md:items-center gap-[12px]">
      <div className="flex items-start md:items-center justify-start w-full">
        <p
          key={currentTestimonial._id}
          className="relative w-full font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-left md:text-center animate-fade-in"
        >
          {currentTestimonial.testimonialShort}
        </p>
      </div>
      <div className="flex items-center gap-[10px] min-h-[19px]">
        {currentTestimonial.personPhotoUrl ? (
          <div className="relative shrink-0 size-[21px] overflow-hidden rounded-full">
            <Image
              key={`photo-${currentTestimonial._id}`}
              src={currentTestimonial.personPhotoUrl}
              alt={currentTestimonial.personPhotoAlt}
              fill
              className="object-cover"
              sizes="21px"
              quality={75}
              loading="eager"
              priority
            />
          </div>
        ) : (
          <div className="relative shrink-0 size-[21px]">
            <div className="size-full rounded-full bg-gray-300" />
          </div>
        )}
        <p
          key={`name-${currentTestimonial._id}`}
          className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-[#989898] text-nowrap animate-fade-in"
        >
          {currentTestimonial.person}
          {currentTestimonial.roleAtCompany ? `, ${currentTestimonial.roleAtCompany}` : ""}
        </p>
      </div>
    </div>
  );
}

