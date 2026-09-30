import { HomeShell } from "@/components/HomeShell";
import { requireViewer } from "@/lib/require-viewer";
import { ViewerProvider } from "@/lib/viewer-context";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return (
    <ViewerProvider viewer={viewer}>
      <HomeShell>{children}</HomeShell>
    </ViewerProvider>
  );
}
