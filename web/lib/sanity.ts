import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

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
export function urlFor(source: any) {
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

// GROQ query to fetch all testimonials (for hero section carousel)
export const heroTestimonialsQuery = `*[_type == "testimonial"] | order(order asc) {
  _id,
  _type,
  testimonialShort,
  testimonialLong,
  person,
  role,
  company,
  personPhoto {
    _type,
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

// GROQ query to fetch sections
export const sectionsQuery = `*[_type == "section"] | order(order asc) {
  _id,
  _type,
  sectionTitle,
  order,
  blocks[] {
    _key,
    backgroundColor,
    content[] {
      _type,
      _key,
      title,
      text,
      items[] {
        label,
        price
      },
      listItems,
      showBullets,
      columns[] {
        title,
        items
      },
      url
    }
  }
}`

