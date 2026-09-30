"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon, type IconName } from "../Icon";
import { YouCorner, ThemeButton, NameMenu, DevChip, CreditsLink } from "../YouCorner";
import { BottomTabs, SheetRow } from "../BottomTabs";
import { Sheet } from "../Sheet";
import { useDismiss } from "../useDismiss";
import { DemoTourCard, DemoTourIcon, DemoTourButton } from "../DemoTour";
import { JourneyBar, CurrentStage } from "./JourneyBar";
import { PanelBody, needsCount } from "./Panel";
import { ProjectUIContext } from "./ProjectUI";
import { useProject } from "@/lib/projects";
import { useCreditsUsed } from "@/lib/credits";
import { timeAgo, type Project } from "@/lib/model";

/* Inside a project:
   ≥1280px  top bar + full left rail + main + Needs you/chat panel (380px)
   1024+    the rail shrinks to icons, panel 340px
   768+     the panel opens as a sheet from the "Chat" button
   phone    rail → bottom tab bar, journey bar → current stage only, panel → sheet */

const railItems: { label: string; path: string; icon: IconName }[] = [
  { label: "App", path: "app", icon: "app" },
  { label: "Plan", path: "plan", icon: "plan" },
  { label: "Agents", path: "agents", icon: "agent" },
  { label: "Tests", path: "tests", icon: "tests" },
  { label: "Database", path: "database", icon: "database" },
  { label: "Code", path: "code", icon: "code" },
];

const tones = ["bg-[#F4E3CC] text-[#7A3A12]", "bg-info-soft text-info", "bg-[#E4EDE6] text-[#2E4A3B]"];

function ProjectMark({ project }: { project: Project }) {
  return (
    <span
      className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg font-serif text-lg dark:bg-accent-soft dark:text-accent ${tones[project.theme % tones.length]}`}
    >
      {project.name[0]?.toUpperCase()}
    </span>
  );
}

/** "Version 12 · saved 2 min ago ▾" opens the recent versions (design A22.1). */
function VersionMenu({ project, now }: { project: Project; now: number }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const latest = project.versions[0];
  const base = `/p/${project.id}`;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Click to see recent versions or go back to one."
        className={`-mx-1 flex items-center gap-1 rounded-md px-1 text-xs whitespace-nowrap text-ink-2 hover:text-ink ${open ? "bg-sunken" : ""}`}
      >
        <Icon name="clock" size={12} />
        Version {latest.n} · saved {timeAgo(latest.at, now)}
        <Icon name="chevronDown" size={11} strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[330px] max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-panel p-2 shadow-pop">
          <div className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">Recent versions</div>
          {project.versions.slice(0, 3).map((v, i) => (
            <Link
              key={v.n}
              href={`${base}/versions?v=${v.n}`}
              onClick={close}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${i === 0 ? "bg-sunken" : "hover:bg-hover"}`}
            >
              <span className="w-8 text-[13px] font-semibold">v{v.n}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px]">{v.title}</span>
                <span className="text-xs text-ink-2">
                  {timeAgo(v.at, now)}
                  {i === 0 ? " · you’re here" : ""}
                </span>
              </span>
              {v.badge === "live" && <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-medium text-good">Live</span>}
              {v.badge === "stopped" && <span className="rounded-full bg-bad-soft px-2 py-0.5 text-[11px] font-medium text-bad">Stopped</span>}
            </Link>
          ))}
          <div className="my-1.5 h-px bg-line" />
          <Link href={`${base}/versions`} onClick={close} className="block px-2.5 py-1.5 text-[13px] font-medium text-accent">
            See all versions →
          </Link>
        </div>
      )}
    </div>
  );
}

const reviewTip = "Review off: each step is saved as soon as it’s built. Turn on to check and approve each step first.";

function ChatButton({ count, onClick, className = "" }: { count: number; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-9 items-center gap-1.5 rounded-[10px] border border-line-strong bg-panel px-3 text-[13px] ${className}`}>
      <Icon name="chat" size={16} />
      Chat
      {count > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white dark:text-on-primary">
          {count}
          <span className="sr-only"> need you</span>
        </span>
      )}
    </button>
  );
}

function Missing() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="font-serif text-4xl">This project isn’t here</h1>
      <p className="max-w-sm text-sm text-ink-2">It may have been made in another browser, or in a demo that has since been left.</p>
      <Link href="/home" className="mt-2 flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium text-on-primary">
        Back to Home
      </Link>
    </div>
  );
}

export function ProjectShell({ id, children }: { id: string; children: React.ReactNode }) {
  const { project, loaded, update, now } = useProject(id);
  const credits = useCreditsUsed();
  const pathname = usePathname();
  const [panelSheet, setPanelSheet] = useState(false);
  const [more, setMore] = useState(false);
  const [highlightNeeds, setHighlight] = useState(false);
  const closePanel = useCallback(() => setPanelSheet(false), []);
  const closeMore = useCallback(() => setMore(false), []);
  const openPanel = useCallback(() => setPanelSheet(true), []);
  const pointAtNeeds = useCallback(() => {
    setHighlight(true);
    if (window.innerWidth < 1024) setPanelSheet(true);
    setTimeout(() => setHighlight(false), 2500);
  }, []);

  if (!loaded) return <div className="h-dvh bg-bg" />;
  if (!project) return <Missing />;

  const base = `/p/${project.id}`;
  const isActive = (path: string) => pathname === `${base}/${path}` || pathname.startsWith(`${base}/${path}/`);
  const moreActive = ["database", "code", "settings"].some(isActive);
  const count = needsCount(project);

  return (
    <ProjectUIContext.Provider value={{ openPanel, highlightNeeds, pointAtNeeds }}>
      <div className="flex h-dvh flex-col">
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-panel px-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3.5">
            <Link href="/home" aria-label="Back to Home" className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-2 hover:bg-hover md:hidden">
              <Icon name="back" size={18} strokeWidth={2} />
            </Link>
            <ProjectMark project={project} />
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-[15px] font-semibold">{project.name}</span>
              <span className="hidden md:block">
                <VersionMenu project={project} now={now} />
              </span>
            </span>
          </div>

          <div className="hidden md:block">
            <JourneyBar projectId={project.id} current={project.stage} />
          </div>
          <div className="md:hidden">
            <CurrentStage projectId={project.id} current={project.stage} />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Link
              href={`${base}/settings`}
              title={reviewTip}
              className="hidden h-9 items-center gap-1.5 rounded-[10px] border border-line-strong bg-panel px-3 text-[13px] whitespace-nowrap xl:flex"
            >
              Review: <strong className="font-semibold">off</strong>
            </Link>
            <button type="button" aria-label="Share" className="hidden size-9 items-center justify-center rounded-[10px] border border-line-strong bg-panel md:flex">
              <Icon name="share" size={16} />
            </button>
            <ChatButton count={count} onClick={openPanel} className="hidden md:flex lg:hidden" />
            <Link
              href={`${base}/deploy`}
              className="flex h-9 shrink-0 items-center rounded-[10px] border border-line-strong bg-panel px-3.5 text-[13px] font-medium whitespace-nowrap"
            >
              Deploy
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav aria-label="Project" className="hidden w-16 shrink-0 flex-col gap-0.5 border-r border-line bg-rail px-2 py-3.5 md:flex xl:w-[200px] xl:px-3">
            <Link
              href="/projects"
              title="Projects"
              className="mb-2 flex h-10 items-center justify-center gap-2 rounded-[10px] text-[13px] text-ink-2 hover:bg-hover xl:justify-start xl:px-2.5"
            >
              <Icon name="back" size={15} strokeWidth={2} />
              <span className="sr-only xl:not-sr-only">Projects</span>
            </Link>
            {railItems.map((r) => {
              const active = isActive(r.path);
              return (
                <Link
                  key={r.path}
                  href={`${base}/${r.path}`}
                  title={r.label}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-[42px] items-center justify-center gap-2.5 rounded-[10px] text-sm text-ink xl:justify-start xl:px-2.5 ${active ? "bg-raised font-medium" : "hover:bg-hover"}`}
                >
                  <Icon name={r.icon} />
                  <span className="sr-only xl:not-sr-only">{r.label}</span>
                  {r.path === "code" && (
                    <span title="Read-only" className="ml-auto hidden text-ink-2 xl:inline dev:hidden!">
                      <Icon name="eye" size={13} />
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="flex-1" />
            <div className="hidden xl:block">
              <DemoTourCard autoOpenMedia="(min-width: 1280px)" />
              <YouCorner settingsHref={`${base}/settings`} settingsLabel="Project settings" creditsUsed={credits} />
            </div>
            <div className="xl:hidden">
              <DemoTourIcon autoOpenMedia="(min-width: 768px) and (max-width: 1279px)" />
              <YouCorner compact settingsHref={`${base}/settings`} settingsLabel="Project settings" creditsUsed={credits} />
            </div>
          </nav>

          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto pb-[72px] md:pb-0">{children}</main>

          <aside aria-label="Needs you and chat" className="hidden w-[340px] shrink-0 flex-col border-l border-line bg-panel lg:flex xl:w-[380px]">
            <PanelBody project={project} update={update} now={now} />
          </aside>
        </div>

        <DemoTourButton className="fixed bottom-[72px] left-4 z-30 md:hidden" />
        <ChatButton count={count} onClick={openPanel} className="fixed right-4 bottom-[72px] z-30 h-11 rounded-full px-4 shadow-pop md:hidden" />

        <Sheet open={panelSheet} onClose={closePanel} label={count ? `Needs you (${count}) and chat` : "Chat"} tall>
          <PanelBody project={project} update={update} now={now} />
        </Sheet>

        <BottomTabs
          label="Project"
          tabs={[
            ...railItems.slice(0, 4).map((r) => ({ label: r.label, icon: r.icon, href: `${base}/${r.path}`, active: isActive(r.path) })),
            { label: "More", icon: "more" as const, onClick: () => setMore(true), active: moreActive },
          ]}
        />
        <Sheet open={more} onClose={closeMore} label="More">
          <div className="flex flex-col gap-0.5 px-2 pb-2">
            <SheetRow href={`${base}/versions`} icon="clock" onClick={closeMore}>
              <span>
                Versions
                <span className="block text-xs text-ink-2">
                  Version {project.versions[0].n} · saved {timeAgo(project.versions[0].at, now)}
                </span>
              </span>
            </SheetRow>
            <SheetRow href={`${base}/database`} icon="database" onClick={closeMore}>
              Database
            </SheetRow>
            <SheetRow href={`${base}/code`} icon="code" onClick={closeMore}>
              Code
            </SheetRow>
            <SheetRow href={`${base}/settings`} icon="settings" onClick={closeMore}>
              <span>
                Project settings
                <span className="block text-xs text-ink-2">Review: off</span>
              </span>
            </SheetRow>
            <div onClick={closeMore}>
              <CreditsLink used={credits} inSheet />
            </div>
            <SheetRow href="/projects" icon="folder" onClick={closeMore}>
              All projects
            </SheetRow>
          </div>
          <div className="mx-4 mb-4 flex items-center justify-between gap-2 border-t border-line pt-3">
            <NameMenu />
            <div className="flex items-center gap-1">
              <DevChip />
              <ThemeButton />
            </div>
          </div>
        </Sheet>
      </div>
    </ProjectUIContext.Provider>
  );
}
