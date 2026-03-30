import ProjectWorkShell from "@/components/ProjectWorkShell";
import ProjectDetailView from "../../../work/[slug]/ProjectDetailView";

export default async function InterceptedProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ProjectWorkShell mode="overlay">
      <ProjectDetailView slug={slug} />
    </ProjectWorkShell>
  );
}
