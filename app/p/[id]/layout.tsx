import { ProjectShell } from "@/components/project/ProjectShell";
import { getProject } from "@/lib/demo";
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
      <ProjectShell project={getProject(id)}>{children}</ProjectShell>
    </ViewerProvider>
  );
}
