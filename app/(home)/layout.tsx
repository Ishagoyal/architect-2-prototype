import { HomeShell } from "@/components/HomeShell";
import { ProjectsProvider } from "@/lib/projects";
import { requireViewer } from "@/lib/require-viewer";
import { ViewerProvider } from "@/lib/viewer-context";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return (
    <ViewerProvider viewer={viewer}>
      <ProjectsProvider kind={viewer.kind} owner={viewer.id}>
        <HomeShell>{children}</HomeShell>
      </ProjectsProvider>
    </ViewerProvider>
  );
}
