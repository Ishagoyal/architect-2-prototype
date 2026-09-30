"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/lib/projects";

/** The project this page belongs to. The shell only renders pages once it exists. */
export function useCurrentProject() {
  const { id } = useParams<{ id: string }>();
  const { project, update, now } = useProject(id);
  return { project: project!, update, now };
}
