"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../Icon";
import { DevTag } from "../DevTag";
import { btnOutline, btnPrimary } from "../Modal";
import { goBackTo, timeAgo, type Project } from "@/lib/model";

/* Designs A22 / A23: every version, with what changed. Going back makes a new version. */

export function VersionsView({ project: p, update, now, selected }: { project: Project; update: (fn: (p: Project) => Project) => void; now: number; selected?: number }) {
  const router = useRouter();
  const [pick, setPick] = useState<number>(selected ?? p.versions[0].n);
  const [tab, setTab] = useState<"changes" | "files">("changes");
  const v = p.versions.find((x) => x.n === pick) ?? p.versions[0];
  const latest = v.n === p.versions[0].n;

  return (
    <div className="flex flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-4 text-[13px] md:px-5">
        <span className="flex items-center gap-2.5">
          <Icon name="clock" size={15} />
          <strong className="font-semibold">Versions</strong>
          <span className="hidden text-ink-2 sm:inline">Plan, code and the app’s AI are saved together</span>
        </span>
        <Link href={`/p/${p.id}/app`} aria-label="Close versions" className="flex size-8 items-center justify-center rounded-lg hover:bg-hover">
          <Icon name="close" size={15} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[250px_minmax(0,1fr)] md:p-5">
        <ol className="flex flex-col gap-2">
          {p.versions.map((x) => (
            <li key={x.n}>
              <button
                type="button"
                onClick={() => {
                  setPick(x.n);
                  setTab("changes");
                }}
                aria-current={x.n === v.n}
                className={`flex w-full flex-col gap-0.5 rounded-xl border bg-panel p-3 text-left ${x.n === v.n ? "border-ink" : "border-line hover:border-line-strong"}`}
              >
                <span className="flex items-center justify-between text-[13px]">
                  v{x.n}
                  <span className="flex gap-1">
                    {x.badge === "live" && <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] text-good">Live</span>}
                    {x.badge === "stopped" && <span className="rounded-full bg-bad-soft px-2 py-0.5 text-[11px] text-bad">Stopped · not tested</span>}
                    {x.pinned && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-strong">★ Pinned</span>}
                  </span>
                </span>
                <span className="text-sm">{x.title}</span>
                <span className="text-xs text-ink-2">{timeAgo(x.at, now)}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-4 self-start rounded-2xl border border-line bg-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="flex flex-col gap-1">
              <span className="text-xs text-ink-2">
                v{v.n} · {timeAgo(v.at, now)} · by Architect
              </span>
              <h1 className="font-serif text-[30px] leading-tight">{v.title}</h1>
            </span>
            <span className="flex gap-2">
              <button type="button" onClick={() => update((q) => ({ ...q, versions: q.versions.map((x) => (x.n === v.n ? { ...x, pinned: !x.pinned } : x)) }))} className={btnOutline}>
                {v.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                disabled={latest}
                onClick={() => {
                  update((q) => goBackTo(q, v.n));
                  setPick(p.versions[0].n + 1);
                  router.replace(`/p/${p.id}/versions`);
                }}
                className={`${btnPrimary} disabled:cursor-default`}
                title={latest ? "This is the version you’re on" : undefined}
              >
                {latest ? "You’re on this version" : "Go back to this version"}
              </button>
            </span>
          </div>

          <div role="tablist" className="flex gap-4 border-b border-line text-[13px]">
            <button type="button" role="tab" aria-selected={tab === "changes"} onClick={() => setTab("changes")} className={`-mb-px border-b-2 pb-2 ${tab === "changes" ? "border-ink font-medium" : "border-transparent text-ink-2"}`}>
              What changed
            </button>
            <button type="button" role="tab" aria-selected={tab === "files"} onClick={() => setTab("files")} className={`-mb-px hidden items-center gap-2 border-b-2 pb-2 dev:flex ${tab === "files" ? "border-ink font-medium" : "border-transparent text-ink-2"}`}>
              Changed files <DevTag />
            </button>
          </div>

          {tab === "changes" ? (
            <>
              <p className="text-[15px] leading-relaxed">{v.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {v.parts.map((x) => (
                  <span key={x} className="rounded-lg bg-sunken px-2.5 py-1 text-[13px]">
                    {x}
                  </span>
                ))}
              </div>
              {v.checks.length > 0 && (
                <div className="flex flex-col">
                  <span className="pb-2 text-sm font-semibold">Checks before → after</span>
                  {v.checks.map(([name, before, after]) => (
                    <div key={name} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-t border-line py-2 text-[13px]">
                      <span>{name}</span>
                      <span className="text-ink-2">{before}</span>
                      <span aria-hidden="true">→</span>
                      <span className={`font-semibold ${after === "passed" ? "text-good" : after === "failed" ? "text-bad" : "text-ink-2"}`}>{after}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 border-t border-line pt-3 text-[13px] text-ink-2 sm:grid-cols-2">
                <span>Cost: {v.cost}</span>
                <span>Going back keeps your app’s data.</span>
              </div>
            </>
          ) : (
            <ul className="flex flex-col">
              {v.files.map((f) => (
                <li key={f} className="flex items-center justify-between border-t border-line py-2 font-mono text-[13px] first:border-0">
                  {f}
                  <Link href={`/p/${p.id}/code?file=${encodeURIComponent(f)}`} className="font-sans text-xs text-accent">
                    Open in Code
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
