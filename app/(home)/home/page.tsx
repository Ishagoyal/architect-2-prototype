import { HomeContent } from "@/components/HomeContent";
import { ideasFor } from "@/lib/demo";
import { requireViewer } from "@/lib/require-viewer";

export default async function Home({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const [viewer, { idea }] = await Promise.all([requireViewer(), searchParams]);
  const { heading, ideas } = ideasFor(viewer.role);
  return <HomeContent firstName={viewer.firstName} heading={heading} ideas={ideas} initial={idea ?? ""} />;
}
