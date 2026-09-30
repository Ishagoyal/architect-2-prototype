import { notFound } from "next/navigation";
import { Placeholder } from "@/components/Placeholder";

const titles: Record<string, string> = {
  agents: "Agents",
  database: "Database",
  code: "Code",
  settings: "Project settings",
  deploy: "Deploy",
};

export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = titles[section];
  if (!title) notFound();
  return <Placeholder title={title} />;
}
