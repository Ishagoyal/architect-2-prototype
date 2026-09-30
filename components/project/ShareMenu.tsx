"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon } from "../Icon";
import { useDismiss } from "../useDismiss";
import { address } from "../deploy/DeployView";
import type { Project } from "@/lib/model";

/* Share: a link to try the app (the live one once it's live, the preview before), and inviting people. */
export function ShareMenu({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const live = !!project.deploy?.liveVersion;
  const url = live ? `https://${address(project)}` : `https://preview-${address(project)}`;
  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-label="Share"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex size-9 items-center justify-center rounded-[10px] border bg-panel ${open ? "border-accent" : "border-line-strong"}`}
      >
        <Icon name="share" size={16} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 flex w-[360px] flex-col gap-3 rounded-2xl border border-line bg-panel p-4 shadow-pop">
          <span className="text-base font-semibold">Share {project.name}</span>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">{live ? "Live app" : "Preview link"}</span>
            <span className="text-xs text-ink-2">{live ? "Anyone with this link can use the live app." : "People with this link can try the preview. It’s not live yet."}</span>
            <span className="flex gap-2">
              <input readOnly value={url} aria-label="Link" className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-sunken px-2.5 font-mono text-xs" />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(url).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="h-9 shrink-0 rounded-lg bg-primary px-3 text-[13px] font-medium text-on-primary"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
            <span className="text-xs text-ink-3">Prototype: this address is an example and doesn’t open.</span>
          </div>
          <div className="h-px bg-line" />
          <Link href={`/p/${project.id}/settings?tab=team`} onClick={close} className="flex items-center gap-2.5 rounded-lg py-1 text-[13px] hover:text-accent">
            <Icon name="people" size={15} />
            Invite people to work on this project
          </Link>
        </div>
      )}
    </div>
  );
}
