import { InfiniteCanvasClient } from "@/components/infinite-canvas/InfiniteCanvasClient";
import { client, infiniteCanvasMediaQuery, urlFor } from "@/lib/sanity";
import type { MediaItem } from "@/components/infinite-canvas/types";

async function getInfiniteCanvasMedia(): Promise<MediaItem[]> {
  try {
    const data = await client.fetch(infiniteCanvasMediaQuery);
    
    const allMedia: MediaItem[] = [];
    
    // Process featured work items
    if (data.featuredWork && Array.isArray(data.featuredWork)) {
      data.featuredWork.forEach((item: any) => {
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach((image: any) => {
            if (image.asset && image.asset.url) {
              const mimeType = image.asset.mimeType || '';
              const isVideo = mimeType.startsWith('video/') || image.asset.url.includes('.mp4') || image.asset.url.includes('.webm');
              
              if (isVideo) {
                // Include videos from featured work
                // Try to get actual video dimensions from metadata if available
                const baseUrl = image.asset.url.split('?')[0];
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                
                // Use actual dimensions if available, otherwise use common video aspect ratios
                const width = image.asset.metadata?.dimensions?.width || 1920;
                const height = image.asset.metadata?.dimensions?.height || 1080;
                
                allMedia.push({
                  url: proxiedUrl,
                  width,
                  height,
                  type: 'video',
                  autoplay: true,
                });
              } else if (image._type === 'image' || image.asset.metadata?.dimensions) {
                // Include images from featured work
                const baseUrl = image.asset.url.split('?')[0];
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                
                allMedia.push({
                  url: proxiedUrl,
                  width: image.asset.metadata?.dimensions?.width || 1024,
                  height: image.asset.metadata?.dimensions?.height || 1024,
                  type: 'image',
                });
              }
            }
          });
        }
      });
    }
    
    // Process spotlight items
    if (data.spotlight && Array.isArray(data.spotlight)) {
      data.spotlight.forEach((item: any) => {
        if (item.media) {
          if (item.media.type === 'image' && item.media.image?.asset) {
            const baseUrl = item.media.image.asset.url.split('?')[0];
            const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
            
            allMedia.push({
              url: proxiedUrl,
              width: item.media.image.asset.metadata?.dimensions?.width || 1024,
              height: item.media.image.asset.metadata?.dimensions?.height || 1024,
              type: 'image',
            });
          } else if (item.media.type === 'video' && item.media.video?.asset) {
            // Include videos from spotlight with autoplay
            const baseUrl = item.media.video.asset.url.split('?')[0];
            const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
            
            // Use actual video dimensions if available, otherwise use common video aspect ratios
            const width = item.media.video.asset.metadata?.dimensions?.width || 1920;
            const height = item.media.video.asset.metadata?.dimensions?.height || 1080;
            
            allMedia.push({
              url: proxiedUrl,
              width,
              height,
              type: 'video',
              autoplay: true,
            });
          }
        }
      });
    }
    
    // Process research items
    if (data.research && Array.isArray(data.research)) {
      data.research.forEach((item: any) => {
        if (item.media && Array.isArray(item.media)) {
          item.media.forEach((mediaItem: any) => {
            if (mediaItem.asset && mediaItem.asset.url) {
              const mimeType = mediaItem.asset.mimeType || '';
              const isVideo = mimeType.startsWith('video/') || mediaItem.asset.url.includes('.mp4') || mediaItem.asset.url.includes('.webm');
              
              if (isVideo) {
                // Include videos from research
                const baseUrl = mediaItem.asset.url.split('?')[0];
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                
                // Use actual dimensions if available, otherwise use common video aspect ratios
                const width = mediaItem.asset.metadata?.dimensions?.width || 1920;
                const height = mediaItem.asset.metadata?.dimensions?.height || 1080;
                
                allMedia.push({
                  url: proxiedUrl,
                  width,
                  height,
                  type: 'video',
                  autoplay: true,
                });
              } else if (mediaItem._type === 'image' || mediaItem.asset.metadata?.dimensions) {
                // Include images from research
                const baseUrl = mediaItem.asset.url.split('?')[0];
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                
                allMedia.push({
                  url: proxiedUrl,
                  width: mediaItem.asset.metadata?.dimensions?.width || 1024,
                  height: mediaItem.asset.metadata?.dimensions?.height || 1024,
                  type: 'image',
                });
              }
            }
          });
        }
      });
    }
    
    return allMedia;
  } catch (error) {
    console.error('Error fetching infinite canvas media:', error);
    return [];
  }
}

export default async function InfiniteCanvasPage() {
  const media = await getInfiniteCanvasMedia();
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <InfiniteCanvasClient 
        media={media} 
        showControls={true}
        backgroundColor="#000000"
        fogColor="#000000"
      />
    </div>
  );
}

