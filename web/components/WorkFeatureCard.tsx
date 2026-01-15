"use client";

import Image from "next/image";
import { useState } from "react";

interface MediaData {
  url: string;
  alt: string;
  type?: 'image' | 'video';
}

interface WorkFeatureCardProps {
  projectTitle: string;
  projectDescriptionShort: string;
  projectDescriptionLong?: string | null;
  teamContribution?: string | null;
  images?: MediaData[];
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
  // Show "Read description" button if there's a long description OR if there's only a short description (for mobile)
  const hasLongDescription = projectDescriptionLong && projectDescriptionLong.trim().length > 0;
  const hasShortDescription = projectDescriptionShort && projectDescriptionShort.trim().length > 0;
  // On mobile, show button if there's any description. On desktop, only show if there's a long description.
  const showReadMore = hasLongDescription || hasShortDescription;
  
  // Expand/collapse state for description
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Carousel state - only track media index, not work item index
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const totalMedia = images.length;
  const currentMedia = images[currentMediaIndex];
  
  // Navigation handlers
  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  };
  
  // Only show navigation if there are multiple media items
  const showNavigation = totalMedia > 1;

  return (
    <div className="flex w-full flex-col items-start gap-[28px] lg:flex-row lg:items-start">
      {/* Left Column - Text Content */}
      <div className="flex min-w-0 w-full flex-col items-start justify-between px-0 pb-[2px] pt-[12px] lg:min-w-[430px] lg:min-h-0 lg:grow lg:basis-0 lg:self-stretch">
        <div className="flex max-w-[452px] flex-col items-start gap-[22px] font-normal not-italic w-full">
          <p className="relative shrink-0 w-full max-w-[452px] text-[16px] leading-[normal] text-black">
            {projectTitle}
          </p>
          {/* Short description - hidden on mobile, visible on desktop. On mobile, only show if expanded and no long description */}
          <p className={`relative shrink-0 min-w-full w-[min-content] text-[13px] leading-[19px] text-[#5d5d5d] whitespace-pre-line ${isExpanded && !hasLongDescription ? 'block md:hidden' : 'hidden md:block'}`}>
            {projectDescriptionShort}
          </p>
          {/* Long description - only show when expanded. If both exist, show long. If only short exists, it's shown above */}
          {isExpanded && hasLongDescription && (
            <p className="relative shrink-0 min-w-full w-[min-content] text-[13px] leading-[19px] text-[#5d5d5d] whitespace-pre-line">
              {projectDescriptionLong}
            </p>
          )}
          {/* Team contribution - hidden on mobile, visible on desktop */}
          {teamContribution && (
            <p className="hidden md:block relative shrink-0 w-full max-w-[354.667px] text-[13px] leading-[19px] text-[#5d5d5d]">
              {teamContribution}
            </p>
          )}
          {showReadMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative shrink-0 w-full max-w-[354.667px] text-left text-[12px] leading-[19px] text-[#5d5d5d] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="md:hidden">{isExpanded ? 'Read less' : 'Read description'}</span>
              {/* Desktop: only show if there's a long description */}
              {hasLongDescription && (
                <span className="hidden md:inline">{isExpanded ? 'Read less' : readMoreText}</span>
              )}
            </button>
          )}
        </div>
        {/* Navigation Controls - Desktop only (in left column) */}
        {showNavigation && (
          <div className="hidden md:flex flex-col items-end justify-center gap-[12px] px-0 py-0 pl-[30px] pr-0 w-full">
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-black text-nowrap">
              {currentMediaIndex + 1}/{totalMedia}
            </p>
            <div className="flex items-center justify-between w-[48px] font-normal text-[14px] leading-[19px] not-italic text-black text-nowrap">
              <button
                onClick={handlePrevious}
                className={`relative shrink-0 transition-opacity cursor-pointer ${currentMediaIndex > 0 ? 'opacity-100' : 'opacity-30'} hover:opacity-100`}
                aria-label="Previous image"
                style={{ width: '14px', height: '14px' }}
              >
                <Image src="/arrow-left.svg" alt="" width={14} height={14} className="w-full h-full" />
              </button>
              <button
                onClick={handleNext}
                className="relative shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
                aria-label="Next image"
                style={{ width: '14px', height: '14px' }}
              >
                <Image src="/arrow-right.svg" alt="" width={14} height={14} className="w-full h-full" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Right Column - Media Carousel */}
      <div className="flex flex-col w-full lg:shrink lg:min-w-0 lg:max-w-[846px]">
        <div className="relative w-full aspect-[846/623] overflow-hidden">
          {images.length > 0 ? (
            <div 
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentMediaIndex * (100 / images.length)}%)`,
                width: `${images.length * 100}%`,
              }}
            >
              {images.map((media, index) => (
                <div
                  key={index}
                  className="relative shrink-0"
                  style={{ width: `${100 / images.length}%` }}
                >
                  {media.type === 'video' ? (
                    <video
                      src={media.url}
                      className="object-cover object-[50%_50%] w-full h-full"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                    />
                  ) : (
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      className="object-cover object-[50%_50%]"
                      sizes="(max-width: 1024px) 100vw, 846px"
                      quality={95}
                      priority={index === 0}
                    />
                  )}
                </div>
              ))}
            </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Placeholder Image</span>
          </div>
        )}
        </div>
        {/* Navigation Controls - Mobile only (below image) */}
        {showNavigation && (
          <div className="flex items-center justify-between w-full pt-4 md:hidden">
            {/* Counter - Left */}
            <p className="relative shrink-0 font-normal text-[12px] leading-[19px] not-italic text-black text-nowrap">
              {currentMediaIndex + 1}/{totalMedia}
            </p>
            {/* Arrows - Right */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                className={`relative shrink-0 transition-opacity cursor-pointer ${currentMediaIndex > 0 ? 'opacity-100' : 'opacity-30'} hover:opacity-100`}
                aria-label="Previous image"
                style={{ width: '14px', height: '14px' }}
              >
                <Image src="/arrow-left.svg" alt="" width={14} height={14} className="w-full h-full" />
              </button>
              <button
                onClick={handleNext}
                className="relative shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Next image"
                style={{ width: '14px', height: '14px' }}
              >
                <Image src="/arrow-right.svg" alt="" width={14} height={14} className="w-full h-full" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

