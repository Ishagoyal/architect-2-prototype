import { ProjectShell } from "@/components/project/ProjectShell";
import { SceneRoot } from "@/components/scene/Scene";
import { ProjectsProvider } from "@/lib/projects";
import { requireViewer } from "@/lib/require-viewer";
import { sceneNumber } from "@/lib/scenes";
import { sceneViewer } from "@/lib/viewer";
import { ViewerProvider } from "@/lib/viewer-context";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The landing page's scenes: open to everyone, kept apart from the demo and from accounts.
  const scene = sceneNumber(id);
  if (scene)
    return (
      <ViewerProvider viewer={sceneViewer}>
        <SceneRoot n={scene}>
          <ProjectShell id={id}>{children}</ProjectShell>
        </SceneRoot>
      </ViewerProvider>
    );

  const viewer = await requireViewer();
  return (
    <ViewerProvider viewer={viewer}>
      <ProjectsProvider kind={viewer.kind} owner={viewer.id}>
        <ProjectShell id={id}>{children}</ProjectShell>
      </ProjectsProvider>
    </ViewerProvider>
  );
}
