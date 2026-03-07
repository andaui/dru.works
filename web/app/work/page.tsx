import Header from "@/components/Header";
import HomeProjectCard from "@/components/HomeProjectCard";
import { client, featuredWorkQuery, navigationPagesQuery, urlFor } from "@/lib/sanity";

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
  const [navigationPages, allWork] = await Promise.all([
    getNavigationPages(),
    client.fetch(featuredWorkQuery).then((r: any[]) => r || []),
  ]);

  const projects = allWork
    .filter((w: any) => (w.projectTitle || "").trim().toLowerCase() !== "motion studies")
    .map(toWorkWithMedia);

  return (
    <div className="relative w-full max-w-[1900px] mx-auto bg-background min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" navigationPages={navigationPages} showBack backHref="/" />

      {/* Hero: title only, same styling as project detail */}
      <div className="w-full flex justify-start pt-[50px] pb-[100px] px-[2.5%] sm:px-[24px]">
        <div className="flex w-full max-w-[700px] flex-col items-start gap-[22px]">
          <div
            className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-foreground text-left tracking-[-0.25px]"
            style={{ letterSpacing: "-0.25px" }}
          >
            <p className="mb-0">All work</p>
          </div>
        </div>
      </div>

      {/* [n] projects above the line - same layout as Year/Client on project detail */}
      <div className="w-full flex flex-col md:flex-row justify-start md:justify-between items-start md:items-end px-[2.5%] sm:px-[24px] mb-[22px] gap-[22px] md:gap-0">
        <div className="flex flex-row gap-5 items-baseline leading-[19px] text-muted text-[12px]">
          <p className="relative shrink-0 font-normal">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      {/* Line separator (same as project detail) */}
      <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />

      {/* All projects in 4-col grid */}
      <div className="w-full min-w-0 px-[2.5%] sm:px-[24px] pt-6">
        {projects.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[52px]">
            {projects.map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }) => (
              <HomeProjectCard
                key={item._id}
                cover={cover}
                variant="grid"
                title={item.projectTitle}
                href={item.slug ? `/work/${item.slug}` : null}
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
