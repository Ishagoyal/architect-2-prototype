"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../Icon";
import { useDismiss } from "../useDismiss";
import { accept, buildNow, confirmImport, reject, send, suggest, type Mode } from "@/lib/chat";
import { lowerFirst, planTotals, startBuild, STEP_MS, type ChatItem, type Project } from "@/lib/model";
import { useProjectUI } from "./ProjectUI";

/* Right panel: "Needs you" on top (hidden when empty, at most 2), chat below. */

type Need = {
  id: string;
  title: string;
  lines: React.ReactNode[];
  actions: { label: string; primary?: boolean; onClick?: () => void; href?: string }[];
};

function useNeeds(project: Project, update: (fn: (p: Project) => Project) => void): Need[] {
  const needs: Need[] = [];
  const base = `/p/${project.id}`;
  if (project.imported?.setup === "keys")
    needs.push({ id: "keys", title: "Add passwords and keys", lines: ["2 keys are missing, so the app can’t fully start."], actions: [{ label: "Continue setup", primary: true, href: `${base}/setup` }] });
  if (project.imported?.setup === "plan")
    needs.push({
      id: "confirm-import",
      title: "Confirm the plan to start building",
      lines: ["Until then, you can ask anything about your code."],
      actions: [
        { label: "Looks right", primary: true, onClick: () => update(confirmImport) },
        { label: "Fix it", onClick: () => update((p) => ({ ...p, chat: [...p.chat, { id: Math.random().toString(36).slice(2), type: "ai", text: "Tell me what’s wrong, in your own words. I’ll correct the plan and show you the change first." }] })) },
      ],
    });
  if (project.github?.clash)
    needs.push({ id: "clash", title: "1 file needs your choice", lines: ["The other 2 changes from GitHub came in without problems."], actions: [{ label: "Choose", primary: true, href: `${base}/settings?tab=github` }] });
  else if (project.github && project.github.behind > 0)
    needs.push({ id: "behind", title: `${project.github.behind} new changes on GitHub`, lines: ["Rahul changed lib/parse-hinglish.ts and 2 other files."], actions: [{ label: "Get latest", primary: true, href: `${base}/settings?tab=github` }] });
  if (project.suggestion)
    needs.push({
      id: "suggestion",
      title: "Suggested plan change",
      lines: project.suggestion.lines,
      actions: [
        { label: "Accept", primary: true, onClick: () => update(accept) },
        { label: "Reject", onClick: () => update(reject) },
      ],
    });
  if (project.build.status === "stopped") {
    const i = project.build.step;
    needs.push({
      id: "stopped",
      title: "Building is stopped",
      lines: [i > 0 ? `Steps 1–${i} are saved. Step ${i + 1} stopped, not tested.` : `Step 1 stopped, not tested.`],
      actions: [{ label: "Keep building", primary: true, onClick: () => update((p) => startBuild(p)) }],
    });
  }
  if (project.deploy?.status === "failed") {
    const d = project.deploy;
    needs.push({
      id: "deploy-failed",
      title: "Going live didn’t work",
      lines: [`Version ${d.failedVersion} is missing its Live OpenAI key.${d.liveVersion ? ` Version ${d.liveVersion} is still live.` : " Nothing went live."}`],
      actions: [
        { label: d.liveKey ? "Try again" : "Add the Live key", primary: true, href: `${base}/deploy` },
        { label: "See why", href: `${base}/deploy` },
      ],
    });
  }
  if (project.build.status === "done" && project.stage === "test" && !project.deploy?.liveVersion && project.deploy?.status !== "failed") {
    const t = planTotals(project.plan);
    needs.push({
      id: "built",
      title: "Your app is built",
      lines: [`All ${t.checks} checks passed · used ${project.creditsUsed}% of this month’s credits`],
      actions: [
        { label: "Go live", primary: true, href: `${base}/deploy` },
        { label: "See the checks", href: `${base}/tests` },
      ],
    });
  }
  return needs.slice(0, 2);
}

export function NeedsYou({ project, update }: { project: Project; update: (fn: (p: Project) => Project) => void }) {
  const needs = useNeeds(project, update);
  const { highlightNeeds } = useProjectUI();
  if (needs.length === 0) return null;
  return (
    <section aria-label="Needs you" className="flex shrink-0 flex-col gap-2.5 border-b border-line bg-needs p-4">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-accent-strong uppercase">
        <Icon name="flag" size={14} strokeWidth={2} />
        Needs you
      </div>
      {needs.map((n) => (
        <div
          key={n.id}
          className={`flex flex-col gap-2.5 rounded-xl border bg-panel p-3 transition-shadow ${
            highlightNeeds && n.id === "suggestion" ? "border-accent shadow-[0_0_0_4px_var(--accent-soft)]" : "border-accent-line"
          }`}
        >
          <span className="text-[13px] font-semibold">{n.title}</span>
          <span className="flex flex-col gap-0.5 text-[13px] text-ink-2">
            {n.lines.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {n.actions.map((a) =>
              a.href ? (
                <Link
                  key={a.label}
                  href={a.href}
                  className={a.primary ? "flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium text-on-primary" : "px-1 text-[13px] font-medium text-accent"}
                >
                  {a.label}
                </Link>
              ) : (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className={
                    a.primary
                      ? "flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium text-on-primary"
                      : "flex h-10 items-center rounded-[10px] border border-line-strong px-4 text-[13px] hover:bg-hover"
                  }
                >
                  {a.label}
                </button>
              ),
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export function needsCount(project: Project) {
  let n = 0;
  if (project.imported && project.imported.setup !== "done") n++;
  if (project.github && (project.github.clash || project.github.behind > 0)) n++;
  if (project.suggestion) n++;
  if (project.build.status === "stopped") n++;
  if (project.deploy?.status === "failed") n++;
  if (project.build.status === "done" && project.stage === "test" && !project.deploy?.liveVersion && project.deploy?.status !== "failed") n++;
  return Math.min(n, 2);
}

function Bot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[9px]">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-primary text-on-primary">
        <Icon name="sparkle" size={12} strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-2 text-[13px] leading-normal">{children}</div>
    </div>
  );
}

function FoldedLine({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between rounded-[10px] border border-line px-3 py-[9px] text-left text-xs text-ink-2">
      <span className="flex items-center gap-2">
        {dot && <span className="size-[7px] shrink-0 animate-pulse rounded-full bg-progress" />}
        {children}
      </span>
      <Icon name="chevronRight" size={13} strokeWidth={2} />
    </div>
  );
}

const actionLabel = { "plan-first": "Plan it first", "build-now": "Build it now", "see-plan": "See the plan" } as const;

function ChatLine({ item, project, onAction }: { item: ChatItem; project: Project; onAction: (a: keyof typeof actionLabel) => void }) {
  const base = `/p/${project.id}`;
  switch (item.type) {
    case "fold":
      return <FoldedLine>{item.text}</FoldedLine>;
    case "user":
      return <div className="ml-10 rounded-xl bg-sunken px-3.5 py-2.5 text-[13px] leading-normal">{item.text}</div>;
    case "step":
      return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-line p-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="text-good">
              <Icon name="check" size={15} strokeWidth={2.4} />
            </span>
            {item.title}
          </div>
          <div className="text-xs text-ink-2">{item.detail}</div>
        </div>
      );
    case "version":
      return (
        <div className="flex items-center justify-between gap-2 rounded-[10px] bg-sunken px-3 py-[9px] text-xs">
          <span className="flex min-w-0 items-center gap-[7px]">
            <Icon name="clock" size={13} />
            <strong className="font-semibold">v{item.n}</strong>
            <span className="truncate">{item.text}</span>
          </span>
          <span className="flex shrink-0 gap-2.5 whitespace-nowrap">
            <Link href={`${base}/versions?v=${item.n}`} className="font-medium text-accent">
              What changed
            </Link>
            <Link href={`${base}/versions?v=${item.n}`} className="text-ink-2">
              Go back
            </Link>
          </span>
        </div>
      );
    case "ai":
      return (
        <Bot>
          <span>{item.text}</span>
          {item.actions && (
            <span className="flex flex-wrap gap-2">
              {item.actions.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAction(a)}
                  className={
                    i === 0
                      ? "flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-on-primary"
                      : "flex h-8 items-center rounded-lg border border-line-strong px-3 text-xs hover:bg-hover"
                  }
                >
                  {actionLabel[a]}
                </button>
              ))}
            </span>
          )}
        </Bot>
      );
  }
}

export function ChatMessages({ project, update, now }: { project: Project; update: (fn: (p: Project) => Project) => void; now: number }) {
  const router = useRouter();
  const end = useRef<HTMLDivElement>(null);
  const running = project.build.status === "running";
  const step = project.plan.steps[project.build.step];
  const actions = running ? Math.min(9, 1 + Math.floor(((now - project.build.since) / STEP_MS) * 8)) : 0;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [project.chat.length]);

  const onAction = (a: keyof typeof actionLabel) => {
    if (a === "build-now") {
      update(buildNow);
      router.push(`/p/${project.id}/app`);
    } else {
      update(suggest);
      router.push(`/p/${project.id}/plan`);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <div className="mt-auto flex flex-col gap-3">
        {project.chat.map((item) => (
          <ChatLine key={item.id} item={item} project={project} onAction={onAction} />
        ))}
        {running && step && <FoldedLine dot>Writing {lowerFirst(step.title)}… {actions} actions</FoldedLine>}
        {project.build.status === "checking" && <FoldedLine dot>Checking the whole app…</FoldedLine>}
        <div ref={end} />
      </div>
    </div>
  );
}

const modes: Mode[] = ["Ask", "Plan", "Build"];

const plusItems: { icon: IconName; label: string; sub: string; chip: string }[] = [
  { icon: "folder", label: "Add files", sub: "Docs, spreadsheets or PDFs the app should use", chip: "menu.pdf" },
  { icon: "app", label: "Add a photo", sub: "E.g. your fridge or a sketch", chip: "fridge.jpg" },
  { icon: "explore", label: "Design reference", sub: "A screenshot, website link or Figma file", chip: "reference.png" },
  { icon: "share", label: "Connect an app", sub: "Gmail, Slack, Google Sheets and more", chip: "Google Sheets" },
  { icon: "plan", label: "Notes for the AI", sub: "How it should build, e.g. AGENTS.md", chip: "AGENTS.md" },
];

function PlusMenu({ onPick }: { onPick: (chip: string) => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Add files, photos or apps"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-[30px] items-center justify-center rounded-[9px] border border-line-strong bg-panel"
      >
        <Icon name="plus" size={15} strokeWidth={2} />
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-line bg-panel p-1.5 shadow-pop">
          {plusItems.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                onPick(it.chip);
                close();
              }}
              className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hover"
            >
              <span className="mt-0.5 text-ink-2">
                <Icon name={it.icon} size={15} />
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-medium">{it.label}</span>
                <span className="text-xs text-ink-2">{it.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const builders = [
  { key: "Auto", sub: "Picks the right level for each stage, balancing quality and credits.", tag: "Recommended" },
  { key: "Standard", sub: "Good for most apps and changes." },
  { key: "Max", sub: "For harder problems. Uses more credits per stage." },
];

/** Design A4 / A10: which AI writes the app. */
export function BuilderMenu({ size = "sm", placement = "up" }: { size?: "sm" | "md"; placement?: "up" | "down" }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState("Auto");
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Builder model: ${pick}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border bg-accent-soft font-medium text-accent-strong ${open ? "border-accent" : "border-transparent"} ${
          size === "md" ? "h-9 gap-1.5 px-3 text-[13px]" : "h-[30px] px-2 text-xs"
        }`}
      >
        <Icon name="sparkle" size={size === "md" ? 13 : 12} strokeWidth={2} />
        {size === "md" ? `Builder: ${pick}` : pick}
        <Icon name="chevronDown" size={11} strokeWidth={2} />
      </button>
      {open && (
        <div
          className={`absolute z-50 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-panel p-[18px] shadow-pop ${
            placement === "up" ? "right-0 bottom-full mb-2 md:right-auto md:left-0" : "top-full left-0 mt-2"
          }`}
        >
          <div className="text-base font-semibold">Builder model</div>
          <p className="mt-1 text-[13px] text-ink-2">The AI that writes your app. The AI inside your app is set later, in Refine.</p>
          <div role="radiogroup" className="mt-3 flex flex-col gap-2">
            {builders.map((b) => (
              <button
                key={b.key}
                type="button"
                role="radio"
                aria-checked={pick === b.key}
                onClick={() => {
                  setPick(b.key);
                  close();
                }}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left ${pick === b.key ? "border-accent bg-needs" : "border-line-strong hover:bg-hover"}`}
              >
                <span className={`mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full border ${pick === b.key ? "border-accent" : "border-ink-3"}`}>
                  {pick === b.key && <span className="size-2 rounded-full bg-accent" />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm">
                    {b.key}
                    {b.tag && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-strong">{b.tag}</span>}
                  </span>
                  <span className="text-xs text-ink-2">{b.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px] text-ink-2">
            <span className="flex items-center gap-2">
              <Icon name="lock" size={13} />
              Pick an exact model
            </span>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium">Developer add-on</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Composer({ project, update }: { project: Project; update: (fn: (p: Project) => Project) => void }) {
  const settingUp = !!project.imported && project.imported.setup !== "done";
  const [mode, setMode] = useState<Mode>(settingUp ? "Ask" : project.stage === "plan" ? "Plan" : "Build");
  const [text, setText] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const building = project.build.status === "running";
  const placeholder = settingUp ? "Ask about your code…" : building ? "Ask anything while it builds…" : "Ask for a change…";

  const submit = () => {
    const t = text.trim();
    if (!t && chips.length === 0) return;
    const message = [t, chips.length ? `(attached: ${chips.join(", ")})` : ""].filter(Boolean).join(" ");
    update((p) => send(p, message, mode));
    setText("");
    setChips([]);
  };

  return (
    <div className="shrink-0 border-t border-line px-3.5 pt-3 pb-3.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-2.5 rounded-[14px] border border-line-strong bg-panel p-3"
      >
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="flex items-center gap-1 rounded-lg bg-sunken px-2 py-1 text-xs">
                {c}
                <button type="button" aria-label={`Remove ${c}`} onClick={() => setChips((x) => x.filter((y) => y !== c))}>
                  <Icon name="close" size={11} strokeWidth={2.2} />
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          aria-label="Message"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          className="max-h-36 min-h-10 resize-none border-0 bg-transparent p-0 text-sm leading-[1.45] outline-none placeholder:text-ink-3"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <PlusMenu onPick={(c) => setChips((x) => (x.includes(c) ? x : [...x, c]))} />
            <div role="group" aria-label="Mode" className="flex gap-0.5 rounded-[10px] bg-sunken p-[3px]">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  title={m === "Ask" ? "Ask a question. Nothing changes." : m === "Plan" ? "Suggest a change to the plan first." : "Build the change straight away."}
                  className={`h-[30px] rounded-lg px-[9px] text-xs ${mode === m ? "border border-line bg-raised font-semibold text-ink" : "text-ink-2"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <BuilderMenu />
          </div>
          <button type="submit" aria-label="Send" className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-primary text-on-primary">
            <Icon name="send" size={15} strokeWidth={2.2} />
          </button>
        </div>
      </form>
    </div>
  );
}

export function PanelBody({ project, update, now }: { project: Project; update: (fn: (p: Project) => Project) => void; now: number }) {
  return (
    <>
      <NeedsYou project={project} update={update} />
      <ChatMessages project={project} update={update} now={now} />
      <Composer key={`${project.stage}-${project.imported?.setup ?? ""}`} project={project} update={update} />
    </>
  );
}
