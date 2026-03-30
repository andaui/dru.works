/**
 * Parses Sanity `section` documents from the Services page for the home hero
 * (pricing-style rows + media).
 */

export type ServicesHomeSectionParsed = {
  _id: string;
  order: number;
  sectionTitle: string;
  /** Text blocks in document order */
  descriptionTexts: string[];
  /** Each listItems block keeps its own group */
  listItemGroups: string[][];
  featuredImage?: {
    kind: "image" | "video";
    url: string;
    alt: string;
    /** From Sanity asset metadata — used for correct aspect with Next/Image. */
    width?: number;
    height?: number;
  };
};

type BlockContentItem = {
  _type?: string;
  text?: string;
  title?: string;
  items?: unknown;
  showBullets?: boolean;
};

function readDimensions(asset: {
  metadata?: { dimensions?: { width?: number; height?: number } };
} | null | undefined): { width?: number; height?: number } {
  const d = asset?.metadata?.dimensions;
  const w = d?.width;
  const h = d?.height;
  return {
    width: typeof w === "number" && w > 0 ? w : undefined,
    height: typeof h === "number" && h > 0 ? h : undefined,
  };
}

function extractFeaturedImage(section: {
  featuredImage?: {
    type?: string;
    image?: {
      asset?: {
        url?: string;
        metadata?: { dimensions?: { width?: number; height?: number } };
      };
      alt?: string | null;
    };
    video?: {
      asset?: {
        url?: string;
        metadata?: { dimensions?: { width?: number; height?: number } };
      };
    };
  };
}): ServicesHomeSectionParsed["featuredImage"] | undefined {
  const fi = section.featuredImage;
  if (!fi) return undefined;
  if (fi.type === "image" && fi.image?.asset?.url) {
    const { width, height } = readDimensions(fi.image.asset);
    return {
      kind: "image",
      url: fi.image.asset.url,
      alt: (fi.image.alt && String(fi.image.alt).trim()) || "",
      width,
      height,
    };
  }
  if (fi.type === "video" && fi.video?.asset?.url) {
    const { width, height } = readDimensions(fi.video.asset);
    return {
      kind: "video",
      url: fi.video.asset.url,
      alt: "",
      width,
      height,
    };
  }
  return undefined;
}

export function parseServicesSectionForHome(
  section: Record<string, unknown>,
): ServicesHomeSectionParsed | null {
  if (!section || section._type !== "section") return null;
  const _id = typeof section._id === "string" ? section._id : "";
  const sectionTitle =
    typeof section.sectionTitle === "string" ? section.sectionTitle : "";
  const order =
    typeof section.order === "number" && Number.isFinite(section.order)
      ? section.order
      : 0;

  const descriptionTexts: string[] = [];
  const listItemGroups: string[][] = [];

  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const content = Array.isArray((block as { content?: unknown }).content)
      ? (block as { content: BlockContentItem[] }).content
      : [];
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const t = item._type;
      if (t === "textContent" && item.text && String(item.text).trim()) {
        descriptionTexts.push(String(item.text).trim());
      }
      if (t === "listItems" && Array.isArray(item.items) && item.items.length) {
        const strings = item.items.filter(
          (x): x is string => typeof x === "string" && x.trim().length > 0,
        );
        if (strings.length) listItemGroups.push(strings);
      }
    }
  }

  const featuredImage = extractFeaturedImage(
    section as {
      featuredImage?: {
        type?: string;
        image?: {
          asset?: {
            url?: string;
            metadata?: { dimensions?: { width?: number; height?: number } };
          };
          alt?: string | null;
        };
        video?: {
          asset?: {
            url?: string;
            metadata?: { dimensions?: { width?: number; height?: number } };
          };
        };
      };
    },
  );

  return {
    _id: _id || sectionTitle,
    order,
    sectionTitle,
    descriptionTexts,
    listItemGroups,
    featuredImage,
  };
}

export function parseServicesPageSectionsForHome(
  sections: unknown[] | null | undefined,
): ServicesHomeSectionParsed[] {
  if (!Array.isArray(sections)) return [];
  const out: ServicesHomeSectionParsed[] = [];
  for (const s of sections) {
    if (!s || typeof s !== "object") continue;
    const doc = s as Record<string, unknown>;
    if (doc._type !== "section") continue;
    const parsed = parseServicesSectionForHome(doc);
    if (parsed) out.push(parsed);
  }
  return out.sort((a, b) => a.order - b.order);
}
