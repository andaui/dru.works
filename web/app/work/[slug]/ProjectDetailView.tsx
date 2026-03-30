import HomeProjectCard from "@/components/HomeProjectCard";
import ProjectSectionTwoCol50 from "@/components/project/ProjectSectionTwoCol50";
import ProjectSectionTwoCol30 from "@/components/project/ProjectSectionTwoCol30";
import ProjectSectionOneCol from "@/components/project/ProjectSectionOneCol";
import ProjectSectionText from "@/components/project/ProjectSectionText";
import ProjectSectionWhatIDidOutcomes from "@/components/project/ProjectSectionWhatIDidOutcomes";
import ProjectSectionSpacer from "@/components/project/ProjectSectionSpacer";
import PageTestimonial from "@/components/PageTestimonial";
import { client, projectBySlugQuery, featuredWorkQuery, urlFor } from "@/lib/sanity";
import { resolveProjectMedia } from "@/lib/projectMedia";
import { notFound } from "next/navigation";
import { Fragment } from "react";

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
  return client.fetch(projectBySlugQuery, { slug });
}

export default async function ProjectDetailView({ slug }: { slug: string }) {
  const [project, allWork] = await Promise.all([
    getProject(slug),
    client.fetch(featuredWorkQuery).then((r: any[]) => r || []),
  ]);

  if (!project) notFound();

  const firstWhatIDid = (project.sections || []).find(
    (s: any) => s?._type === "projectSectionWhatIDidOutcomes",
  ) as
    | {
        whatIDidTitle?: string | null;
        whatIDidText?: string | null;
      }
    | undefined;

  const remainingProjects = allWork
    .filter((w: any) => w._id !== project._id && w.slug !== slug)
    .filter((w: any) => (w.projectTitle || "").trim().toLowerCase() !== "motion studies")
    .map(toWorkWithMedia);

  const description =
    (project.projectDescriptionLong && String(project.projectDescriptionLong).trim()) ||
    (project.projectDescriptionShort && String(project.projectDescriptionShort).trim()) ||
    "";

  const whatIDidTitle = (firstWhatIDid?.whatIDidTitle || "What I did").trim();
  const whatIDidLines = String(firstWhatIDid?.whatIDidText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const fallbackAlt = (project.projectTitle || "").trim() || "Project";
  const clientName = (project.client || "").trim();

  return (
    <>
      {/* Project intro (Figma frame): description first, full width; no title in modal/page shell. */}
      {description ? (
        <div className="w-full pt-[50px]">
          <p className="font-soehne font-normal text-[30px] sm:text-[39px] leading-[37px] sm:leading-[45px] tracking-[-0.25px] text-black dark:text-white m-0 w-full">
            {description}
          </p>
        </div>
      ) : null}

      {(whatIDidLines.length > 0 || clientName) ? (
        <div className="w-full mt-[80px]">
          <div className="grid grid-cols-12 gap-x-[34px] gap-y-10 w-full items-start">
            <div className="col-span-12 lg:col-span-10 min-w-0">
              <div className="font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[29px] tracking-[-0.25px]">
                <p className="m-0 text-black/50 dark:text-white/50">{whatIDidTitle}</p>
                {whatIDidLines.length > 0 ? (
                  <div className="mt-[10px] flex flex-col gap-1 text-black dark:text-white">
                    {whatIDidLines.map((line, i) => (
                      <p key={i} className="m-0">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {clientName ? (
              <div className="col-span-12 lg:col-span-2 min-w-0">
                <div className="pt-1">
                  <p className="m-0 font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-black dark:text-white">
                    Client
                  </p>
                  <div className="h-px w-full bg-border mt-1" aria-hidden />
                  <p className="m-0 pt-1 font-soehne font-normal text-[20px] sm:text-[24px] leading-[32px] sm:leading-[37px] tracking-[-0.25px] text-black/50 dark:text-white/50">
                    {clientName}
                  </p>
                  <div className="h-px w-full bg-border mt-1" aria-hidden />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Keep media-heavy sections constrained, while intro remains full width. */}
      <div className="w-full max-w-[1900px] mx-auto mt-[115px]">
        <div className="w-full min-w-0 flex flex-col gap-6">
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
                  <div key={section._key} className="w-full min-w-0 mt-[100px] mb-[100px] md:mt-0 md:mb-0">
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
                return <ProjectSectionSpacer key={section._key} height={section.height || "24"} />;
              case "projectSectionTestimonial":
                return section.testimonial ? (
                  <Fragment key={section._key}>
                    <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2 mt-[128px]" />
                    <div className="w-full min-w-0 mt-[75px] flex flex-col gap-0">
                      <PageTestimonial testimonial={section.testimonial} contained hideTopLine />
                    </div>
                    <div className="w-screen h-px bg-border relative left-1/2 -translate-x-1/2 mt-[75px] mb-[128px]" />
                  </Fragment>
                ) : null;
              default:
                return null;
            }
          })}
        </div>

        {remainingProjects.length > 0 && (
          <div className="w-full min-w-0 mt-[40px] lg:mt-[80px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[52px]">
              {remainingProjects.map(({ item, cover }: { item: any; cover: { url: string; alt: string; type: "image" | "video" } | null }) => (
                <HomeProjectCard
                  key={item._id}
                  cover={cover}
                  variant="grid"
                  title={item.projectTitle}
                  creative={item.creative ?? null}
                  href={item.slug ? `/work/${item.slug}` : null}
                  comingSoon={item.comingSoon}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
