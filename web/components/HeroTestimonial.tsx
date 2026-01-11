"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
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
    <div className="flex w-full max-w-[700px] flex-col items-center gap-[12px]">
      <div className="flex items-center justify-center w-full">
        <p
          key={currentTestimonial._id}
          className="relative w-full font-normal text-[13px] leading-[19px] not-italic text-[#989898] text-center animate-fade-in"
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
              quality={90}
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

