"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon } from "../Icon";
import { DevOnly, DevTag } from "../DevTag";
import { Modal, btnOutline, btnPrimary } from "../Modal";
import { useDismiss } from "../useDismiss";
import { useProjectUI } from "../project/ProjectUI";
import { planMarkdown, planTotals, range, startBuild, uid, type Plan, type Project, type Step } from "@/lib/model";
import { confirmImport } from "@/lib/chat";

/* Designs A7–A8: the plan. Summary and Full plan are one switch; the plan is the final word. */

type Update = (fn: (p: Project) => Project) => void;

const green = "rounded bg-good-soft px-1 text-good";

function StepStatus({ project, i }: { project: Project; i: number }) {
  if (i < project.stepsDone)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-good">
        <Icon name="check" size={13} strokeWidth={2.4} /> Built
      </span>
    );
  if (project.build.step === i && project.build.status === "running")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-strong">
        <span className="size-[7px] animate-pulse rounded-full bg-progress" /> Building
      </span>
    );
  return null;
}

/* ---------- Summary ---------- */

function StepRow({ step, i, project, onOpen, pending = false }: { step: Step; i: number; project: Project; onOpen: () => void; pending?: boolean }) {
  const extra = project.suggestion?.changeStep?.index === i ? project.suggestion.changeStep.extra : null;
  const Tag = pending ? "div" : "button";
  return (
    <Tag
      {...(pending ? {} : { type: "button" as const, onClick: onOpen })}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${
        pending ? "border-dashed border-good bg-good-soft" : step.added ? "border-info bg-info-soft/40" : "border-line bg-panel hover:border-line-strong"
      }`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sunken text-[13px] font-semibold">{i + 1}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">
          {step.title}
          {pending && <span className="font-normal text-good"> · new, if you accept</span>}
        </span>
        <span className="text-[13px] text-ink-2">
          {step.sub}
          {step.extra}
          {extra && <span className={green}>{extra}</span>}
        </span>
        <DevOnly>
          <span className="font-mono text-xs text-dev">
            Files: {step.files.join(", ")} · <span className="font-sans">Builder model: Auto</span>
          </span>
        </DevOnly>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-ink-2">
        <StepStatus project={project} i={i} />
        <span className={pending ? "text-good" : ""}>{pending ? `+${step.checks.length} checks` : `${step.checks.length} checks`}</span>
        <span className={pending ? "text-good" : ""}>usually {range(step.cost)}</span>
      </span>
      {!pending && <Icon name="chevronRight" size={15} strokeWidth={2} className="shrink-0 text-ink-2" />}
    </Tag>
  );
}

function Mockup({ project, big = false }: { project: Project; big?: boolean }) {
  const meal = project.kind === "meal";
  return (
    <div className={`flex flex-col gap-2 rounded-xl border border-[#F0DDD0] bg-[#FFF6EA] p-3 ${big ? "min-h-24" : ""}`}>
      <span className="font-serif text-xl text-[#7A3A12]">{meal ? "Dinner ke liye?" : project.template.heading}</span>
      {!big && (
        <span className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((k) => (
            <span key={k} className="h-[92px] rounded-md border border-[#F0DDD0] bg-white" />
          ))}
        </span>
      )}
    </div>
  );
}

function Summary({ project, onStep, onFull }: { project: Project; onStep: (i: number) => void; onFull: () => void }) {
  const plan = project.plan;
  const t = planTotals(plan);
  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:p-7 lg:grid-cols-[minmax(0,1fr)_250px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-[34px] leading-tight">What your app does</h2>
          <p className="text-[17px] leading-relaxed text-ink-2">{plan.what}</p>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="flex flex-wrap items-baseline gap-2">
            <strong className="text-[15px] font-semibold">Built in {plan.steps.length} steps</strong>
            <span className="text-[13px] text-ink-2" title="An example range, from similar steps in past builds">
              · usually {t.cost} of this month’s credits
            </span>
            <span className="hidden dev:inline">
              <DevTag />
            </span>
          </span>
          <button type="button" onClick={onFull} className="text-[13px] font-medium text-accent">
            Read the full plan
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {plan.steps.map((s, i) => (
            <StepRow key={i} step={s} i={i} project={project} onOpen={() => onStep(i)} />
          ))}
          {project.suggestion && <StepRow step={project.suggestion.step} i={plan.steps.length} project={project} onOpen={() => {}} pending />}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {plan.ai && (
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-4">
            <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">The app’s AI</span>
            <span className="text-[15px] font-semibold">{plan.ai.name}</span>
            <span className="text-[13px] leading-normal text-ink-2">{plan.ai.does}</span>
            <span className="text-[13px] text-ink-2">{plan.ai.runs === "When someone asks" ? "Runs when someone asks." : "Runs by itself at 9 PM and 3 PM."}</span>
            <DevOnly>
              <div className="flex flex-col gap-1 border-t border-line pt-2 text-xs text-dev">
                <DevTag className="self-start" />
                <span>Framework: Lyzr · Model: gpt-4.1-mini</span>
                <span className="font-mono">Files: agents/{project.kind === "meal" ? "meal-planner" : "assistant"}/</span>
              </div>
            </DevOnly>
            <Link href={`/p/${project.id}/agents`} className="text-[13px] font-medium text-accent">
              See in Agents
            </Link>
          </div>
        )}
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Mockup</span>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">{project.stepsDone ? "Being built" : "Not built yet"}</span>
          </div>
          <Mockup project={project} />
          <button type="button" onClick={onFull} className="self-start text-[13px] font-medium text-accent">
            Open all {plan.screens.length} screens
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Full plan ---------- */

const sections = ["What it does", "Who uses it", "What people can do", "Screens", "The app’s AI", "What it saves", "Keys it needs", "Build steps and checks", "Not in this version", "Open questions"];
const importedSections = ["What it does", "Who uses it", "What people can do", "Screens we found", "The app’s AI", "What it saves", "Keys it needs", "What works today", "Notes for AI tools", "Open questions"];

function Section({ n, title, children, changed }: { n: number; title: string; children: React.ReactNode; changed?: boolean }) {
  return (
    <section id={`s${String(n).replace(".", "-")}`} className="flex scroll-mt-4 flex-col gap-3 border-t border-line pt-6">
      <h2 className="flex items-baseline gap-2 text-xl font-semibold">
        <span className="text-xs font-normal text-ink-2">{Number.isInteger(n) ? n : ""}</span>
        {title}
        {changed && <span className="size-2 rounded-full bg-good" aria-label="has a suggested change" />}
      </h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head?: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full min-w-[420px] text-left text-[13px]">
        {head && (
          <thead>
            <tr className="border-b border-line text-xs text-ink-2">
              {head.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 align-top ${j === 0 && !head ? "w-36 font-semibold" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListEdit({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <textarea
      aria-label={label}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      rows={Math.max(3, value.length + 1)}
      className="w-full resize-y rounded-xl border-2 border-dev bg-panel px-4 py-3 text-[15px] leading-relaxed outline-none"
    />
  );
}

function FullPlan({
  project,
  update,
  editing,
  draft,
  setDraft,
  onStep,
}: {
  project: Project;
  update: Update;
  editing: boolean;
  draft: Plan;
  setDraft: (p: Plan) => void;
  onStep: (i: number) => void;
}) {
  const plan = editing ? draft : project.plan;
  const s = project.suggestion;
  const t = planTotals(plan);
  const base = `/p/${project.id}`;
  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:p-7 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-4 flex flex-col gap-0.5">
          <span className="px-2 pb-2 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">On this page</span>
          {(plan.found ? importedSections : sections).map((title, i) => (
            <a key={title} href={`#s${i + 1}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-hover">
              <span className="w-4 text-xs text-ink-2">{i + 1}</span>
              <span className="flex-1">{title}</span>
              {(s ? [2, 5, 7, 8] : plan.found ? [4, 7, 9] : []).includes(i) && <span className="size-1.5 rounded-full bg-good" />}
            </a>
          ))}
        </div>
      </nav>

      <article className="flex min-w-0 flex-col gap-6">
        <header className="flex flex-col gap-1">
          <span className="text-xs text-ink-2">
            Plan · {plan.found ? <>written from your code in <span className="font-mono">{plan.found.repo}</span></> : <>version {project.planVersion} · {project.planVersion > 1 ? "saved by you" : "written from your prompt and Refine"}</>}
          </span>
          <h1 className="font-serif text-[38px] leading-tight">{project.name}</h1>
          <span className="text-[15px] text-ink-2">{plan.tagline}</span>
        </header>

        <Section n={1} title="What it does">
          {editing ? (
            <textarea
              aria-label="What it does"
              value={draft.what}
              onChange={(e) => setDraft({ ...draft, what: e.target.value })}
              rows={4}
              className="w-full resize-y rounded-xl border-2 border-dev bg-panel px-4 py-3 text-[15px] leading-relaxed outline-none"
            />
          ) : (
            <p className="text-[15px] leading-relaxed">{plan.what}</p>
          )}
          <p className="text-[15px] leading-relaxed">
            <strong className="font-semibold">Why:</strong> {plan.why}
          </p>
          {plan.found && (
            <div className="flex flex-wrap gap-1.5">
              {plan.found.stack.map((t) => (
                <span key={t} className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs">
                  {t}
                </span>
              ))}
              <span className="rounded-full bg-good-soft px-2.5 py-0.5 text-xs text-good">Your code stays as it is</span>
            </div>
          )}
        </Section>

        <Section n={2} title="Who uses it">
          <Table head={["Person", "What they do"]} rows={plan.people.map(([a, b]) => [<strong key="a" className="font-semibold">{a}</strong>, b])} />
        </Section>

        <Section n={3} title="What people can do" changed={!!s}>
          {editing ? (
            <ListEdit label="What people can do, one per line" value={draft.can} onChange={(can) => setDraft({ ...draft, can })} />
          ) : (
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
              {plan.can.map((c) => (
                <li key={c}>{c}</li>
              ))}
              {s?.can.map((c) => (
                <li key={c}>
                  <span className={green}>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section n={4} title={plan.found ? "Screens we found" : "Screens"}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {plan.screens.map((sc) => (
              <div key={sc.title} className="flex flex-col gap-1">
                <span className="flex h-24 items-start rounded-lg border border-[#F0DDD0] bg-[#FFF6EA] p-2 font-serif text-[15px] text-[#7A3A12]">{sc.label}</span>
                <span className="text-[13px] font-semibold">{sc.title}</span>
                <span className={`text-xs text-ink-2 ${plan.found ? "font-mono" : ""}`}>{sc.sub}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-ink-2">{plan.found ? "Found in your code. The real app is in the App tab." : `Mockups only. ${project.stepsDone ? "The real app is in the App tab." : "Nothing is built yet."}`}</span>
        </Section>

        <Section n={5} title="The app’s AI">
          {plan.ai ? (
            <Table
              rows={[
                ["Name", plan.ai.name],
                ["Reads", plan.ai.reads],
                ["Can’t", plan.ai.cant],
                ["Runs by itself", plan.ai.runs],
                ["Cost", plan.ai.cost],
              ]}
            />
          ) : (
            <p className="text-[15px] text-ink-2">This app doesn’t use an AI model.</p>
          )}
        </Section>

        <Section n={6} title="What it saves" changed={!!s}>
          <Table
            head={["What", "Example"]}
            rows={[
              ...plan.saves.map(([a, b]) => [a, b]),
              ...(s?.saves.map(([a, b]) => [<span key="a" className={green}>{a}</span>, <span key="b" className={green}>{b}</span>]) ?? []),
            ]}
          />
        </Section>

        <Section n={7} title="Keys it needs">
          <Table head={["Key", "Why", "Status"]} rows={plan.keys.map(([a, b, c]) => [a, b, <span key="c" className="text-good">{c}</span>])} />
        </Section>

        {plan.found && (
          <Section n={8} title="What works today">
            <p className="text-[15px] text-ink-2">
              I ran your app’s main actions once. {plan.found.works.filter((w) => w[1]).length} of {plan.found.works.length} work.
            </p>
            <ul className="flex flex-col">
              {plan.found.works.map(([w, ok, why]) => (
                <li key={w} className="flex items-center gap-2.5 border-t border-line py-2 text-sm">
                  <span className={ok ? "text-good" : "text-bad"}>{ok ? "✓" : "✗"}</span>
                  {w}
                  {why && <span className="text-ink-2">· {why}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}
        <Section n={plan.found ? 8.5 : 8} title={plan.found ? "Steps to fix what doesn’t work" : "Build steps and checks"} changed={!!s}>
          <p className="text-[15px] leading-relaxed text-ink-2">
            Each step is built, then its checks run. “Usually uses” is a share of this month’s credits, based on similar steps in past builds. It can be more if
            fixes are needed.
          </p>
          <Table
            head={["#", "Step", "Checks", "Usually uses"]}
            rows={[
              ...plan.steps.map((st, i) => [
                i + 1,
                <button key="s" type="button" onClick={() => onStep(i)} className="flex flex-col text-left">
                  <strong className={`font-semibold ${st.added === "edited" ? "text-info" : ""}`}>{st.title}</strong>
                  <span className="text-ink-2">
                    {st.sub}
                    {st.extra}
                    {s?.changeStep?.index === i && <span className={green}>{s.changeStep.extra}</span>}
                  </span>
                </button>,
                <button key="c" type="button" onClick={() => onStep(i)} className="text-accent">
                  {st.checks.length} checks
                </button>,
                range(st.cost),
              ]),
              ...(s
                ? [
                    [
                      <span key="n" className={green}>{plan.steps.length + 1}</span>,
                      <span key="s" className="flex flex-col">
                        <strong className={`font-semibold ${green} self-start`}>{s.step.title}</strong>
                        <span className="text-ink-2">{s.step.sub}</span>
                      </span>,
                      <span key="c" className={green}>+{s.step.checks.length} checks</span>,
                      <span key="u" className={green}>{range(s.step.cost)}</span>,
                    ],
                  ]
                : []),
            ]}
          />
          <p className="text-[13px] text-ink-2">
            Whole app, at the end: {plan.wholeApp.join(" · ")}.{" "}
            <Link href={`${base}/tests`} className="text-accent">
              See all checks
            </Link>
          </p>
        </Section>

        {plan.found ? (
          <Section n={9} title="Notes for AI tools">
            <p className="text-[15px]">{plan.found.notes}</p>
          </Section>
        ) : (
        <Section n={9} title="Not in this version">
          {editing ? (
            <ListEdit label="Not in this version, one per line" value={draft.notIn} onChange={(notIn) => setDraft({ ...draft, notIn })} />
          ) : (
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
              {plan.notIn.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </Section>
        )}

        <Section n={10} title="Open questions">
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-4">
            <span className="text-[15px]">{plan.question.q}</span>
            <div className="flex flex-wrap gap-2">
              {plan.question.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-pressed={project.answer === o}
                  onClick={() => update((p) => ({ ...p, answer: o }))}
                  className={`h-9 rounded-[10px] border px-3 text-[13px] ${project.answer === o ? "border-primary bg-primary text-on-primary" : "border-line-strong hover:bg-hover"}`}
                >
                  {o}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-2">{project.answer ? `Answered: “${project.answer}”.` : `If you don’t answer, the plan uses “${plan.question.fallback}”.`}</span>
          </div>
        </Section>

        {project.stage === "plan" &&
          !editing &&
          (project.imported?.setup === "keys" ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center">
              <span className="flex flex-col gap-1">
                <strong className="text-[15px] font-semibold">Add the missing keys first</strong>
                <span className="text-[13px] text-ink-2">2 keys are missing, so the app can’t fully start. Building waits until they’re added.</span>
              </span>
              <Link href={`/p/${project.id}/setup`} className={btnPrimary}>
                Continue setup
              </Link>
            </div>
          ) : project.imported?.setup === "plan" ? (
            <LooksRight update={update} />
          ) : (
            <ReadyCard project={project} update={update} t={t} />
          ))}
      </article>
    </div>
  );
}

/* ---------- Step details (A7.5 / A7.6) ---------- */

function StepPanel({ project, i, onClose, onChange }: { project: Project; i: number; onClose: () => void; onChange: () => void }) {
  const step = project.plan.steps[i];
  const built = i < project.stepsDone;
  return (
    <div className="absolute inset-0 z-30 flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-scrim" />
      <div role="dialog" aria-label={`Step ${i + 1}: ${step.title}`} className="relative flex h-full w-full max-w-[470px] flex-col bg-panel shadow-pop">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <span className="flex flex-col">
            <span className="text-xs text-ink-2">
              Step {i + 1} of {project.plan.steps.length}
            </span>
            <span className="text-lg font-semibold">{step.title}</span>
          </span>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-9 items-center justify-center rounded-[10px] hover:bg-hover">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">What it builds</span>
            <p className="text-[15px] leading-relaxed">{step.builds}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Where you’ll see it</span>
            <span className="flex h-24 items-start rounded-xl border border-[#F0DDD0] bg-[#FFF6EA] p-3 font-serif text-xl text-[#7A3A12]">
              {step.kind === "ai" || step.kind === "screens" ? (project.kind === "meal" ? "Dinner ke liye?" : project.template.heading) : step.where}
            </span>
            <span className="text-xs text-ink-2">{step.where} · mockup</span>
          </div>
          <DevOnly>
            <div className="flex flex-col gap-1.5 rounded-xl bg-dev-soft p-3 text-[13px] text-dev">
              <DevTag className="self-start bg-panel" />
              <span>
                <strong className="font-semibold">Files it will create or change:</strong> <span className="font-mono text-xs">{step.files.join(", ")}</span>
              </span>
              <span>
                <strong className="font-semibold">Models:</strong> builder Auto{step.kind === "ai" ? " · app’s AI gpt-4.1-mini" : ""}
              </span>
              {step.uses && (
                <span>
                  <strong className="font-semibold">Uses from earlier steps:</strong> {step.uses}
                </span>
              )}
            </div>
          </DevOnly>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Usually uses</span>
            <p className="text-[15px] leading-relaxed">{range(step.cost)} of this month’s credits, based on similar steps in past builds. It can be more if fixes are needed.</p>
          </div>
          <div className="flex flex-col">
            <span className="pb-2 text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Checks for this step · {step.checks.length}</span>
            {step.checks.map((c) => (
              <div key={c} className="flex items-center justify-between gap-3 border-t border-line py-2.5 text-sm">
                {c}
                <span className={`shrink-0 text-[13px] ${built ? "text-good" : "text-ink-2"}`}>{built ? "Passed" : "Not run yet"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <Link href={`/p/${project.id}/tests`} className="text-[13px] font-medium text-accent">
            See all checks
          </Link>
          {project.stage === "plan" && (
            <button type="button" onClick={onChange} className={btnOutline}>
              Change this in the plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Download (A7.4) ---------- */

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function mdToHtml(md: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return md
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("# ")) return `<h1>${esc(block.slice(2))}</h1>`;
      if (block.startsWith("## ")) return `<h2>${esc(block.slice(3))}</h2>`;
      if (block.startsWith("|")) {
        const rows = block.split("\n").filter((r) => !/^\|\s*---/.test(r));
        return `<table border="1" cellpadding="6" style="border-collapse:collapse">${rows
          .map((r) => `<tr>${r.split("|").slice(1, -1).map((c) => `<td>${esc(c.trim())}</td>`).join("")}</tr>`)
          .join("")}</table>`;
      }
      return `<p>${esc(block).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function DownloadMenu({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const file = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const md = () => planMarkdown(project);
  const html = () => `<html><head><meta charset="utf-8"><title>${project.name}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.5}td{vertical-align:top}</style></head><body>${mdToHtml(md())}</body></html>`;
  const items = [
    {
      label: "PDF",
      sub: "To read or share",
      go: () => {
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(html());
        w.document.close();
        w.focus();
        w.print();
      },
    },
    { label: "Word", sub: "To edit", go: () => download(`${file}-plan.doc`, "application/msword", html()) },
    { label: "Markdown", sub: "The same text as plan.md", go: () => download(`plan.md`, "text/markdown", md()) },
  ];
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${btnOutline} gap-2`}>
        <Icon name="download" size={14} strokeWidth={2} />
        <span className="hidden sm:inline">Download plan</span>
        <Icon name="chevronDown" size={12} strokeWidth={2} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-40 mt-1.5 w-64 rounded-xl border border-line bg-panel p-1.5 shadow-pop">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                it.go();
                close();
              }}
              className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-hover"
            >
              <span className="text-[13px] font-medium">{it.label}</span>
              <span className="text-xs text-ink-2">{it.sub}</span>
            </button>
          ))}
          <p className="border-t border-line px-3 pt-2 pb-1 text-xs text-ink-2">Downloads the plan as it is now, without suggestions you haven’t accepted.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Confirm ---------- */

function useConfirm(project: Project, update: Update) {
  const router = useRouter();
  const { pointAtNeeds } = useProjectUI();
  const [waiting, setWaiting] = useState(false);
  const build = () => {
    update((p) => startBuild(p));
    router.push(`/p/${project.id}/app`);
  };
  const confirm = () => (project.suggestion ? setWaiting(true) : build());
  const modal = (
    <Modal
      open={waiting}
      onClose={() => setWaiting(false)}
      title="A suggested change is waiting"
      actions={
        <>
          <button type="button" data-tour="build-without" onClick={build} className={btnOutline}>
            Build without it
          </button>
          <button
            type="button"
            onClick={() => {
              setWaiting(false);
              pointAtNeeds();
            }}
            className={btnPrimary}
          >
            Show me in Needs you
          </button>
        </>
      }
    >
      <p>
        It’s in <strong>Needs you</strong>, on the right →
        <br />
        {project.suggestion?.lines.filter((l) => !l.startsWith("+ 2") && !l.startsWith("+ 1")).map((l) => l.slice(2)).join(", and ")}. It isn’t in the plan yet, so it won’t be
        built.
      </p>
    </Modal>
  );
  return { confirm, modal };
}

function ReadyCard({ project, update, t }: { project: Project; update: Update; t: ReturnType<typeof planTotals> }) {
  const { confirm, modal } = useConfirm(project, update);
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center">
      <span className="flex flex-col gap-1">
        <strong className="text-[15px] font-semibold">Ready to build?</strong>
        <span className="text-[13px] text-ink-2">
          I’ll build what’s in this plan: {t.steps} steps and {t.checks} checks. It usually uses {t.cost} of this month’s credits.
        </span>
      </span>
      <button type="button" onClick={confirm} className={btnPrimary}>
        Confirm plan and build
      </button>
      {modal}
    </div>
  );
}

function LooksRight({ update }: { update: Update }) {
  const { openPanel } = useProjectUI();
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center">
      <span className="flex flex-col gap-1">
        <strong className="text-[15px] font-semibold">Does this look right?</strong>
        <span className="text-[13px] text-ink-2">Every build and check will use this plan.</span>
      </span>
      <span className="flex gap-2">
        <button type="button" onClick={() => { fixByChat(update); openPanel(); }} className={btnOutline}>
          Fix it by chat
        </button>
        <button type="button" onClick={() => update(confirmImport)} className={btnPrimary}>
          Looks right
        </button>
      </span>
    </div>
  );
}

function fixByChat(update: Update) {
  update((p) => ({ ...p, chat: [...p.chat, { id: uid(), type: "ai", text: "Tell me what’s wrong, in your own words. I’ll correct the plan and show you the change first." }] }));
}

/* ---------- The page ---------- */

function diffPlan(before: Plan, after: Plan) {
  const clean = (l: string[]) => l.map((x) => x.trim()).filter(Boolean);
  const oldCan = clean(before.can);
  const newCan = clean(after.can);
  const added = newCan.filter((c) => !oldCan.includes(c));
  const removed = oldCan.filter((c) => !newCan.includes(c));
  const steps: Step[] = added.map((line) => {
    const words = line.replace(/[^\w\s’']/g, "").split(/\s+/).filter((w) => w.length > 2 && !/^(the|and|for|with|from|that|this|can|get)$/i.test(w));
    const title = /favourite/i.test(line) ? "Favourites" : words.slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "New step";
    return {
      title,
      sub: line,
      kind: "feature",
      checks: [line.length > 60 ? `${line.slice(0, 57)}…` : line, "Still works after a reload"],
      cost: [1, 2],
      builds: line,
      where: "Where it fits best, on the main screen",
      files: [`app/${title.toLowerCase().replace(/\s+/g, "-")}.tsx`],
      added: "edited",
    };
  });
  const plan: Plan = { ...after, can: newCan, notIn: clean(after.notIn), steps: [...before.steps, ...steps] };
  const parts: string[] = [];
  steps.forEach((s, k) => parts.push(`step ${before.steps.length + k + 1} ${s.title} added`));
  if (removed.length) parts.push(`${removed.length} line${removed.length > 1 ? "s" : ""} removed`);
  if (after.what.trim() !== before.what.trim()) parts.push("“What it does” changed");
  const newChecks = steps.length * 2;
  const note = parts.length ? `Plan saved. ${parts.join(", ").replace(/^./, (c) => c.toUpperCase())}${newChecks ? `, ${newChecks} new checks` : ""}.` : "Plan saved. Nothing changed.";
  return { plan, note, stepsAdded: steps.length };
}

export function PlanView({ project, update }: { project: Project; update: Update }) {
  const reviewingImport = project.imported?.setup === "plan";
  const [view, setView] = useState<"summary" | "full">(project.imported && project.imported.setup !== "done" ? "full" : "summary");
  const { openPanel } = useProjectUI();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Plan>(project.plan);
  const [saved, setSaved] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const { confirm, modal } = useConfirm(project, update);
  const unsaved = editing && JSON.stringify(draft) !== JSON.stringify(project.plan);
  const canEdit = project.stage === "plan";

  const startEdit = () => {
    setDraft(project.plan);
    setEditing(true);
    setView("full");
    setSaved(null);
  };
  const save = () => {
    const { plan, note } = diffPlan(project.plan, draft);
    update((p) => ({
      ...p,
      plan,
      planVersion: p.planVersion + 1,
      chat: [...p.chat, { id: uid(), type: "ai", text: note.startsWith("Plan saved. Nothing") ? "The plan is the same as before." : `You changed the plan. I updated the steps and checks to match. ${note.replace("Plan saved. ", "")}` }],
    }));
    setSaved(note);
    setEditing(false);
  };

  return (
    <div className="relative flex min-h-full flex-col">
      <div className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-4 py-3 md:px-5">
        {reviewingImport && !editing ? (
          <>
            <strong className="text-[13px] font-semibold">Here’s what we think your app does</strong>
            <span className="flex gap-2">
              <button type="button" onClick={startEdit} className={`${btnOutline} gap-1.5`}>
                <Icon name="pencil" size={14} />
                Edit
              </button>
              <button type="button" onClick={() => { fixByChat(update); openPanel(); }} className={btnOutline}>
                Fix it by chat
              </button>
              <button type="button" data-tour="looks-right" onClick={() => update(confirmImport)} className={btnPrimary}>
                Looks right
              </button>
            </span>
          </>
        ) : editing ? (
          <>
            <span className="flex items-center gap-3 text-[13px]">
              <span className="size-2 rounded-full bg-dev" />
              <strong className="font-semibold">Editing the plan</strong>
              <span className="text-ink-2">{unsaved ? "Changes not saved" : "No changes yet"}</span>
            </span>
            <span className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className={btnOutline}>
                Cancel
              </button>
              <button type="button" onClick={save} className={btnPrimary}>
                Save
              </button>
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-3">
              <strong className="hidden text-[13px] font-semibold sm:inline">
                {project.stage === "plan" ? "Plan ready" : project.build.status === "running" ? "Building from this plan" : "Plan"}
              </strong>
              <span role="tablist" className="flex gap-0.5 rounded-[10px] bg-sunken p-[3px]">
                {(["summary", "full"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={view === v}
                    onClick={() => setView(v)}
                    className={`h-[30px] rounded-lg px-3 text-[13px] ${view === v ? "border border-line bg-raised font-semibold" : "text-ink-2"}`}
                  >
                    {v === "summary" ? "Summary" : "Full plan"}
                  </button>
                ))}
              </span>
            </span>
            <span className="flex items-center gap-2">
              {view === "full" && canEdit && (
                <button type="button" onClick={startEdit} className={`${btnOutline} gap-1.5`}>
                  <Icon name="pencil" size={14} />
                  Edit
                </button>
              )}
              <DownloadMenu project={project} />
              {project.imported?.setup === "keys" ? (
                <Link href={`/p/${project.id}/setup`} className={btnPrimary}>
                  Add keys first
                </Link>
              ) : project.stage === "plan" ? (
                <button type="button" data-tour="plan-confirm" onClick={confirm} className={btnPrimary}>
                  <span className="sm:hidden">Build</span>
                  <span className="hidden sm:inline">Confirm plan and build</span>
                </button>
              ) : (
                <Link href={`/p/${project.id}/app`} className={btnPrimary}>
                  See the app
                </Link>
              )}
            </span>
          </>
        )}
      </div>
      {saved && (
        <div className="flex items-center gap-2 border-b border-line bg-info-soft px-5 py-2.5 text-[13px] text-info">
          <Icon name="check" size={14} strokeWidth={2.4} />
          <span>
            <strong className="font-semibold">{saved.split(". ")[0]}.</strong> {saved.split(". ").slice(1).join(". ")}
          </span>
        </div>
      )}

      {view === "summary" ? (
        <Summary project={project} onStep={setOpenStep} onFull={() => setView("full")} />
      ) : (
        <FullPlan project={project} update={update} editing={editing} draft={draft} setDraft={setDraft} onStep={setOpenStep} />
      )}

      {openStep !== null && project.plan.steps[openStep] && (
        <StepPanel
          project={project}
          i={openStep}
          onClose={() => setOpenStep(null)}
          onChange={() => {
            setOpenStep(null);
            startEdit();
          }}
        />
      )}
      {modal}
    </div>
  );
}
