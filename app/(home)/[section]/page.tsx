import { notFound } from "next/navigation";
import { Placeholder } from "@/components/Placeholder";

const titles: Record<string, string> = {
  projects: "Projects",
  agents: "Agents",
  explore: "Explore",
  help: "Help & Learn",
  settings: "Account settings",
  usage: "Credits and usage",
};

export function generateStaticParams() {
  return Object.keys(titles).map((section) => ({ section }));
}

export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = titles[section];
  if (!title) notFound();
  return <Placeholder title={title} />;
}
