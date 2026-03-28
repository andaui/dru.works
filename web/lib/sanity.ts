import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// Sanity configuration
export const client = createClient({
  projectId: 'ta8jx0n4',
  dataset: 'production',
  useCdn: true, // Set to false if statically generating pages, using ISR or using the Sanity API CDN
  apiVersion: '2024-01-01', // Use current date (YYYY-MM-DD) to target the latest API version
})

// Set up the image URL builder
const builder = createImageUrlBuilder(client)

// Helper function to build image URLs
export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ query to fetch navigation pages (work, about, services)
export const navigationPagesQuery = `*[_type == "page" && slug.current in ["work", "about", "services"]] {
  _id,
  title,
  "slug": slug.current
}`

// Fragment for featuredWork fields (cover, images, etc.) so we can reuse in queries
const featuredWorkFields = `_id,
  _type,
  projectTitle,
  comingSoon,
  projectDescriptionShort,
  projectDescriptionLong,
  teamContribution,
  creative,
  order,
  "slug": slug.current,
  cover[] {
    _type,
    _key,
    asset-> {
      _id,
      _type,
      url,
      mimeType,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt
  },
  images[] {
    _type,
    _key,
    asset-> {
      _id,
      _type,
      url,
      mimeType,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    alt
  }`

// GROQ query to fetch all featured work items
export const featuredWorkQuery = `*[_type == "featuredWork"] | order(order asc) {
  ${featuredWorkFields}
}`

// Fragment for projectMedia (image or video) used in project detail sections
const projectMediaFields = `_type,
  type,
  image {
    _type,
    asset-> { _id, _type, url, metadata { dimensions { width, height } } },
    alt
  },
  video {
    asset-> { _id, _type, url, mimeType }
  }`

// GROQ query to fetch a single featured work (project) by slug for the project details page
export const projectBySlugQuery = `*[_type == "featuredWork" && slug.current == $slug][0] {
  _id,
  _type,
  projectTitle,
  comingSoon,
  projectDescriptionShort,
  projectDescriptionLong,
  year,
  client,
  "slug": slug.current,
  sections[] {
    _key,
    _type,
    _type == "projectSectionTwoCol50" => {
      leftMedia { ${projectMediaFields} },
      rightMedia { ${projectMediaFields} }
    },
    _type == "projectSectionTwoCol30" => {
      ratio,
      narrowSide,
      leftMedia { ${projectMediaFields} },
      rightMedia { ${projectMediaFields} }
    },
    _type == "projectSectionOneCol" => {
      width,
      media { ${projectMediaFields} }
    },
    _type == "projectSectionText" => { text },
    _type == "projectSectionWhatIDidOutcomes" => {
      whatIDidTitle,
      whatIDidText,
      outcomesTitle,
      outcomesText
    },
    _type == "projectSectionSpacer" => { height },
    _type == "projectSectionTestimonial" => {
      testimonial-> {
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
            metadata { dimensions { width, height } }
          },
          alt
        }
      }
    }
  }
}`

// Homepage Work singleton: 2-col row, main 70%, grid, below-logos project. Order = array order.
export const homepageWorkQuery = `*[_type == "homepageWork"][0] {
  _id,
  "featuredTwoCol": featuredTwoCol[]-> { ${featuredWorkFields} },
  "featuredMain": featuredMain-> { ${featuredWorkFields} },
  "gridItems": gridItems[]-> { ${featuredWorkFields} },
  "belowLogosProject": belowLogosProject-> { ${featuredWorkFields} }
}`

// Works Page Projects: same shape as Homepage Work (2-col, main, grid) for /work page.
export const worksPageProjectsQuery = `*[_type == "worksPageProjects"][0] {
  _id,
  "featuredTwoCol": featuredTwoCol[]-> { ${featuredWorkFields} },
  "featuredMain": featuredMain-> { ${featuredWorkFields} },
  "gridItems": gridItems[]-> { ${featuredWorkFields} }
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

/** Singleton `pricingAndDesigners` — homepage calculator amounts + stripe images */
export const pricingAndDesignersQuery = `*[_type == "pricingAndDesigners" && _id == "pricingAndDesigners"][0] {
  baseMonthlyLead,
  rateAdditional1,
  rateAdditional2,
  rateAdditional3Plus,
  maxTeamSize,
  moreInfoTitle,
  moreInfoDescription,
  druPortrait {
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
    }
  },
  additionalDesignerPhotos[] {
    _key,
    photo {
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
      }
    }
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
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
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
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    },
    text
  }
}`

// Query to get full page data including hero fields and sections for a specific page by slug
export const pageDataQuery = (slug: string) => `*[_type == "page" && slug.current == "${slug}"][0] {
  _id,
  _type,
  title,
  heroTitle,
  heroDescription,
  sections[]-> {
    _id,
    _type,
    // Featured Work fields
    projectTitle,
    comingSoon,
    projectDescriptionShort,
    projectDescriptionLong,
    teamContribution,
    creative,
    order,
    cover[] {
      _type,
      _key,
      asset-> {
        _id,
        _type,
        url,
        mimeType,
        metadata { dimensions { width, height } }
      },
      alt
    },
    images[] {
      _type,
      _key,
      asset-> {
        _id,
        _type,
        url,
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
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
          mimeType,
          metadata {
            dimensions {
              width,
              height
            }
          }
        }
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

// GROQ query to fetch clients section and extract logos
export const clientsSectionQuery = `*[_type == "section" && sectionTitle == "Clients"][0] {
  _id,
  sectionTitle,
  blocks[] {
    content[] {
      _type,
      _key,
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
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
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

// GROQ query to fetch images and videos for infinite canvas
// This fetches all media from featuredWork items, spotlight items, and research items
export const infiniteCanvasMediaQuery = `{
  "featuredWork": *[_type == "featuredWork"] {
    images[] {
      _type,
      asset-> {
        _id,
        _type,
        _ref,
        url,
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt
    }
  },
  "spotlight": *[_type == "spotlight"] {
    media {
      type,
      image {
        asset-> {
          _id,
          _type,
          url,
          mimeType,
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
          mimeType,
          metadata {
            dimensions {
              width,
              height
            }
          }
        }
      }
    }
  },
  "research": *[_type == "research"] {
    media[] {
      _type,
      asset-> {
        _id,
        _type,
        _ref,
        url,
        mimeType,
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

