import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Architect 2.0 · AI writes the code. You decide what “working” means.",
  description: "Six problems I hit building my own app with AI, and how Architect 2.0 answers each one. Try the demo, no sign-up.",
};

/* Open to everyone, including people who are signed in or in the demo. */
export default async function Home() {
  const viewer = await getViewer();
  return <Landing inside={viewer !== null} />;
}
