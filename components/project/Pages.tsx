"use client";

import { AppView } from "../preview/AppView";
import { DatabaseView } from "../data/DatabaseView";
import { CodeView } from "../code/CodeView";
import { ProjectSettings } from "../settings/ProjectSettings";
import { SetupView } from "../import/SetupView";
import { AgentsView } from "../agents/AgentsView";
import { DeployView } from "../deploy/DeployView";
import { PlanView } from "../plan/PlanView";
import { TestsView } from "../tests/TestsView";
import { VersionsView } from "../versions/VersionsView";
import { useCurrentProject } from "./useCurrentProject";

export function AppPage({ page }: { page?: number }) {
  const { project, update, now } = useCurrentProject();
  return <AppView project={project} update={update} now={now} initialPage={page} />;
}

export function PlanPage() {
  const { project, update } = useCurrentProject();
  return <PlanView project={project} update={update} />;
}

export function TestsPage() {
  const { project, update, now } = useCurrentProject();
  return <TestsView project={project} update={update} now={now} />;
}

export function VersionsPage({ selected, tab }: { selected?: number; tab?: "files" }) {
  const { project, update, now } = useCurrentProject();
  return <VersionsView key={`${selected ?? "latest"}-${tab ?? ""}`} project={project} update={update} now={now} selected={selected} initialTab={tab} />;
}

export function DeployPage() {
  const { project, update, now } = useCurrentProject();
  return <DeployView project={project} update={update} now={now} />;
}

export function AgentsPage() {
  const { project, update } = useCurrentProject();
  return <AgentsView project={project} update={update} />;
}

export function SetupPage() {
  const { project, update } = useCurrentProject();
  return <SetupView project={project} update={update} />;
}

export function SettingsPage() {
  const { project, update } = useCurrentProject();
  return <ProjectSettings project={project} update={update} />;
}

export function DatabasePage() {
  const { project, update } = useCurrentProject();
  return <DatabaseView project={project} update={update} />;
}

export function CodePage({ file }: { file?: string }) {
  const { project, update } = useCurrentProject();
  return <CodeView key={file ?? ""} project={project} file={file} update={update} />;
}
