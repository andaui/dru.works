import { urlFor } from './sanity'

export type ProjectMediaResult = { url: string; alt: string; type: 'image' | 'video' } | null

/** Resolve Sanity projectMedia object (image or video) to url + alt + type. */
export function resolveProjectMedia(media: any, fallbackAlt = 'Project media'): ProjectMediaResult {
  if (!media) return null
  if (media.type === 'image' && media.image?.asset) {
    try {
      const url = urlFor(media.image).width(2800).fit('max').quality(95).format('jpg').url()
      return { url, alt: media.image.alt || fallbackAlt, type: 'image' }
    } catch {
      if (media.image.asset?.url) {
        return { url: media.image.asset.url, alt: media.image.alt || fallbackAlt, type: 'image' }
      }
    }
  }
  if (media.type === 'video' && media.video?.asset?.url) {
    return { url: media.video.asset.url, alt: fallbackAlt, type: 'video' }
  }
  return null
}
