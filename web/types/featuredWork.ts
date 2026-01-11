/**
 * Type definition for Featured Work from Sanity
 * This matches the schema defined in schemaTypes/featuredWork.ts
 */
export interface FeaturedWork {
  _id: string;
  _type: 'featuredWork';
  projectTitle: string;
  projectDescriptionShort: string;
  projectDescriptionLong?: string | null;
  teamContribution?: string | null;
  images?: Array<{
    _type: 'image' | 'file';
    _key: string;
    asset?: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
    url?: string;
  }>;
  order?: number;
}

/**
 * Helper function to get the first image URL from a FeaturedWork
 */
export function getFeaturedWorkImageUrl(work: FeaturedWork): string | undefined {
  if (!work.images || work.images.length === 0) return undefined;
  
  const firstImage = work.images[0];
  if (firstImage._type === 'image' && firstImage.url) {
    return firstImage.url;
  }
  
  return undefined;
}

/**
 * Helper function to get the first image alt text from a FeaturedWork
 */
export function getFeaturedWorkImageAlt(work: FeaturedWork): string {
  if (!work.images || work.images.length === 0) return 'Project image';
  
  const firstImage = work.images[0];
  return firstImage.alt || work.projectTitle || 'Project image';
}

