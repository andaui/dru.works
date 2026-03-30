import { client, projectBySlugQuery } from "@/lib/sanity";
import ProjectWorkShell from "@/components/ProjectWorkShell";
import ProjectDetailView from "./ProjectDetailView";

async function getProject(slug: string) {
  return client.fetch(projectBySlugQuery, { slug });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return { title: `${project.projectTitle} | Work` };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <ProjectWorkShell mode="page">
      <ProjectDetailView slug={slug} />
    </ProjectWorkShell>
  );
}
