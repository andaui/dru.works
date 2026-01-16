"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  
  // Detect mobile - use state to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Only detect mobile after hydration to prevent SSR mismatch
    const mobile = (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ||
                   (typeof window !== 'undefined' && window.innerWidth < 768);
    setIsMobile(mobile);
  }, []);
  
  // Manage video playback - load and play only current video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      const mediaItem = images[index];
      if (!mediaItem || mediaItem.type !== 'video') return;
      
      if (index === currentMediaIndex) {
        // Current video: ensure it's loaded and playing
        const currentVideo = video;
        
        // Set src if not already set or if it changed
        const videoUrl = mediaItem.url;
        const needsReload = !currentVideo.src || currentVideo.src !== videoUrl;
        
        if (needsReload) {
          currentVideo.src = videoUrl;
          currentVideo.load(); // Force reload
        }
        
        // Update preload based on mobile
        currentVideo.preload = isMobile ? 'metadata' : 'auto';
        
        // Play current video (both desktop and mobile)
        const tryPlay = () => {
          if (currentVideo.paused) {
            currentVideo.play().catch((error) => {
              // On mobile, autoplay might be blocked - that's okay
              // User can tap to play if needed
              console.debug('Video autoplay blocked:', error);
            });
          }
        };
        
        // If video is already loaded, play immediately
        if (currentVideo.readyState >= 2) {
          tryPlay();
        } else {
          // Wait for video to be ready
          const onCanPlay = () => {
            tryPlay();
            currentVideo.removeEventListener('canplay', onCanPlay);
          };
          // Remove any existing listener first
          currentVideo.removeEventListener('canplay', onCanPlay);
          currentVideo.addEventListener('canplay', onCanPlay);
          
          // Also try on loadeddata for faster playback
          const onLoadedData = () => {
            tryPlay();
            currentVideo.removeEventListener('loadeddata', onLoadedData);
          };
          currentVideo.addEventListener('loadeddata', onLoadedData);
        }
      } else {
        // Not current: pause and clear src to free memory
        if (video.src) {
          video.pause();
          video.currentTime = 0;
          // Remove src attribute to free memory (use removeAttribute instead of empty string)
          video.removeAttribute('src');
          video.load(); // Clear the video element
        }
      }
    });
    
    // Cleanup on unmount
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
    };
  }, [currentMediaIndex, isMobile, images]);
  
  // Pause videos when carousel is not visible (save battery/CPU)
  // Only set up after mobile detection to avoid hydration issues
  useEffect(() => {
    if (!carouselRef.current || totalMedia === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Pause all videos when carousel is scrolled out of view
            videoRefs.current.forEach((video) => {
              if (video && !video.paused) {
                video.pause();
              }
            });
          } else {
            // When carousel becomes visible, play current video (if not mobile)
            const currentVideo = videoRefs.current.get(currentMediaIndex);
            if (currentVideo && !isMobile) {
              currentVideo.play().catch(() => {
                // Ignore autoplay errors
              });
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '100px', // Start checking before it's fully visible
      }
    );
    
    observer.observe(carouselRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [currentMediaIndex, totalMedia, isMobile]);
  
  // Update transition after hydration based on mobile detection
  useEffect(() => {
    if (carouselRef.current) {
      const carousel = carouselRef.current.querySelector('.flex.h-full') as HTMLElement;
      if (carousel) {
        carousel.style.transition = isMobile ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out';
      }
    }
  }, [isMobile]);
  
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
    <div className="flex w-full flex-col items-start gap-[18px] lg:gap-[28px] lg:flex-row lg:items-start">
      {/* Left Column - Text Content */}
      <div className="flex min-w-0 w-full flex-col items-start justify-between px-0 pb-[2px] pt-[12px] lg:min-w-[430px] lg:min-h-0 lg:grow lg:basis-0 lg:self-stretch">
        <div className="flex max-w-[452px] flex-col items-start gap-[12px] lg:gap-[22px] font-normal not-italic w-full">
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
            <div className="flex items-center font-normal text-[14px] leading-[19px] not-italic text-black text-nowrap" style={{ gap: 'calc(var(--spacing) * 8)' }}>
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
        <div ref={carouselRef} className="relative w-full aspect-[846/623] overflow-hidden">
          {images.length > 0 ? (
            <div 
              className="flex h-full"
              style={{
                transform: `translateX(-${currentMediaIndex * (100 / images.length)}%)`,
                width: `${images.length * 100}%`,
                // Use consistent transition - will be optimized after hydration
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              {images.map((media, index) => {
                // For images: only load current, previous, and next to reduce memory
                // For videos: always render but only load/play when current
                const isImage = media.type !== 'video';
                const shouldLoadImage = isImage && Math.abs(index - currentMediaIndex) <= 1;
                const isCurrentVideo = !isImage && index === currentMediaIndex;
                
                return (
                  <div
                    key={index}
                    className="relative shrink-0"
                    style={{ width: `${100 / images.length}%` }}
                  >
                    {media.type === 'video' ? (
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current.set(index, el);
                            el.dataset.index = index.toString();
                          } else {
                            videoRefs.current.delete(index);
                          }
                        }}
                        src={isCurrentVideo ? media.url : undefined} // Only load src when current, use undefined not empty string
                        className="object-cover object-[50%_50%] w-full h-full"
                        autoPlay={isCurrentVideo} // Auto-play only when current
                        loop
                        muted
                        playsInline
                        controls={false}
                        preload={isCurrentVideo ? (isMobile ? "metadata" : "auto") : "none"} // Only preload current
                        // Ensure video plays on mobile by removing poster
                        poster={undefined}
                        // Always show video element
                        style={{ 
                          display: 'block',
                          backgroundColor: isCurrentVideo ? 'transparent' : '#f5f5f5' // Placeholder when not loaded
                        }}
                      />
                    ) : (
                      shouldLoadImage ? (
                        <Image
                          src={media.url}
                          alt={media.alt}
                          fill
                          className="object-cover object-[50%_50%]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 846px"
                          quality={75} // Consistent quality - Next.js will optimize
                          priority={index === 0 && currentMediaIndex === 0}
                          // Add decoding async for better performance
                          decoding="async"
                        />
                      ) : (
                        // Placeholder to maintain layout - don't load anything
                        <div className="w-full h-full bg-gray-100" aria-hidden="true" />
                      )
                    )}
                  </div>
                );
              })}
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
            <div className="flex items-center" style={{ gap: 'calc(var(--spacing) * 8)' }}>
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

