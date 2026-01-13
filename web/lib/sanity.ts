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

// GROQ query to fetch all spotlight items
export const spotlightQuery = `*[_type == "spotlight"] | order(order asc) {
  _id,
  _type,
  title,
  order,
  media {
    type,
    image {
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
    },
    video {
      asset-> {
        _id,
        _type,
        url,
        mimeType
      }
    }
  }
}`

// GROQ query to fetch sections (legacy - kept for backward compatibility)
export const sectionsQuery = `*[_type == "section"] | order(order asc) {
  _id,
  _type,
  sectionTitle,
  order,
  blocks[] {
    _key,
    backgroundColor,
    maxWidth780,
    maxWidth980,
    content[] {
      _type,
      _key,
      title,
      text,
      items[] {
        label,
        price
      },
      items,
      showBullets,
      columns[] {
        title,
        items
      },
      url,
      alt,
      videoFile {
        asset-> {
          url,
          _id
        }
      },
      logos[] {
        _key,
        logo {
          asset-> {
            url
          },
          alt
        },
        companyName
      }
    }
  },
  featuredImage {
    image {
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
    },
    text
  }
}`

// Query to get full page data including hero fields and sections for a specific page by slug
export const pageDataQuery = (slug: string) => `*[_type == "page" && slug.current == "${slug}"][0] {
  _id,
  _type,
  heroTitle,
  heroDescription,
  sections[]-> {
    _id,
    _type,
    // Section fields
    sectionTitle,
    blocks[] {
      _key,
      backgroundColor,
      maxWidth780,
      maxWidth980,
      content[] {
        _type,
        _key,
        title,
        text,
        items[] {
          label,
          price
        },
        items,
        showBullets,
        columns[] {
          title,
          items
        },
        url,
        alt,
        videoFile {
          asset-> {
            url,
            _id
          }
        },
        logos[] {
          _key,
          logo {
            asset-> {
              url
            },
            alt
          },
          companyName
        }
      }
    },
    featuredImage {
      image {
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
      },
      text
    },
    // Testimonial fields
    testimonialShort,
    testimonialLong,
    person,
    role,
    company,
    personPhoto {
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
  }
}`

// Query to get sections and testimonials for a specific page by slug
// Items are returned in the order they appear in the array (maintained by drag-and-drop)
export const pageSectionsQuery = (slug: string) => `*[_type == "page" && slug.current == "${slug}"][0].sections[]-> {
  _id,
  _type,
  // Section fields
  sectionTitle,
  blocks[] {
    _key,
    backgroundColor,
    maxWidth780,
    maxWidth980,
    content[] {
      _type,
      _key,
      title,
      text,
      items[] {
        label,
        price
      },
      items,
      showBullets,
      columns[] {
        title,
        items
      },
      url,
      alt,
      videoFile {
        asset-> {
          url,
          _id
        }
      },
      logos[] {
        _key,
        logo {
          asset-> {
            url
          },
          alt
        },
        companyName
      }
    }
  },
  featuredImage {
    image {
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
    },
    text
  },
  // Testimonial fields
  testimonialShort,
  testimonialLong,
  person,
  role,
  company,
  personPhoto {
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

