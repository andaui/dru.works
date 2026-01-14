import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface FeaturedImageProps {
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
  text?: string;
}

export default function FeaturedImage({ image, text }: FeaturedImageProps) {
  if (!image?.asset) {
    return null;
  }

  let imageUrl: string | null = null;
  let imageAlt = image.alt || 'Featured image';
  
  // Get original dimensions to calculate aspect ratio
  const maxHeight = 510;
  let aspectRatio = 1; // Default to square
  let originalWidth = maxHeight;
  let originalHeight = maxHeight;
  
  if (image.asset?.metadata?.dimensions) {
    const { width, height } = image.asset.metadata.dimensions;
    if (width && height) {
      originalWidth = width;
      originalHeight = height;
      aspectRatio = width / height;
    }
  }

  // Calculate max width based on max height and aspect ratio
  const maxWidth = Math.round(maxHeight * aspectRatio);

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
          aspectRatio: aspectRatio
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

