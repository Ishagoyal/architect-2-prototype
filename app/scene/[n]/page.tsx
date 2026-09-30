import { notFound, redirect } from "next/navigation";
import { sceneFor, sceneId } from "@/lib/scenes";

/* /scene/2 opens scene 2 of the landing page's story, fresh every time. */
export default async function ScenePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const scene = sceneFor(Number(n));
  if (!scene) notFound();
  redirect(`/p/${sceneId(scene.n)}/${scene.path}`);
}
