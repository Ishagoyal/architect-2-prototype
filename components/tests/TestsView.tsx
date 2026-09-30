"use client";

import { useState } from "react";
import { planTotals, STEP_MS, timeAgo, type Project } from "@/lib/model";
import { btnOutline } from "../Modal";

/* Design A21: checks live in their own tab, grouped by step, plus whole-app checks at the end.
   A check for a step that isn't built yet says "Not run yet", never "Failed". */

function Pill({ state, when }: { state: "passed" | "running" | "not-run"; when?: string }) {
  if (state === "passed") return <span className="shrink-0 rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-medium text-good">Passed{when ? ` · ${when}` : ""}</span>;
  if (state === "running")
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-strong">
        <span className="size-1.5 animate-pulse rounded-full bg-progress" /> Running
      </span>
    );
  return <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2">Not run yet</span>;
}

export function TestsView({ project: p, now }: { project: Project; now: number }) {
  const [rerun, setRerun] = useState(0);
  const rerunning = now - rerun < 2500;
  const t = planTotals(p.plan);
  const stepChecks = p.plan.steps.reduce((s, x, i) => s + (i < p.stepsDone ? x.checks.length : 0), 0);
  const wholeDone = p.build.status === "done";
  const passing = stepChecks + (wholeDone ? p.plan.wholeApp.length : 0);
  const doneAt = (i: number) => {
    const v = p.versions.find((x) => x.title.startsWith(`Step ${i + 1}:`));
    return v ? timeAgo(v.at, now) : undefined;
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
        <span className="flex flex-wrap items-baseline gap-x-3">
          <strong className="font-semibold">{p.build.status === "checking" || wholeDone ? "Checking the whole app" : "Checks"}</strong>
          <span className="text-ink-2">
            {passing} of {t.checks} checks passing · the full list runs again before going live
          </span>
        </span>
        <button type="button" disabled={p.stepsDone === 0 || rerunning} onClick={() => setRerun(Date.now())} className={`${btnOutline} disabled:opacity-50`}>
          {rerunning ? "Running…" : "Run all checks"}
        </button>
      </div>

      <div className="flex flex-col gap-3.5 p-4 md:p-5">
        {p.plan.steps.map((s, i) => {
          const running = p.build.status === "running" && p.build.step === i;
          const frac = running ? (now - p.build.since) / STEP_MS : 0;
          return (
            <section key={i} className="overflow-hidden rounded-xl border border-line bg-panel">
              <h2 className="border-b border-line px-4 py-2.5 text-sm font-semibold">
                Step {i + 1} · {s.title}
              </h2>
              {s.checks.map((c, k) => {
                const state = rerunning && i < p.stepsDone ? "running" : i < p.stepsDone ? "passed" : running && frac > (k + 1) / (s.checks.length + 1) ? "running" : "not-run";
                return (
                  <div key={c} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                    {c}
                    <Pill state={state} when={state === "passed" ? doneAt(i) : undefined} />
                  </div>
                );
              })}
            </section>
          );
        })}
        <section className="overflow-hidden rounded-xl border border-line bg-panel">
          <h2 className="border-b border-line px-4 py-2.5 text-sm font-semibold">Whole app · runs at the end</h2>
          {p.plan.wholeApp.map((c) => (
            <div key={c} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
              {c}
              <Pill state={rerunning && wholeDone ? "running" : wholeDone ? "passed" : p.build.status === "checking" ? "running" : "not-run"} when={wholeDone ? timeAgo(p.build.since, now) : undefined} />
            </div>
          ))}
        </section>
        <p className="text-xs text-ink-2">The AI can’t quietly change a check. If it wants to, it asks you first in Needs you.</p>
      </div>
    </div>
  );
}
