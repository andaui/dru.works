import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

// Set crossOrigin for loading external images (required for Sanity CDN)
loader.setCrossOrigin('anonymous');

const isTextureLoaded = (tex: THREE.Texture): boolean => {
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

  // Create a new loader instance for this texture to ensure crossOrigin is set
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
      // Remove from cache on error so it can be retried
      textureCache.delete(key);
      loadCallbacks.delete(key);
      
      // Notify callbacks of failure
      loadCallbacks.get(key)?.forEach((cb) => {
        // Create a placeholder texture or handle error
        try {
          // You could create a 1x1 transparent texture as fallback
          const placeholder = new THREE.Texture();
          cb(placeholder);
        } catch (callbackErr) {
          console.error('Error in failure callback:', callbackErr);
        }
      });
      loadCallbacks.delete(key);
    }
  );

  // crossOrigin is set on the loader, which applies to the image element
  // No need to set it on the texture object itself
  textureCache.set(key, texture);
  return texture;
};

