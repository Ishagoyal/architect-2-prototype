"use client";

import { useProjects } from "./projects";
import { useViewer } from "./viewer-context";
import { useCurrentWorkspace } from "./workspaces";

/** This month's credits, as a share. The demo starts "running low" like design A25. Made-up numbers. */
export function useCreditsUsed() {
  const viewer = useViewer();
  const { projects } = useProjects();
  // The demo's made-up "running low" start belongs to its first workspace only.
  const workspace = useCurrentWorkspace(viewer.id);
  const base = viewer.kind === "demo" && workspace === "main" ? 71 : 0;
  // The total is the sum of the projects, so it matches Usage → By project.
  return Math.min(99, base + Math.round(projects.reduce((s, p) => s + p.creditsUsed, 0)));
}
