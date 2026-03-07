import Header from "@/components/Header";
import HomeProjectCard from "@/components/HomeProjectCard";
import ProjectSectionTwoCol50 from "@/components/project/ProjectSectionTwoCol50";
import ProjectSectionTwoCol30 from "@/components/project/ProjectSectionTwoCol30";
import ProjectSectionOneCol from "@/components/project/ProjectSectionOneCol";
import ProjectSectionText from "@/components/project/ProjectSectionText";
import ProjectSectionWhatIDidOutcomes from "@/components/project/ProjectSectionWhatIDidOutcomes";
import ProjectSectionSpacer from "@/components/project/ProjectSectionSpacer";
import PageTestimonial from "@/components/PageTestimonial";
import { client, projectBySlugQuery, navigationPagesQuery, featuredWorkQuery, urlFor } from "@/lib/sanity";
import { resolveProjectMedia } from "@/lib/projectMedia";
import { notFound } from "next/navigation";

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
  const processed: Array<{ url: string; alt: string; type: "image" | "video" }> = [];
  if (item.images?.length) {
    const title = item.projectTitle || "Project";
    item.images.forEach((media: any) => {
      const one = processOneMedia(media, title);
      if (one) processed.push(one);
    });
  }
  const title = item.projectTitle || "Project";
  const coverFromSchema = item.cover?.[0] ? processOneMedia(item.cover[0], title) : null;
  return { item, cover: coverFromSchema ?? processed[0] ?? null };
}

async function getProject(slug: string) {
  const project = await client.fetch(projectBySlugQuery, { slug });
  return project;
}

async function getNavigationPages() {
  try {
    return await client.fetch(navigationPagesQuery);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: `${project.projectTitle} | Work` };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, navigationPages, allWork] = await Promise.all([
    getProject(slug),
    getNavigationPages(),
    client.fetch(featuredWorkQuery).then((r: any[]) => r || []),
  ]);

  if (!project) notFound();

  const remainingProjects = allWork
    .filter((w: any) => w._id !== project._id && w.slug !== slug)
    .filter((w: any) => (w.projectTitle || "").trim().toLowerCase() !== "motion studies")
    .map(toWorkWithMedia);

  const title = project.projectTitle || "";
  const description = project.projectDescriptionShort || "";
  const fallbackAlt = title || "Project";

  return (
    <div className="relative w-full bg-background min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" navigationPages={navigationPages} showBack />

      <div className="max-w-[1900px] mx-auto w-full">
      {/* Hero: title + description, same styling as homepage but left-aligned */}
      <div className="w-full flex justify-start pt-[50px] pb-[100px] px-[2.5%] sm:px-[24px]">
        <div className="flex w-full max-w-[700px] flex-col items-start gap-[22px]">
          <div
            className="relative shrink-0 min-w-full w-[min-content] font-medium text-[40px] leading-[47px] not-italic text-foreground text-left tracking-[-0.25px]"
            style={{ letterSpacing: "-0.25px" }}
          >
            {title.split("\n").map((line: string, index: number) => (
              <p key={index} className="mb-0">
                {line}
              </p>
            ))}
          </div>
          <p className="relative w-full font-normal text-[13px] leading-[19px] not-italic text-muted text-left m-0">
            {description}
          </p>
        </div>
      </div>

      {/* Year (left) and Client (right) above the line - label and value side by side with 20px gap */}
      {(project.year != null && project.year !== "") || (project.client != null && project.client !== "") ? (
        <div className="w-full flex flex-col md:flex-row justify-start md:justify-between items-start md:items-end px-[2.5%] sm:px-[24px] mb-[22px] gap-[22px] md:gap-0">
          <div className="flex flex-row gap-5 items-baseline leading-[19px] text-muted text-[12px]">
            {project.year != null && project.year !== "" && (
              <>
                <p className="relative shrink-0 font-normal">Year</p>
                <p className="relative shrink-0 font-normal">{project.year}</p>
              </>
            )}
          </div>
          <div className="flex flex-row gap-5 items-baseline leading-[19px] text-muted text-[12px]">
            {project.client != null && project.client !== "" && (
              <>
                <p className="relative shrink-0 font-normal">Client</p>
                <p className="relative shrink-0 font-normal">{project.client}</p>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Line separator (same as homepage) */}
      <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2" />

      {/* Sections: 24px gap between each; min-w-0 so content respects right padding */}
      <div className="w-full min-w-0 px-[2.5%] sm:px-[24px] pt-6 flex flex-col gap-6">
        {(project.sections || []).map((section: any) => {
          if (!section?._key) return null;
          switch (section._type) {
            case "projectSectionTwoCol50":
              return (
                <div key={section._key} className="w-full min-w-0">
                  <ProjectSectionTwoCol50
                  leftMedia={resolveProjectMedia(section.leftMedia, fallbackAlt)}
                  rightMedia={resolveProjectMedia(section.rightMedia, fallbackAlt)}
                />
                </div>
              );
            case "projectSectionTwoCol30":
              return (
                <div key={section._key} className="w-full min-w-0">
                  <ProjectSectionTwoCol30
                    ratio={section.ratio === "40-60" ? "40-60" : section.ratio === "35-65" ? "35-65" : "30-70"}
                    narrowSide={section.narrowSide === "right" ? "right" : "left"}
                    leftMedia={resolveProjectMedia(section.leftMedia, fallbackAlt)}
                    rightMedia={resolveProjectMedia(section.rightMedia, fallbackAlt)}
                  />
                </div>
              );
            case "projectSectionOneCol":
              return (
                <div key={section._key} className="w-full min-w-0">
                  <ProjectSectionOneCol
                    width={section.width === "70" ? "70" : section.width === "40" ? "40" : "100"}
                    media={resolveProjectMedia(section.media, fallbackAlt)}
                  />
                </div>
              );
            case "projectSectionText":
              return (
                <div key={section._key} className="w-full min-w-0">
                  <ProjectSectionText text={section.text || ""} />
                </div>
              );
            case "projectSectionWhatIDidOutcomes":
              return (
                <div key={section._key} className="w-full min-w-0">
                  <ProjectSectionWhatIDidOutcomes
                    whatIDidTitle={section.whatIDidTitle}
                    whatIDidText={section.whatIDidText}
                    outcomesTitle={section.outcomesTitle}
                    outcomesText={section.outcomesText}
                  />
                </div>
              );
            case "projectSectionSpacer":
              return (
                <ProjectSectionSpacer key={section._key} height={section.height || "24"} />
              );
            case "projectSectionTestimonial":
              return section.testimonial ? (
                <div key={section._key} className="w-full min-w-0 my-[128px] flex flex-col gap-0">
                  <PageTestimonial testimonial={section.testimonial} contained />
                  <div className="w-screen relative left-1/2 -translate-x-1/2 mt-[75px]">
                    <div className="h-px bg-border" />
                  </div>
                </div>
              ) : null;
            default:
              return null;
          }
        })}
      </div>

      {/* 4-col grid: remaining projects (excluding current) */}
      {remainingProjects.length > 0 && (
        <>
          <div className="w-full min-w-0 px-[2.5%] sm:px-[24px] mt-[40px] lg:mt-[80px]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[52px]">
              {remainingProjects.map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }) => (
                <HomeProjectCard
                  key={item._id}
                  cover={cover}
                  variant="grid"
                  title={item.projectTitle}
                  href={item.slug ? `/work/${item.slug}` : null}
                />
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
