"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageData {
  url: string;
  alt: string;
}

interface WorkFeatureCardProps {
  projectTitle: string;
  projectDescriptionShort: string;
  projectDescriptionLong?: string | null;
  teamContribution?: string | null;
  images?: ImageData[];
  readMoreText?: string;
}

export default function WorkFeatureCard({
  projectTitle,
  projectDescriptionShort,
  projectDescriptionLong,
  teamContribution,
  images = [],
  readMoreText = "Read more",
}: WorkFeatureCardProps) {
  // Only show "Read more" if projectDescriptionLong is populated
  const showReadMore = projectDescriptionLong && projectDescriptionLong.trim().length > 0;
  
  // Carousel state - only track image index, not work item index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = images.length;
  const currentImage = images[currentImageIndex];
  
  // Navigation handlers
  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };
  
  // Only show navigation if there are multiple images
  const showNavigation = totalImages > 1;

  return (
    <div className="flex w-full flex-col items-start gap-[28px] lg:flex-row lg:items-start">
      {/* Left Column - Text Content */}
      <div className="flex min-w-0 w-full flex-col items-start justify-between px-0 pb-[2px] pt-[12px] lg:min-w-[350px] lg:min-h-0 lg:grow lg:basis-0 lg:self-stretch">
        <div className="flex max-w-[452px] flex-col items-start gap-[22px] font-normal not-italic w-full">
          <p className="relative shrink-0 w-full max-w-[452px] text-[16px] leading-[normal] text-black">
            {projectTitle}
          </p>
          <p className="relative shrink-0 min-w-full w-[min-content] text-[13px] leading-[19px] text-[#5d5d5d]">
            {projectDescriptionShort}
          </p>
          {teamContribution && (
            <p className="relative shrink-0 w-full max-w-[354.667px] text-[13px] leading-[19px] text-[#5d5d5d]">
              {teamContribution}
            </p>
          )}
          {showReadMore && (
            <p className="relative shrink-0 w-full max-w-[354.667px] text-[12px] leading-[19px] text-[#5d5d5d] opacity-50">
              {readMoreText}
            </p>
          )}
        </div>
        {/* Navigation Controls */}
        {showNavigation && (
          <div className="flex flex-col items-end justify-center gap-[12px] px-0 py-0 pl-[30px] pr-0 w-full">
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-black text-nowrap">
              {currentImageIndex + 1}/{totalImages}
            </p>
            <div className="flex items-center justify-between w-[48px] font-normal text-[14px] leading-[19px] not-italic text-black text-nowrap">
              <button
                onClick={handlePrevious}
                className="relative shrink-0 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={handleNext}
                className="relative shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Next image"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Right Column - Image Carousel */}
      <div className="relative w-full aspect-[846/623] overflow-hidden lg:shrink lg:min-w-0 lg:max-w-[846px]">
        {images.length > 0 ? (
          <div 
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentImageIndex * (100 / images.length)}%)`,
              width: `${images.length * 100}%`,
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="relative shrink-0"
                style={{ width: `${100 / images.length}%` }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover object-[50%_50%]"
                  sizes="(max-width: 1024px) 100vw, 846px"
                  quality={95}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Placeholder Image</span>
          </div>
        )}
      </div>
    </div>
  );
}

