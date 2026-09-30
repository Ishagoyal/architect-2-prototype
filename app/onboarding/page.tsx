import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Onboarding } from "@/components/Onboarding";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Welcome · Architect 2.0" };

export default async function OnboardingPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/");
  if (viewer.kind === "demo" || viewer.onboarded) redirect("/home");
  return <Onboarding suggestedName={viewer.hasName ? viewer.name : ""} viaGithub={viewer.viaGithub} />;
}
