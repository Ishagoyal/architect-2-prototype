"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../Icon";
import { DevTag } from "../DevTag";
import { btnOutline, btnPrimary } from "../Modal";
import { brokenCheck, fixBrokenCheck, goBackTo, timeAgo, undoTarget, type Project, type Version } from "@/lib/model";
import { diffs } from "@/lib/diffs";

/* Designs A22 / A23: every version, with what changed. Going back makes a new version. */

type Update = (fn: (p: Project) => Project) => void;
type GoBack = (n: number, only?: "code" | "plan" | "ai") => void;

/** A22: a change that turned a passing check red says so straight away, with Fix it and Undo. */
function Broken({ p, v, update, goBack }: { p: Project; v: Version; update: Update; goBack: GoBack }) {
  const check = brokenCheck(v);
  if (!check) return null;
  const back = undoTarget(p, v.n);
  return (
    <div role="alert" className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl px-3.5 py-3 text-[13px] ${v.fixedIn ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}>
      <span>
        {v.fixedIn ? `This change broke “${check}”. Fixed in v${v.fixedIn}: every check passes again.` : v.fixing ? `Fixing “${check}” now. Follow it in chat.` : `This change may have broken “${check}”.`}
      </span>
      <span className="flex items-center gap-3 font-semibold">
        {!v.fixing && !v.fixedIn && (
          <button type="button" onClick={() => update((q) => fixBrokenCheck(q, v.n))} className="rounded-md hover:underline">
            Fix it
          </button>
        )}
        {back && !v.fixedIn && (
          <button type="button" onClick={() => goBack(back.n)} title={`Go back to v${back.n}, saved as a new version`} className="rounded-md hover:underline">
            Undo
          </button>
        )}
      </span>
    </div>
  );
}

/** A23: the changed files, one diff at a time, and taking back only part of a version. */
function ChangedFiles({ p, v, latest, goBack }: { p: Project; v: Version; latest: boolean; goBack: GoBack }) {
  const [file, setFile] = useState(v.files[0]);
  const diff = diffs[file];
  return (
    <div className="flex flex-col gap-4">
      <div data-scene="changed-files" className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
        <ul className="flex flex-col gap-0.5 rounded-xl border border-line bg-panel p-1.5">
          {v.files.map((f) => {
            const d = diffs[f];
            return (
              <li key={f}>
                <button
                  type="button"
                  aria-current={f === file}
                  onClick={() => setFile(f)}
                  className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-mono text-[12.5px] ${f === file ? "bg-sunken" : "hover:bg-hover"}`}
                >
                  <span className="min-w-0 [overflow-wrap:anywhere]">{f}</span>
                  {d && (
                    <span className="shrink-0 text-xs text-ink-2">
                      {d.added > 0 && `+${d.added}`}
                      {d.removed > 0 && ` −${d.removed}`}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
            <span className="truncate font-mono text-[12.5px]">{file}</span>
            <Link href={`/p/${p.id}/code?file=${encodeURIComponent(file)}`} className="shrink-0 text-[13px] text-accent hover:text-accent-strong">
              Open in Code →
            </Link>
          </div>
          {diff ? (
            <div className="overflow-x-auto py-1 font-mono text-[12.5px] leading-[1.75]">
              {diff.lines.map((l, i) => (
                <div key={i} className={`grid grid-cols-[40px_18px_minmax(0,1fr)] pr-3 ${l.kind === "+" ? "bg-good-soft" : l.kind === "-" ? "bg-bad-soft" : ""}`}>
                  <span className="pr-2 text-right text-ink-3 select-none">{l.n}</span>
                  <span className={`select-none ${l.kind === "+" ? "text-good" : l.kind === "-" ? "text-bad" : ""}`} aria-label={l.kind === "+" ? "added" : l.kind === "-" ? "removed" : undefined}>
                    {l.kind === " " ? "" : l.kind === "-" ? "−" : "+"}
                  </span>
                  <span className="break-words whitespace-pre-wrap">{l.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-[13px] text-ink-2">Open it in Code to see the whole file.</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-sunken p-3.5">
        <span className="text-sm font-semibold">Go back to v{v.n}</span>
        <span className="flex flex-wrap gap-2">
          <button type="button" disabled={latest} onClick={() => goBack(v.n)} className={`${btnPrimary} disabled:cursor-default`}>
            Everything
          </button>
          {(["code", "plan", "ai"] as const).map((o) => (
            <button key={o} type="button" disabled={latest} onClick={() => goBack(v.n, o)} className={`${btnOutline} disabled:cursor-default disabled:opacity-60`}>
              {{ code: "Only the code", plan: "Only the plan", ai: "Only the app’s AI" }[o]}
            </button>
          ))}
        </span>
        <span className="text-xs text-ink-2">{latest ? "This is the version you’re on." : "Your app’s data stays either way. Going back is saved as a new version."}</span>
      </div>
    </div>
  );
}

export function VersionsView({
  project: p,
  update,
  now,
  selected,
  initialTab = "changes",
}: {
  project: Project;
  update: Update;
  now: number;
  selected?: number;
  initialTab?: "changes" | "files";
}) {
  const router = useRouter();
  const [pick, setPick] = useState<number>(selected ?? p.versions[0].n);
  const [tab, setTab] = useState<"changes" | "files">(initialTab);
  const v = p.versions.find((x) => x.n === pick) ?? p.versions[0];
  const latest = v.n === p.versions[0].n;
  const goBack: GoBack = (n, only) => {
    update((q) => goBackTo(q, n, Date.now(), only));
    setPick(p.versions[0].n + 1);
    setTab("changes");
    router.replace(`/p/${p.id}/versions`);
  };

  const tabs = (
    <div role="tablist" className="hidden gap-1 text-[13px] dev:flex">
      <button type="button" role="tab" aria-selected={tab === "changes"} onClick={() => setTab("changes")} className={`h-8 rounded-lg px-3 ${tab === "changes" ? "border border-line-strong bg-raised font-semibold" : "text-ink-2 hover:text-ink"}`}>
        Summary
      </button>
      <button type="button" role="tab" aria-selected={tab === "files"} onClick={() => setTab("files")} className={`flex h-8 items-center gap-2 rounded-lg px-3 ${tab === "files" ? "border border-line-strong bg-raised font-semibold" : "text-ink-2 hover:text-ink"}`}>
        Changed files ({v.files.length}) <DevTag />
      </button>
    </div>
  );

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

        {tab === "files" ? (
          <div className="flex min-w-0 flex-col gap-3 self-start">
            {tabs}
            <ChangedFiles key={v.n} p={p} v={v} latest={latest} goBack={goBack} />
          </div>
        ) : (
          <div data-scene="version-detail" className="flex min-w-0 flex-col gap-4 self-start rounded-2xl border border-line bg-panel p-5">
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
                  onClick={() => goBack(v.n)}
                  className={`${btnPrimary} disabled:cursor-default`}
                  title={latest ? "This is the version you’re on" : undefined}
                >
                  {latest ? "You’re on this version" : "Go back to this version"}
                </button>
              </span>
            </div>

            {tabs}

            <p className="text-[15px] leading-relaxed">{v.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {v.parts.map((x) => (
                <span key={x} className="rounded-lg bg-sunken px-2.5 py-1 text-[13px]">
                  {x}
                </span>
              ))}
            </div>
            {v.checks.length > 0 && (
              <div data-scene="checks" className="flex flex-col gap-3">
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
                <Broken p={p} v={v} update={update} goBack={goBack} />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 border-t border-line pt-3 text-[13px] text-ink-2 sm:grid-cols-2">
              <span>Cost: {v.cost}</span>
              <span>Going back keeps your app’s data{p.kind === "meal" ? " (families, meals)" : ""}.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
