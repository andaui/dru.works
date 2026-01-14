import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

// Set crossOrigin for loading external images (required for Sanity CDN)
loader.setCrossOrigin('anonymous');

const isTextureLoaded = (tex: THREE.Texture): boolean => {
  if (tex instanceof THREE.VideoTexture) {
    const video = tex.image as HTMLVideoElement;
    return video.readyState >= 2; // HAVE_CURRENT_DATA
  }
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export const getTexture = (item: MediaItem, onLoad?: (texture: THREE.Texture) => void): THREE.Texture => {
  const key = item.url;
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  // Handle videos differently from images
  if (item.type === 'video') {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = item.autoplay !== false; // Default to autoplay for videos
    video.preload = 'auto';
    
    video.src = key;
    
    // Create video texture immediately (it will update when video loads)
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.wrapS = THREE.ClampToEdgeWrapping;
    videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    videoTexture.flipY = true; // Default for Three.js textures
    
    video.addEventListener('loadeddata', () => {
      // Start playing if autoplay is enabled
      if (item.autoplay !== false) {
        video.play().catch((err) => {
          console.error('Error playing video:', err);
        });
      }
      
      // Notify callbacks that video is ready
      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          cb(videoTexture);
        } catch (err) {
          console.error(`Callback failed: ${JSON.stringify(err)}`);
        }
      });
      loadCallbacks.delete(key);
    });
    
    video.addEventListener('canplay', () => {
      // Video is ready to play
      videoTexture.needsUpdate = true;
    });
    
    video.addEventListener('error', (err) => {
      console.error("Video load failed:", key, err);
      textureCache.delete(key);
      loadCallbacks.delete(key);
      
      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          const placeholder = new THREE.Texture();
          cb(placeholder);
        } catch (callbackErr) {
          console.error('Error in failure callback:', callbackErr);
        }
      });
      loadCallbacks.delete(key);
    });
    
    // Store the video texture immediately (it will update as video loads)
    textureCache.set(key, videoTexture);
    return videoTexture;
  }

  // Handle images
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  const texture = textureLoader.load(
    key,
    (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.flipY = true; // Default for Three.js textures (prevents upside down)
      tex.needsUpdate = true;

      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          cb(tex);
        } catch (err) {
          console.error(`Callback failed: ${JSON.stringify(err)}`);
        }
      });
      loadCallbacks.delete(key);
    },
    undefined,
    (err) => {
      console.error("Texture load failed:", key, err);
      textureCache.delete(key);
      loadCallbacks.delete(key);
      
      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          const placeholder = new THREE.Texture();
          cb(placeholder);
        } catch (callbackErr) {
          console.error('Error in failure callback:', callbackErr);
        }
      });
      loadCallbacks.delete(key);
    }
  );

  textureCache.set(key, texture);
  return texture;
};

