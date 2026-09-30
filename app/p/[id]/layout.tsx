import { ProjectShell } from "@/components/project/ProjectShell";
import { ProjectsProvider } from "@/lib/projects";
import { requireViewer } from "@/lib/require-viewer";
import { ViewerProvider } from "@/lib/viewer-context";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const [{ id }, viewer] = await Promise.all([params, requireViewer()]);
  return (
    <ViewerProvider viewer={viewer}>
      <ProjectsProvider kind={viewer.kind} owner={viewer.id}>
        <ProjectShell id={id}>{children}</ProjectShell>
      </ProjectsProvider>
    </ViewerProvider>
  );
}
