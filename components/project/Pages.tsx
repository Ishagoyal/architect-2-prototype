"use client";

import { AppView } from "../preview/AppView";
import { PlanView } from "../plan/PlanView";
import { TestsView } from "../tests/TestsView";
import { VersionsView } from "../versions/VersionsView";
import { useCurrentProject } from "./useCurrentProject";

export function AppPage() {
  const { project, update, now } = useCurrentProject();
  return <AppView project={project} update={update} now={now} />;
}

export function PlanPage() {
  const { project, update } = useCurrentProject();
  return <PlanView project={project} update={update} />;
}

export function TestsPage() {
  const { project, now } = useCurrentProject();
  return <TestsView project={project} now={now} />;
}

export function VersionsPage({ selected }: { selected?: number }) {
  const { project, update, now } = useCurrentProject();
  return <VersionsView key={selected ?? "latest"} project={project} update={update} now={now} selected={selected} />;
}
