import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Refine } from "@/components/Refine";

export const metadata: Metadata = { title: "Refine · Architect 2.0" };

export default async function NewProject({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const { idea } = await searchParams;
  if (!idea?.trim()) redirect("/home");
  return <Refine idea={idea.trim()} />;
}
