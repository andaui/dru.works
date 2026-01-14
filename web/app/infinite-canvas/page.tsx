import { InfiniteCanvasClient } from "@/components/infinite-canvas/InfiniteCanvasClient";
import { client, infiniteCanvasImagesQuery, urlFor } from "@/lib/sanity";
import type { MediaItem } from "@/components/infinite-canvas/types";

async function getInfiniteCanvasImages(): Promise<MediaItem[]> {
  try {
    const workItems = await client.fetch(infiniteCanvasImagesQuery);
    
    // Flatten all images from all featured work items
    const allImages: MediaItem[] = [];
    
    workItems.forEach((item: any) => {
      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((image: any) => {
          // Only process image assets, skip videos
          if (image.asset && image.asset.url) {
            // Check if it's actually an image (not a video)
            const mimeType = image.asset.mimeType || '';
            const isVideo = mimeType.startsWith('video/') || image.asset.url.includes('.mp4') || image.asset.url.includes('.webm');
            
            if (isVideo) {
              // Skip video files - the infinite canvas only supports images
              return;
            }
            
            // Only process if it's an image type or has image metadata
            if (image._type === 'image' || image.asset.metadata?.dimensions) {
              // Use the base asset URL directly to avoid issues with rect/crop parameters
              // Three.js can handle the images directly from Sanity CDN
              if (image.asset?.url && !image.asset.url.includes('.mp4') && !image.asset.url.includes('.webm')) {
                // Use the raw asset URL without any query parameters
                // Proxy through Next.js API route to avoid CORS issues
                const baseUrl = image.asset.url.split('?')[0];
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                
                const width = image.asset.metadata?.dimensions?.width || 1024;
                const height = image.asset.metadata?.dimensions?.height || 1024;
                
                allImages.push({
                  url: proxiedUrl,
                  width,
                  height,
                });
              }
            }
          }
        });
      }
    });
    
    return allImages;
  } catch (error) {
    console.error('Error fetching infinite canvas images:', error);
    return [];
  }
}

export default async function InfiniteCanvasPage() {
  const media = await getInfiniteCanvasImages();
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <InfiniteCanvasClient 
        media={media} 
        showControls={true}
        backgroundColor="#ffffff"
        fogColor="#ffffff"
      />
    </div>
  );
}

