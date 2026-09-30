"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon } from "./Icon";
import { useDismiss } from "./useDismiss";
import { useViewer } from "@/lib/viewer-context";
import { demoWorkspaces } from "@/lib/demo";

/* Design A26: your workspaces, then Workspace settings, Invite people, Create a workspace. */
export function WorkspaceMenu({ compact = false }: { compact?: boolean }) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);

  const workspaces =
    viewer.kind === "demo"
      ? demoWorkspaces
      : [
          {
            name: viewer.workspace,
            initial: viewer.firstName[0]?.toUpperCase() ?? "W",
            color: "bg-accent",
            lines: ["Personal · Free plan · just you", "No projects yet · credits on track, 0% used"],
          },
        ];
  const current = workspaces[0];

  return (
    <div ref={ref} className={`relative ${compact ? "" : "w-full"}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between rounded-[10px] border bg-raised text-[13px] ${
          open ? "border-accent" : "border-line"
        } ${compact ? "h-9 gap-1.5 px-2" : "h-11 w-full px-3"}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={`flex size-[22px] shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white ${current.color}`}>
            {current.initial}
          </span>
          <span className="truncate">{current.name}</span>
        </span>
        <Icon name="chevronDown" size={14} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 flex w-[328px] max-w-[calc(100vw-32px)] flex-col gap-1 rounded-2xl border border-line bg-panel p-2 shadow-pop">
          <span className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">Your workspaces</span>
          {workspaces.map((w, i) => (
            <button
              key={w.name}
              type="button"
              onClick={close}
              aria-current={i === 0 ? "true" : undefined}
              className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left ${i === 0 ? "bg-sunken" : "hover:bg-hover"}`}
            >
              <span className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${w.color}`}>
                {w.initial}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">{w.name}</span>
                {w.lines.map((l) => (
                  <span key={l} className="text-xs text-ink-2">
                    {l}
                  </span>
                ))}
              </span>
              {i === 0 && (
                <span className="text-accent">
                  <Icon name="check" size={15} strokeWidth={2.2} />
                </span>
              )}
            </button>
          ))}
          <p className="mx-2 my-1 rounded-[10px] bg-sunken px-2.5 py-2 text-xs leading-normal text-ink-2">
            Each workspace has its own projects, agents, credits, people and GitHub connection.
          </p>
          <div className="my-1 h-px bg-line" />
          <Link href="/settings" onClick={close} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-hover">
            <Icon name="settings" size={15} />
            <span className="flex flex-col">
              <span className="text-[13px]">Workspace settings</span>
              <span className="text-xs text-ink-2">People, plan and billing</span>
            </span>
          </Link>
          <button type="button" onClick={close} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-hover">
            <Icon name="people" size={15} />
            Invite people
          </button>
          <button type="button" onClick={close} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-hover">
            <Icon name="plus" size={15} />
            Create a workspace
          </button>
        </div>
      )}
    </div>
  );
}
