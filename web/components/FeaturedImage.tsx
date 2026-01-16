'use client';

import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface FeaturedImageProps {
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
}

export default function FeaturedImage({ type = 'image', image, video, text }: FeaturedImageProps) {
  // Get original dimensions to calculate aspect ratio
  const maxHeight = 510;
  
  // Always use image aspect ratio if available (for consistency), otherwise use a standard ratio
  // This ensures images and videos always have the same container size
  let aspectRatio = 846 / 623; // Default to WorkFeatureCard ratio (approximately 1.358:1)
  let hasValidDimensions = false;
  
  // Calculate aspect ratio from image metadata (use this for both images and videos)
  if (image?.asset?.metadata?.dimensions) {
    const { width, height } = image.asset.metadata.dimensions;
    if (width && height && width > 0 && height > 0) {
      aspectRatio = width / height;
      hasValidDimensions = true;
    }
  }
  
  const maxWidth = Math.round(maxHeight * aspectRatio);
  
  if (type === 'image' && image?.asset) {
    let imageUrl: string | null = null;
    const imageAlt = image.alt || 'Featured image';

    try {
      // Build image URL with high resolution (2x for retina)
      imageUrl = urlFor(image)
        .width(maxWidth * 2)
        .height(maxHeight * 2)
        .fit('crop')
        .quality(90)
        .format('jpg')
        .url();
    } catch (error) {
      console.error('Error building featured image URL:', error);
      // Fallback to direct asset URL
      if (image.asset?.url) {
        imageUrl = image.asset.url;
      }
    }

    if (!imageUrl) {
      return null;
    }
    
    return (
      <div 
        className="flex flex-col gap-[12px] items-start w-full px-0 lg:px-0 shrink min-w-0 featured-image-responsive" 
        style={{ 
          '--featured-max-width': `${maxWidth}px`
        } as React.CSSProperties & { '--featured-max-width': string }}
      >
        <div 
          className="relative w-full overflow-hidden featured-image-container"
          style={{ 
            aspectRatio: `${aspectRatio}`,
            maxHeight: '510px'
          }}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover object-[50%_50%]"
            sizes="(max-width: 1024px) 100vw, 510px"
            quality={95}
          />
        </div>
        {text && (
          <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] w-full">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (type === 'video' && video?.asset) {
    const videoUrl = video.asset.url;
    if (!videoUrl) {
      return null;
    }

    // Use the same aspect ratio as images (calculated above) to ensure consistent sizing
    return (
      <div 
        className="flex flex-col gap-[12px] items-start w-full px-0 lg:px-0 shrink min-w-0 featured-image-responsive" 
        style={{ 
          '--featured-max-width': `${maxWidth}px`
        } as React.CSSProperties & { '--featured-max-width': string }}
      >
        <div 
          className="relative w-full overflow-hidden featured-image-container"
          style={{ 
            aspectRatio: `${aspectRatio}`,
            maxHeight: '510px'
          }}
        >
          <video
            src={videoUrl}
            className="object-cover object-[50%_50%] w-full h-full"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
          />
        </div>
        {text && (
          <p className="font-normal leading-[19px] not-italic text-[#5d5d5d] text-[13px] w-full">
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
}

