"use client";

import { useProjects } from "./projects";
import { useViewer } from "./viewer-context";

/** This month's credits, as a share. The demo starts "running low" like design A25. Made-up numbers. */
export function useCreditsUsed() {
  const viewer = useViewer();
  const { projects } = useProjects();
  const base = viewer.kind === "demo" ? 71 : 0;
  return Math.min(99, base + Math.round(projects.reduce((s, p) => s + p.creditsUsed, 0) / 2));
}
