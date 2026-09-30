import { ProjectShell } from "@/components/project/ProjectShell";
import { getProject } from "@/lib/demo";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectShell project={getProject(id)}>{children}</ProjectShell>;
}
