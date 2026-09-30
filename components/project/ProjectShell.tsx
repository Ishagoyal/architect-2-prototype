"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon, type IconName } from "../Icon";
import { YouCorner, ThemeButton, NameMenu, DevChip, CreditsLink } from "../YouCorner";
import { BottomTabs, SheetRow } from "../BottomTabs";
import { Sheet } from "../Sheet";
import { JourneyBar, CurrentStage } from "./JourneyBar";
import { PanelBody, type NeedsItem } from "./Panel";
import type { Project } from "@/lib/demo";

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

function ProjectMark({ project }: { project: Project }) {
  return (
    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[#F4E3CC] font-serif text-lg text-[#7A3A12] dark:bg-accent-soft dark:text-accent">
      {project.initial}
    </span>
  );
}

function VersionLink({ project }: { project: Project }) {
  return (
    <Link
      href={`/p/${project.id}/versions`}
      title={`Version ${project.version} · ${project.savedAgo}. Click to see recent versions or go back to one.`}
      className="flex items-center gap-1 text-xs whitespace-nowrap text-ink-2 hover:text-ink"
    >
      <Icon name="clock" size={12} />
      Version {project.version} · {project.savedAgo}
      <Icon name="chevronDown" size={11} strokeWidth={2} />
    </Link>
  );
}

const reviewTip = (on: boolean) =>
  on
    ? "Review on: each step waits for you to check and approve it."
    : "Review off: each step is saved as soon as it’s built. Turn on to check and approve each step first.";

function ChatButton({ count, onClick, className = "" }: { count: number; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-[10px] border border-line-strong bg-panel px-3 text-[13px] ${className}`}
    >
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

export function ProjectShell({
  project,
  needs = [],
  children,
}: {
  project: Project;
  needs?: NeedsItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [panelSheet, setPanelSheet] = useState(false);
  const [more, setMore] = useState(false);
  const closePanel = useCallback(() => setPanelSheet(false), []);
  const closeMore = useCallback(() => setMore(false), []);
  const base = `/p/${project.id}`;
  const isActive = (path: string) => pathname === `${base}/${path}` || pathname.startsWith(`${base}/${path}/`);
  const moreActive = ["database", "code", "settings"].some(isActive);

  return (
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-panel px-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3.5">
          <Link
            href="/projects"
            aria-label="Back to projects"
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-ink-2 hover:bg-hover md:hidden"
          >
            <Icon name="back" size={18} strokeWidth={2} />
          </Link>
          <ProjectMark project={project} />
          <span className="flex min-w-0 flex-col gap-px">
            <span className="truncate text-[15px] font-semibold">{project.name}</span>
            <span className="hidden md:block">
              <VersionLink project={project} />
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
            title={reviewTip(project.reviewOn)}
            className="hidden h-9 items-center gap-1.5 rounded-[10px] border border-line-strong bg-panel px-3 text-[13px] whitespace-nowrap xl:flex"
          >
            Review: <strong className="font-semibold">{project.reviewOn ? "on" : "off"}</strong>
          </Link>
          <button
            type="button"
            aria-label="Share"
            className="hidden size-9 items-center justify-center rounded-[10px] border border-line-strong bg-panel md:flex"
          >
            <Icon name="share" size={16} />
          </button>
          <ChatButton count={needs.length} onClick={() => setPanelSheet(true)} className="hidden md:flex lg:hidden" />
          <Link
            href={`${base}/deploy`}
            className="flex h-9 shrink-0 items-center rounded-[10px] border border-line-strong bg-panel px-3.5 text-[13px] font-medium whitespace-nowrap"
          >
            Deploy
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left rail: full at ≥1280px, icons only from 768px, bottom tabs on phones */}
        <nav
          aria-label="Project"
          className="hidden w-16 shrink-0 flex-col gap-0.5 border-r border-line bg-rail px-2 py-3.5 md:flex xl:w-[200px] xl:px-3"
        >
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
                className={`flex h-[42px] items-center justify-center gap-2.5 rounded-[10px] text-sm text-ink xl:justify-start xl:px-2.5 ${
                  active ? "bg-raised font-medium" : "hover:bg-hover"
                }`}
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
            <YouCorner settingsHref={`${base}/settings`} settingsLabel="Project settings" creditsUsed={project.creditsUsed} />
          </div>
          <div className="xl:hidden">
            <YouCorner
              compact
              settingsHref={`${base}/settings`}
              settingsLabel="Project settings"
              creditsUsed={project.creditsUsed}
            />
          </div>
        </nav>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto pb-[72px] md:pb-0">{children}</main>

        {/* Needs you + chat, beside the main area on wide screens */}
        <aside
          aria-label="Needs you and chat"
          className="hidden w-[340px] shrink-0 flex-col border-l border-line bg-panel lg:flex xl:w-[380px]"
        >
          <PanelBody projectId={project.id} needs={needs} />
        </aside>
      </div>

      {/* Phone: open Needs you + chat */}
      <ChatButton
        count={needs.length}
        onClick={() => setPanelSheet(true)}
        className="fixed right-4 bottom-[72px] z-30 h-11 rounded-full px-4 shadow-pop md:hidden"
      />

      <Sheet open={panelSheet} onClose={closePanel} label={needs.length ? `Needs you (${needs.length}) and chat` : "Chat"} tall>
        <PanelBody projectId={project.id} needs={needs} />
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
          <div className="px-3 pb-2">
            <VersionLink project={project} />
          </div>
          <SheetRow href={`${base}/database`} icon="database" onClick={closeMore}>
            Database
          </SheetRow>
          <SheetRow href={`${base}/code`} icon="code" onClick={closeMore}>
            Code
          </SheetRow>
          <SheetRow href={`${base}/settings`} icon="settings" onClick={closeMore}>
            <span>
              Project settings
              <span className="block text-xs text-ink-2">
                Review: {project.reviewOn ? "on" : "off"}
              </span>
            </span>
          </SheetRow>
          <div onClick={closeMore}>
            <CreditsLink used={project.creditsUsed} inSheet />
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
  );
}
