import Header from "@/components/Header";
import ProjectSectionTwoCol50 from "@/components/project/ProjectSectionTwoCol50";
import ProjectSectionTwoCol30 from "@/components/project/ProjectSectionTwoCol30";
import ProjectSectionOneCol from "@/components/project/ProjectSectionOneCol";
import ProjectSectionText from "@/components/project/ProjectSectionText";
import ProjectSectionWhatIDidOutcomes from "@/components/project/ProjectSectionWhatIDidOutcomes";
import PageTestimonial from "@/components/PageTestimonial";
import { client, projectBySlugQuery, navigationPagesQuery } from "@/lib/sanity";
import { resolveProjectMedia } from "@/lib/projectMedia";
import { notFound } from "next/navigation";

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
  const [project, navigationPages] = await Promise.all([
    getProject(slug),
    getNavigationPages(),
  ]);

  if (!project) notFound();

  const title = project.projectTitle || "";
  const description = project.projectDescriptionShort || "";
  const fallbackAlt = title || "Project";

  return (
    <div className="relative w-full bg-background min-h-screen overflow-x-hidden pb-[40px] lg:pb-[200px] px-[2.5%] sm:px-0">
      <Header currentPage="work" navigationPages={navigationPages} />

      {/* Hero: title + description, same styling as homepage but left-aligned */}
      <div className="w-full flex justify-start pt-[30px] pb-[76px] lg:pt-[120px] lg:pb-[156px] px-[2.5%] sm:px-[24px]">
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

      {/* Line separator (same as homepage) */}
      <div className="w-screen h-px bg-border -ml-[2.5%] sm:ml-0 sm:w-full" />

      {/* Sections: 24px gap between each */}
      <div className="w-full px-[2.5%] sm:px-[24px] pt-6 flex flex-col gap-6">
        {(project.sections || []).map((section: any) => {
          if (!section?._key) return null;
          switch (section._type) {
            case "projectSectionTwoCol50":
              return (
                <ProjectSectionTwoCol50
                  key={section._key}
                  leftMedia={resolveProjectMedia(section.leftMedia, fallbackAlt)}
                  rightMedia={resolveProjectMedia(section.rightMedia, fallbackAlt)}
                />
              );
            case "projectSectionTwoCol30":
              return (
                <ProjectSectionTwoCol30
                  key={section._key}
                  ratio={section.ratio === "40-60" ? "40-60" : section.ratio === "35-65" ? "35-65" : "30-70"}
                  narrowSide={section.narrowSide === "right" ? "right" : "left"}
                  leftMedia={resolveProjectMedia(section.leftMedia, fallbackAlt)}
                  rightMedia={resolveProjectMedia(section.rightMedia, fallbackAlt)}
                />
              );
            case "projectSectionOneCol":
              return (
                <ProjectSectionOneCol
                  key={section._key}
                  width={section.width === "70" ? "70" : section.width === "40" ? "40" : "100"}
                  media={resolveProjectMedia(section.media, fallbackAlt)}
                />
              );
            case "projectSectionText":
              return (
                <ProjectSectionText key={section._key} text={section.text || ""} />
              );
            case "projectSectionWhatIDidOutcomes":
              return (
                <ProjectSectionWhatIDidOutcomes
                  key={section._key}
                  whatIDidTitle={section.whatIDidTitle}
                  whatIDidText={section.whatIDidText}
                  outcomesTitle={section.outcomesTitle}
                  outcomesText={section.outcomesText}
                />
              );
            case "projectSectionTestimonial":
              return section.testimonial ? (
                <div key={section._key} className="w-full">
                  <PageTestimonial testimonial={section.testimonial} />
                </div>
              ) : null;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
