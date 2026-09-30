"use client";

import Link from "next/link";
import { PromptBox } from "./PromptBox";
import { useProjects } from "@/lib/projects";
import { useViewer } from "@/lib/viewer-context";
import { timeAgo, type Project } from "@/lib/model";

/* A3 for someone new, A25 once there are projects to continue. */
export function HomeContent({ firstName, heading, ideas, initial }: { firstName: string; heading: string; ideas: string[]; initial: string }) {
  const { projects, loaded, now } = useProjects();
  const demo = useViewer().kind === "demo";
  const returning = loaded && projects.length > 0;
  const setup = projects.filter((p) => p.imported && p.imported.setup !== "done");
  const recent = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  return (
    <div className={`mx-auto flex w-full max-w-[760px] flex-col px-4 pt-10 pb-24 md:px-6 md:pb-10 ${returning ? "md:pt-11" : "md:pt-[160px]"}`}>
      <h1 className={`text-center font-serif text-[40px] leading-[1.05] ${returning ? "md:text-[56px]" : "md:text-[64px]"}`}>
        {returning ? (demo ? "What are we building next?" : `Welcome back, ${firstName}. What are we building next?`) : "What should it do?"}
      </h1>
      <p className="mt-3 text-center text-[15px] text-ink-2 md:mt-4 md:text-lg">
        {returning ? "Describe a new idea, or pick up a project below." : "Every step gets checked against what you asked for."}
      </p>
      {setup.map((p) => (
        <div key={p.id} className="mt-7 flex flex-col gap-3 rounded-2xl border border-accent-line bg-needs p-5">
          <span className="text-[15px] font-semibold">
            {p.name} is imported. {p.imported?.setup === "keys" ? "2 things" : "1 thing"} left before you can build
          </span>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className={p.imported?.setup === "keys" ? "text-ink-3" : "text-good"}>{p.imported?.setup === "keys" ? "○" : "✓"}</span> Add passwords and keys
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ink-3">○</span> Check what we think your app does
            </li>
          </ul>
          <Link href={`/p/${p.id}/${p.imported?.setup === "keys" ? "setup" : "plan"}`} className="flex h-10 items-center self-start rounded-[10px] bg-primary px-4 text-[13px] font-medium text-on-primary">
            Continue setup
          </Link>
        </div>
      ))}
      <PromptBox heading={heading} ideas={ideas} initial={initial} />

      {returning && (
        <section className="mt-9">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Continue where you left off</h2>
            <Link href="/projects" className="text-[13px] font-medium text-accent hover:text-accent-strong">
              View all →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recent.map((p) => (
              <ProjectCard key={p.id} project={p} now={now} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const covers = [
  "bg-[#F4E3CC] text-[#7A3A12] dark:bg-accent-soft dark:text-accent",
  "bg-info-soft text-info",
  "bg-[#EEEBE3] text-ink dark:bg-sunken",
];

export function projectStatus(p: Project): { label: string; tone: string } {
  if (p.stage === "live") return { label: "Live", tone: "bg-good-soft text-good" };
  if (p.build.status === "running" || p.build.status === "checking") return { label: "Building", tone: "bg-info-soft text-info" };
  if (p.build.status === "stopped") return { label: "Stopped", tone: "bg-bad-soft text-bad" };
  if (p.build.status === "done") return { label: "Built", tone: "bg-good-soft text-good" };
  return { label: "Not built yet", tone: "bg-sunken text-ink-2" };
}

export function ProjectCard({ project, now }: { project: Project; now: number }) {
  const status = projectStatus(project);
  return (
    <Link href={`/p/${project.id}/${project.stage === "plan" ? "plan" : "app"}`} className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-3 hover:border-line-strong">
      <span className={`flex h-[60px] items-end truncate rounded-[10px] px-3 pb-2 font-serif text-[22px] ${covers[project.theme % covers.length]}`}>
        {project.kind === "meal" ? "Abhi kya banega?" : project.name}
      </span>
      <span className="truncate text-sm">{project.name}</span>
      <span className="flex items-center justify-between gap-2 text-xs text-ink-2">
        Edited {timeAgo(project.updatedAt, now)}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${status.tone}`}>{status.label}</span>
      </span>
    </Link>
  );
}
