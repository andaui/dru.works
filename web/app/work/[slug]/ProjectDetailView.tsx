import ProjectSectionTwoCol50 from "@/components/project/ProjectSectionTwoCol50";
import ProjectSectionTwoCol30 from "@/components/project/ProjectSectionTwoCol30";
import ProjectSectionOneCol from "@/components/project/ProjectSectionOneCol";
import ProjectSectionText from "@/components/project/ProjectSectionText";
import ProjectSectionWhatIDidOutcomes from "@/components/project/ProjectSectionWhatIDidOutcomes";
import ProjectSectionSpacer from "@/components/project/ProjectSectionSpacer";
import TestimonialCard from "@/components/TestimonialCard";
import type { HomeTestimonialItem } from "@/components/HomeTestimonialsGrid";
import { client, projectBySlugQuery, featuredWorkQuery, urlFor } from "@/lib/sanity";
import { resolveProjectMedia } from "@/lib/projectMedia";
import ProjectDetailFooterActions from "@/components/project/ProjectDetailFooterActions";
import { notFound } from "next/navigation";
import Link from "next/link";

function toHomeTestimonialItem(testimonial: any): HomeTestimonialItem | null {
  if (!testimonial?._id) return null;
  let photoUrl: string | null = null;
  const photoAlt =
    testimonial?.personPhoto?.alt || testimonial?.person || "Person photo";
  if (testimonial?.personPhoto?.asset) {
    try {
      photoUrl = urlFor(testimonial.personPhoto)
        .width(114)
        .height(114)
        .fit("crop")
        .quality(90)
        .format("jpg")
        .url();
    } catch {
      if (testimonial.personPhoto.asset?.url) {
        photoUrl = testimonial.personPhoto.asset.url;
      }
    }
  }
  const body =
    (testimonial.testimonialLong && testimonial.testimonialLong.trim()) ||
    testimonial.testimonialShort ||
    "";
  return {
    _id: testimonial._id,
    person: testimonial.person || "",
    role: testimonial.role || "",
    company: testimonial.company || "",
    body,
    photoUrl,
    photoAlt,
  };
}

function NavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={direction === "left" ? "shrink-0 rotate-180" : "shrink-0"}
      aria-hidden
    >
      <path
        d="M13.4173 21.5455L11.7767 19.9262L18.531 13.1719H1.03809V10.8282H18.531L11.7767 4.09521L13.4173 2.45459L22.9628 12L13.4173 21.5455Z"
        fill="currentColor"
      />
    </svg>
  );
}

const navLabelClass =
  "font-soehne font-normal text-[70px] leading-[65px] tracking-[-0.25px]";

/** Monthly pricing expandable description (HomePricingCalculator) — 30% opacity; full accent on link hover. */
const navProjectTitleClass =
  "font-soehne font-normal text-[20px] leading-[29px] text-foreground/30 group-hover:text-accent transition-colors shrink min-w-0";

async function getProject(slug: string) {
  return client.fetch(projectBySlugQuery, { slug });
}

export default async function ProjectDetailView({
  slug,
  /** In the intercepted modal, replace history so Close (router.back) exits the overlay instead of stepping through each project. */
  replaceProjectNav = false,
}: {
  slug: string;
  replaceProjectNav?: boolean;
}) {
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

  const navWork = allWork.filter((w: any) => w.slug);
  let navIndex = navWork.findIndex((w: any) => w.slug === slug);
  if (navIndex < 0) {
    navIndex = navWork.findIndex((w: any) => w._id === project._id);
  }
  const n = navWork.length;
  const i = navIndex >= 0 ? navIndex : 0;
  const prevProject = n > 0 ? navWork[(i - 1 + n) % n] : null;
  const nextProject = n > 0 ? navWork[(i + 1) % n] : null;

  const description =
    (project.projectDescriptionShort && String(project.projectDescriptionShort).trim()) || "";

  const roleImpactLines = String(project.roleImpact || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const whatIDidTitle = (firstWhatIDid?.whatIDidTitle || "What I did").trim();
  const whatIDidLines = String(firstWhatIDid?.whatIDidText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const listTitle = roleImpactLines.length > 0 ? "Role & Impact" : whatIDidTitle;
  const listLines = roleImpactLines.length > 0 ? roleImpactLines : whatIDidLines;

  const fallbackAlt = (project.projectTitle || "").trim() || "Project";
  const clientName = (project.client || "").trim();

  return (
    <>
      <div id="project-detail-top" className="h-0 w-full shrink-0 scroll-mt-0" aria-hidden />
      {/* Project intro (Figma frame): description first, full width; no title in modal/page shell. */}
      {description ? (
        <div className="w-full pt-[50px]">
          <p className="font-soehne font-normal text-[30px] sm:text-[39px] leading-[37px] sm:leading-[45px] tracking-[-0.25px] text-black dark:text-white m-0 w-full">
            {description}
          </p>
        </div>
      ) : null}

      {listLines.length > 0 || clientName ? (
        <div className="w-full mt-[80px]">
          <div className="grid grid-cols-12 gap-x-[34px] gap-y-10 w-full items-start">
            <div className="col-span-12 lg:col-span-9 min-w-0">
              <div className="font-soehne font-normal text-[18px] sm:text-[20px] leading-[26px] sm:leading-[29px] tracking-[-0.25px]">
                <p className="m-0 text-black/50 dark:text-white/50">{listTitle}</p>
                {listLines.length > 0 ? (
                  <div className="mt-[10px] flex flex-col gap-1 text-black dark:text-white">
                    {listLines.map((line, i) => (
                      <p key={i} className="m-0">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {clientName ? (
              <div className="col-span-12 lg:col-span-2 lg:col-start-11 min-w-0">
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
              case "projectSectionTestimonial": {
                const t = section.testimonial ? toHomeTestimonialItem(section.testimonial) : null;
                if (!t) return null;
                return (
                  <div key={section._key} className="w-full min-w-0 mt-[80px] mb-[80px] lg:mt-[128px] lg:mb-[128px]">
                    <div className="w-full max-w-[780px] mx-auto">
                      <TestimonialCard t={t} />
                    </div>
                  </div>
                );
              }
              default:
                return null;
            }
          })}
        </div>

        {n > 0 ? (
          <div className="w-full min-w-0 mt-[260px] flex flex-row items-center gap-4">
            <div className="flex-1 flex justify-start min-w-0">
              <Link
                href={`/work/${prevProject.slug}`}
                replace={replaceProjectNav}
                className="group inline-flex flex-row items-center gap-2 min-w-0 max-w-full text-black dark:text-white hover:text-accent transition-colors"
              >
                <span className="inline-flex flex-row items-center shrink-0">
                  <NavArrow direction="left" />
                </span>
                <span className="inline-flex flex-row items-center gap-6 min-w-0">
                  <span className={`${navLabelClass} shrink-0`}>Previous</span>
                  <span className={`${navProjectTitleClass} truncate`}>
                    {(prevProject.projectTitle || "").trim() || "Project"}
                  </span>
                </span>
              </Link>
            </div>
            <div className="flex-1 flex justify-end min-w-0">
              <Link
                href={`/work/${nextProject.slug}`}
                replace={replaceProjectNav}
                className="group inline-flex flex-row items-center gap-2 min-w-0 max-w-full text-black dark:text-white hover:text-accent transition-colors"
              >
                <span className="inline-flex flex-row items-center justify-end gap-6 min-w-0">
                  <span className={`${navProjectTitleClass} truncate text-right`}>
                    {(nextProject.projectTitle || "").trim() || "Project"}
                  </span>
                  <span className={`${navLabelClass} shrink-0`}>Next</span>
                </span>
                <span className="inline-flex flex-row items-center shrink-0">
                  <NavArrow direction="right" />
                </span>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="w-full min-w-0 mt-[200px]">
          <ProjectDetailFooterActions />
        </div>
      </div>
    </>
  );
}
