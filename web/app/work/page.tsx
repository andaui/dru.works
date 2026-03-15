import Header from "@/components/Header";
import HomeProjectCard from "@/components/HomeProjectCard";
import { client, featuredWorkQuery, navigationPagesQuery, urlFor, worksPageProjectsQuery } from "@/lib/sanity";

function processOneMedia(media: any, fallbackTitle: string): { url: string; alt: string; type: "image" | "video" } | null {
  if (!media) return null;
  if (media._type === "image" && media.asset) {
    try {
      const imageUrl = urlFor(media)
        .width(1692)
        .height(1246)
        .fit("crop")
        .quality(90)
        .format("jpg")
        .url();
      return { url: imageUrl, alt: media.alt || fallbackTitle || "Project image", type: "image" };
    } catch {
      if (media.asset?.url) {
        return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project image", type: "image" };
      }
    }
  }
  if (media._type === "file" && media.asset?.mimeType?.startsWith?.("video/") && media.asset?.url) {
    return { url: media.asset.url, alt: media.alt || fallbackTitle || "Project video", type: "video" };
  }
  return null;
}

function toWorkWithMedia(item: any): { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null } {
  const title = item.projectTitle || "Project";
  if (item.images?.length) {
    const processed: Array<{ url: string; alt: string; type: "image" | "video" }> = [];
    item.images.forEach((media: any) => {
      const one = processOneMedia(media, title);
      if (one) processed.push(one);
    });
    const coverFromSchema = item.cover?.[0] ? processOneMedia(item.cover[0], title) : null;
    return { item, cover: coverFromSchema ?? processed[0] ?? null };
  }
  const coverFromSchema = item.cover?.[0] ? processOneMedia(item.cover[0], title) : null;
  return { item, cover: coverFromSchema ?? null };
}

async function getNavigationPages() {
  try {
    return await client.fetch(navigationPagesQuery);
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function WorkPage() {
  const [navigationPages, worksPageData, allFeaturedWorkFallback] = await Promise.all([
    getNavigationPages(),
    client.fetch(worksPageProjectsQuery).then((r: any) => r || null),
    client.fetch(featuredWorkQuery).then((r: any[]) => r || []),
  ]);

  // Flatten Works Page Projects (same schema shape as Homepage Work) into one ordered list for the grid.
  const filterMotion = (w: any) => (w.projectTitle || "").trim().toLowerCase() !== "motion studies";
  let orderedItems: any[];

  if (worksPageData?.featuredTwoCol?.length || worksPageData?.featuredMain || worksPageData?.gridItems?.length) {
    const twoCol = (worksPageData.featuredTwoCol || []).filter(Boolean);
    const main = worksPageData.featuredMain ? [worksPageData.featuredMain] : [];
    const grid = (worksPageData.gridItems || []).filter(Boolean);
    orderedItems = [...twoCol, ...main, ...grid];
  } else {
    orderedItems = allFeaturedWorkFallback;
  }

  const projects = orderedItems
    .filter(filterMotion)
    .map(toWorkWithMedia);

  return (
    <div className="relative w-full max-w-[1900px] mx-auto bg-background min-h-screen pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" navigationPages={navigationPages} />

      {/* All projects in 4-col grid */}
      <div className="w-full min-w-0 px-[2.5%] sm:px-[24px] pt-[120px]">
        {projects.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[52px]">
            {projects.map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }) => (
              <HomeProjectCard
                key={item._id}
                cover={cover}
                variant="grid"
                title={item.projectTitle}
                href={item.slug ? `/work/${item.slug}` : null}
                comingSoon={item.comingSoon}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted text-sm">No projects found.</div>
        )}
      </div>
    </div>
  );
}
