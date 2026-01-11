import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Sanity configuration
export const client = createClient({
  projectId: 'ta8jx0n4',
  dataset: 'production',
  useCdn: true, // Set to false if statically generating pages, using ISR or using the Sanity API CDN
  apiVersion: '2024-01-01', // Use current date (YYYY-MM-DD) to target the latest API version
})

// Set up the image URL builder
const builder = imageUrlBuilder(client)

// Helper function to build image URLs
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// GROQ query to fetch all featured work items
export const featuredWorkQuery = `*[_type == "featuredWork"] | order(order asc) {
  _id,
  _type,
  projectTitle,
  projectDescriptionShort,
  projectDescriptionLong,
  teamContribution,
  order,
  images[] {
    _type,
    _key,
    asset-> {
      _id,
      _type,
      url,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt
  }
}`

