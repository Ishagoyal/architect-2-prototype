"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { DevOnly, DevTag } from "../DevTag";
import { Modal, btnOutline, btnPrimary } from "../Modal";
import { useProjectUI } from "../project/ProjectUI";
import { uid, type Project } from "@/lib/model";

/* Designs C1–C8: the app's agents and automations. Click any box to change it. */

type Update = (fn: (p: Project) => Project) => void;

type Tool = { name: string; on: boolean; note: string; id: string };
type Agent = {
  key: string;
  name: string;
  framework: string;
  where: string;
  does: string;
  never: string;
  asks: string;
  reply: [string, string];
  tools: Tool[];
  connected?: boolean;
};

function agentsFor(p: Project): Agent[] {
  return baseAgents(p).map((a) => {
    const e = p.agentEdits?.[a.key];
    return e ? { ...a, does: e.does, never: e.never, tools: a.tools.map((t, i) => ({ ...t, on: e.tools[i] ?? t.on })) } : a;
  });
}

function baseAgents(p: Project): Agent[] {
  if (p.imported)
    return [
      {
        key: "suggester",
        name: "Meal suggester",
        framework: "LangGraph",
        where: "agents/graph.py",
        does: "Suggests meals for today from what’s in the kitchen.",
        never: "Change the kitchen stock.",
        asks: "e.g. What can we cook tonight?",
        reply: ["Meal ideas", "name, dishes"],
        tools: [
          { name: "Kitchen items", on: true, note: "read only", id: "db.read" },
          { name: "Photos", on: true, note: "", id: "vision" },
        ],
      },
      {
        key: "voice",
        name: "Voice note reader",
        framework: "OpenAI Assistants",
        where: "kept at OpenAI",
        does: "Turns a voice note into kitchen items.",
        never: "—",
        asks: "A voice note",
        reply: ["Kitchen items", "name, amount"],
        tools: [],
        connected: true,
      },
    ];
  if (!p.plan.ai) return [];
  const meal = p.kind === "meal";
  return [
    {
      key: "main",
      name: p.plan.ai.name,
      framework: "Lyzr",
      where: `agents/${meal ? "meal-planner" : "assistant"}/`,
      does: meal ? "Suggests 3 Indian meals from what’s in the kitchen, for the time of day and the family size." : p.plan.ai.does.split(". ")[0] + ".",
      never: meal ? "Change the kitchen stock. Suggest a dish from the last 3 days." : "Change or delete anything by itself.",
      asks: meal ? "e.g. Dinner for 4?" : `e.g. ${p.template.aiTest.slice(0, 28)}…`,
      reply: meal ? ["3 meals", "name, dishes, time"] : ["An answer", "short, with sources"],
      tools: meal
        ? [
            { name: "Kitchen stock", on: true, note: "read only", id: "pantry.read" },
            { name: "Photos of the fridge", on: true, note: "", id: "vision" },
            { name: "Send email", on: false, note: "", id: "gmail.send" },
          ]
        : [
            { name: `${p.template.entity}`, on: true, note: "read only", id: "db.read" },
            { name: "Send email", on: false, note: "", id: "gmail.send" },
          ],
    },
  ];
}

type Auto = { key: string; name: string; sub: string; ok: boolean };

function automationsFor(p: Project): Auto[] {
  if (p.kind !== "meal" || p.imported) return p.plan.ai ? [{ key: "daily", name: "Every day 9 AM", sub: "Morning summary", ok: true }] : [];
  return [
    { key: "nine", name: "Every day 9 PM", sub: "Breakfast + lunch ideas", ok: !!p.automationFixed },
    { key: "three", name: "Every day 3 PM", sub: "Dinner ideas", ok: true },
  ];
}

function Box({ label, title, sub, on, onClick, status }: { label: string; title: string; sub: string; on?: boolean; onClick?: () => void; status?: "ok" | "failed" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-[180px] flex-col gap-0.5 rounded-xl border bg-panel p-3 text-left shadow-sm ${on ? "border-2 border-dev" : "border-line-strong hover:border-ink-3"}`}
    >
      <span className="flex items-center justify-between text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">
        {label}
        {status === "ok" && <span className="flex items-center gap-1 text-[11px] font-normal tracking-normal text-good normal-case"><Icon name="check" size={11} strokeWidth={2.4} />last run</span>}
        {status === "failed" && <span className="flex items-center gap-1 text-[11px] font-normal tracking-normal text-bad normal-case"><Icon name="close" size={11} strokeWidth={2.4} />failed</span>}
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-ink-2">{sub}</span>
    </button>
  );
}

const dotted = { backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)", backgroundSize: "18px 18px" };

function AgentPanel({ agent, project, update, onClose }: { agent: Agent; project: Project; update: Update; onClose: () => void }) {
  const [does, setDoes] = useState(agent.does);
  const [never, setNever] = useState(agent.never);
  const [tools, setTools] = useState(agent.tools);
  const [quality, setQuality] = useState<"Faster & cheaper" | "Best quality">("Faster & cheaper");
  const [tab, setTab] = useState<"details" | "files">("details");
  const [tests, setTests] = useState<"idle" | "running" | "done">("idle");
  const [tip, setTip] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (tests !== "running") return;
    const t = setTimeout(() => setTests("done"), 2200);
    return () => clearTimeout(t);
  }, [tests]);
  const ta = "w-full resize-none rounded-xl border border-line-strong bg-raised px-3 py-2.5 text-sm leading-normal outline-none focus:border-ink-3";

  if (agent.connected)
    return (
      <PanelFrame title={agent.name} sub={`${agent.framework} · connected, not copied`} onClose={onClose}>
        <p className="rounded-xl bg-sunken p-3 text-sm text-ink-2">Its prompt is kept at OpenAI, not in your code. It works in your app, but can only be changed where it lives.</p>
        <button type="button" onClick={() => update((q) => ({ ...q, chat: [...q.chat, { id: uid(), type: "ai", text: "I copied the voice note reader into your code (agents/voice-reader/). It works the same, and now it can be changed here." }] }))} className={btnPrimary}>
          Bring it into Architect
        </button>
      </PanelFrame>
    );

  return (
    <PanelFrame
      title={agent.name}
      sub={
        <>
          The app’s AI · {agent.framework}
          <span className="hidden dev:inline"> · <span className="font-mono">{agent.where}</span></span>
        </>
      }
      onClose={onClose}
      footer={
        <>
          <span className="text-xs text-ink-2">{saved ? "Saved ✓" : "Saved as a new version"}</span>
          <span className="flex gap-2">
            <button type="button" className={btnOutline}>
              <span className="dev:hidden">Try it</span>
              <span className="hidden dev:inline">Traces</span>
            </button>
            <button
              type="button"
              onClick={() => {
                update((q) => {
                  const n = q.versions[0].n + 1;
                  return {
                    ...q,
                    agentEdits: { ...q.agentEdits, [agent.key]: { does, never, tools: tools.map((t) => t.on) } },
                    versions: [{ n, title: `${agent.name} changed`, at: Date.now(), summary: `What ${agent.name.toLowerCase()} does, what it must never do and what it can use were changed.`, parts: ["App’s AI"], checks: [], cost: "No credits", files: [`${agent.where}SOUL.md`, `${agent.where}RULES.md`] }, ...q.versions],
                    chat: [...q.chat, { id: uid(), type: "version", n, text: `saved · ${agent.name} changed` }],
                  };
                });
                setSaved(true);
              }}
              className={btnPrimary}
            >
              Save
            </button>
          </span>
        </>
      }
    >
      <DevOnly>
        <div className="flex items-center justify-between">
          <span role="tablist" className="flex gap-0.5 rounded-[10px] bg-sunken p-[3px]">
            {(["details", "files"] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`h-[28px] rounded-lg px-3 text-[13px] ${tab === t ? "border border-line bg-raised font-semibold" : "text-ink-2"}`}>
                {t === "details" ? "Details" : "Files"}
              </button>
            ))}
          </span>
          <DevTag />
        </div>
      </DevOnly>
      {tab === "files" ? (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {[
            ["SOUL.md", does],
            ["RULES.md", `Never: ${never}`],
            ["tools.json", JSON.stringify(tools.filter((t) => t.on).map((t) => t.id))],
          ].map(([f, body]) => (
            <div key={f} className="rounded-xl border border-line">
              <div className="border-b border-line px-3 py-1.5 text-ink-2">{agent.where}{f}</div>
              <pre className="px-3 py-2 whitespace-pre-wrap">{body}</pre>
            </div>
          ))}
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            What it does
            <textarea rows={3} value={does} onChange={(e) => { setDoes(e.target.value); setSaved(false); }} className={`${ta} font-normal`} />
            <span className="hidden font-mono text-[11px] font-normal text-dev dev:inline">saved in SOUL.md</span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            It must never
            <textarea rows={2} value={never} onChange={(e) => { setNever(e.target.value); setSaved(false); }} className={`${ta} font-normal`} />
            <span className="hidden font-mono text-[11px] font-normal text-dev dev:inline">saved in RULES.md</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">It can use</span>
            {tools.map((t, i) => (
              <label key={t.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2.5">
                  <input type="checkbox" checked={t.on} onChange={() => { setTools((x) => x.map((y, j) => (j === i ? { ...y, on: !y.on } : y))); setSaved(false); }} className="size-4 accent-[var(--primary)]" />
                  {t.name}
                </span>
                <span className="text-xs text-ink-2">
                  {t.note}
                  <span className="hidden font-mono dev:inline">{t.note ? " · " : ""}{t.id}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 dev:hidden">
            <span className="text-sm font-semibold">Quality</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-sunken p-1">
              {(["Faster & cheaper", "Best quality"] as const).map((q) => (
                <button key={q} type="button" onClick={() => setQuality(q)} className={`h-8 rounded-[9px] text-[13px] ${quality === q ? "border border-line-strong bg-raised font-medium" : "text-ink-2"}`}>
                  {q}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-2">Best quality costs more each time someone uses your app.</span>
          </div>
          <DevOnly>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-sm font-semibold">
                Model · backup if it fails <DevTag />
              </span>
              <span className="grid grid-cols-2 gap-2">
                <select aria-label="Model" className={`${ta} py-2`}>
                  <option>gpt-4.1-mini</option>
                  <option>claude-haiku-4-5</option>
                </select>
                <select aria-label="Backup model" className={`${ta} py-2`}>
                  <option>claude-haiku-4-5</option>
                  <option>gpt-4.1-mini</option>
                </select>
              </span>
            </div>
          </DevOnly>
          <div className="relative flex flex-col gap-2 rounded-xl bg-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Agent tests</span>
                <span className="text-xs text-ink-2">
                  5 questions · ~0.2% of this month’s credits{" "}
                  <button type="button" aria-label="What are agent tests?" onClick={() => setTip((x) => !x)} className="text-ink-2 underline">
                    ⓘ
                  </button>
                </span>
              </span>
              <button type="button" onClick={() => setTests("running")} disabled={tests === "running"} className={`${btnOutline} h-9`}>
                {tests === "running" ? "Running…" : tests === "done" ? "Run again" : "Run agent tests"}
              </button>
            </div>
            {tip && (
              <p className="rounded-xl bg-primary p-3 text-xs leading-relaxed text-on-primary">
                Asks your agent 5 sample questions and checks its answers: 3 everyday ones, 1 tricky one, and 1 it must refuse. These are separate from your app’s checks in
                the Tests tab. Saving never runs them by itself.
              </p>
            )}
            {tests === "done" && (
              <ul className="flex flex-col gap-1 text-xs">
                {["Everyday question 1", "Everyday question 2", "Everyday question 3", "A tricky one", "One it must refuse"].map((q) => (
                  <li key={q} className="flex justify-between">
                    {q}
                    <span className="text-good">Answered well ✓</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </PanelFrame>
  );
}

function PanelFrame({ title, sub, onClose, children, footer }: { title: string; sub: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col border-l border-line bg-panel lg:w-[340px]">
      <div className="flex items-start justify-between border-b border-line px-4 py-3.5">
        <span className="flex flex-col">
          <span className="text-lg font-semibold">{title}</span>
          <span className="text-xs text-ink-2">{sub}</span>
        </span>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg hover:bg-hover">
          <Icon name="close" size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 max-md:pb-8">{children}</div>
      {footer && <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 max-md:pb-20">{footer}</div>}
    </div>
  );
}

function AutomationView({ auto, project, update, pick, setPick }: { auto: Auto; project: Project; update: Update; pick: string | null; setPick: (k: string | null) => void }) {
  const failing = auto.key === "nine" && !project.automationFixed;
  const runs = auto.key === "nine" ? (project.automationFixed ? ["g", "g", "g", "r", "r", "r", "g"] : ["g", "g", "g", "r", "r", "r", "r"]) : ["g", "g", "g", "g", "g", "g", "g"];
  const [how, setHow] = useState<"Push" | "Email" | "Both">(project.automationFixed ? "Both" : "Push");
  const steps = [
    { key: "t", label: "Trigger", title: auto.name, sub: "Asia/Kolkata time" },
    { key: "s1", label: "Step", title: project.kind === "meal" ? "Read kitchen stock" : "Read what’s new", sub: project.kind === "meal" ? "what’s in the kitchen now" : "since yesterday" },
    { key: "a", label: "Agent", title: project.plan.ai?.name ?? "Assistant", sub: auto.key === "three" ? "suggests dinner" : project.kind === "meal" ? "suggests breakfast + lunch" : "writes a summary" },
    { key: "s2", label: "Step", title: project.kind === "meal" ? "Save ideas" : "Save summary", sub: project.kind === "meal" ? "to the Meals list" : "to the app" },
    { key: "n", label: "Action", title: project.kind === "meal" ? "Notify family" : "Notify the team", sub: project.automationFixed ? "push and email" : "push notification" },
  ];
  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto" style={dotted}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs text-ink-2">
          <span className="flex items-center gap-2">
            Last 7 runs
            <span className="flex gap-1">
              {runs.map((r, i) => (
                <span key={i} className={`size-3 rounded-[3px] ${r === "g" ? "bg-good" : "bg-bad"}`} />
              ))}
            </span>
          </span>
          <span>About 0.5% of this month’s credits per run</span>
        </div>
        <div className="flex flex-col items-center gap-0 px-4 py-6">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center">
              {i > 0 && (
                <span className="flex h-9 flex-col items-center">
                  <span className="h-full w-px bg-line-strong" />
                </span>
              )}
              <Box label={s.label} title={s.title} sub={s.sub} on={pick === s.key} onClick={() => setPick(s.key)} status={s.key === "n" && failing ? "failed" : "ok"} />
            </div>
          ))}
        </div>
      </div>
      {pick && (
        <div className="absolute inset-0 z-10 flex justify-end bg-scrim lg:static lg:bg-transparent">
          {pick === "n" ? (
            <PanelFrame
              title={steps[4].title}
              sub={failing ? "Action · last run failed" : "Action · last run worked"}
              onClose={() => setPick(null)}
              footer={
                <>
                  <span className="flex gap-2">
                    <button type="button" className={btnOutline}>Run now</button>
                    <button type="button" className={btnOutline}>Pause</button>
                  </span>
                  {failing && (
                    <button
                      type="button"
                      data-tour="use-email"
                      onClick={() => {
                        setHow("Both");
                        update((q) => ({ ...q, automationFixed: true, chat: [...q.chat, { id: uid(), type: "ai", text: "Done. “Notify family” now sends by push and email, so a blocked notification doesn’t lose the ideas. The next run is tonight at 9 PM." }] }));
                      }}
                      className={btnPrimary}
                    >
                      Use email too
                    </button>
                  )}
                </>
              }
            >
              {failing && <p className="rounded-xl bg-bad-soft p-3 text-sm text-bad">Failed on the last 4 runs: notifications aren’t allowed on the family’s devices.</p>}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">How to notify</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-sunken p-1">
                  {(["Push", "Email", "Both"] as const).map((h) => (
                    <button key={h} type="button" onClick={() => setHow(h)} className={`h-8 rounded-[9px] text-[13px] ${how === h ? "border border-line-strong bg-raised font-medium" : "text-ink-2"}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold">Who</span>
                {(project.kind === "meal" ? ["Owner", "Didi (cook)", "Ramesh"] : ["Owner", "Team"]).map((w, i) => (
                  <label key={w} className="flex items-center gap-2.5">
                    <input type="checkbox" defaultChecked={i < 2} className="size-4 accent-[var(--primary)]" />
                    {w}
                  </label>
                ))}
              </div>
              {failing && <p className="text-xs text-ink-2">Suggested fix: send by email too, so a blocked notification doesn’t lose the ideas.</p>}
            </PanelFrame>
          ) : (
            <PanelFrame title={steps.find((s) => s.key === pick)!.title} sub={`${steps.find((s) => s.key === pick)!.label} · last run worked`} onClose={() => setPick(null)}>
              <p className="text-sm text-ink-2">This step worked on the last 7 runs. Change it by chat, or edit the plan.</p>
            </PanelFrame>
          )}
        </div>
      )}
    </div>
  );
}

function AddAgent({ open, onClose, update }: { open: boolean; onClose: () => void; update: Update }) {
  const [pick, setPick] = useState(0);
  const options = [
    { t: "Make a new one", s: "Describe what it should do." },
    { t: "Use one of my agents", s: "From this workspace or Lyzr Studio." },
    { t: "Bring in an agent I already have", s: "Paste its link and key. If Architect can read it, it’s copied into your code; if not, it’s connected." },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add an agent"
      actions={
        <>
          <button type="button" onClick={onClose} className={btnOutline}>Cancel</button>
          <button
            type="button"
            onClick={() => {
              update((q) => ({ ...q, chat: [...q.chat, { id: uid(), type: "ai", text: pick === 3 ? "Tell me which framework and what the agent should do, and I’ll add it as code in agents/." : "Tell me in chat what the new agent should do. I’ll suggest it as a plan change first." }] }));
              onClose();
            }}
            className={btnPrimary}
          >
            Continue
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button key={o.t} type="button" onClick={() => setPick(i)} className={`flex flex-col rounded-xl border p-3 text-left ${pick === i ? "border-accent bg-needs" : "border-line-strong"}`}>
            <span className="text-sm font-semibold text-ink">{o.t}</span>
            <span className="text-[13px]">{o.s}</span>
          </button>
        ))}
        <button type="button" onClick={() => setPick(3)} className={`hidden flex-col rounded-xl border p-3 text-left dev:flex ${pick === 3 ? "border-accent bg-needs" : "border-line-strong"}`}>
          <span className="flex items-center justify-between text-sm font-semibold text-ink">Build it in code <DevTag /></span>
          <span className="text-[13px]">Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, Vercel AI SDK, or your own code.</span>
        </button>
      </div>
    </Modal>
  );
}

export function AgentsView({ project, update }: { project: Project; update: Update }) {
  const agents = agentsFor(project);
  const autos = automationsFor(project);
  const [sel, setSel] = useState<string>(agents[0]?.key ?? autos[0]?.key ?? "");
  // On phones the diagram comes first; tap a box to open its panel.
  const [open, setOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 1024);
  const [pick, setPick] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { collapsePanel } = useProjectUI();

  useEffect(() => {
    collapsePanel(true);
    return () => collapsePanel(false);
  }, [collapsePanel]);

  const agent = agents.find((a) => a.key === sel);
  const auto = autos.find((a) => a.key === sel);

  if (agents.length === 0)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-xl font-semibold">This app has no agents yet</h1>
        <p className="max-w-sm text-sm text-ink-2">Add one to answer questions, write summaries or run on a schedule.</p>
        <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>Add agent</button>
        <AddAgent open={adding} onClose={() => setAdding(false)} update={update} />
      </div>
    );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
        <span className="flex items-center gap-3">
          <strong className="font-semibold">{auto ? auto.name : "Agents"}</strong>
          <span className="hidden text-ink-2 sm:inline">{auto ? `Automation · ${auto.sub.toLowerCase()}` : "Click any box to change it"}</span>
        </span>
        <button type="button" onClick={() => setAdding(true)} className={`${btnOutline} h-9 gap-1.5`}>
          <Icon name="plus" size={14} strokeWidth={2} />
          Add agent
        </button>
      </div>
      <div className="flex min-h-[560px] flex-1 flex-col md:flex-row">
        <div className="flex shrink-0 flex-col gap-1 border-b border-line bg-panel p-3 md:w-[200px] md:border-r md:border-b-0">
          <span className="px-2 pt-1 pb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">Agents</span>
          {agents.map((a) => (
            <button key={a.key} type="button" onClick={() => { setSel(a.key); setPick(null); setOpen(true); }} className={`flex flex-col rounded-xl px-3 py-2 text-left ${sel === a.key ? "border border-line-strong bg-raised" : "hover:bg-hover"}`}>
              <span className="text-sm font-semibold">{a.name}</span>
              <span className="text-xs text-ink-2">{a.framework} · {a.connected ? "connected" : "the app’s AI"}</span>
            </button>
          ))}
          {autos.length > 0 && <span className="px-2 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">Automations</span>}
          {autos.map((a) => (
            <button key={a.key} type="button" data-tour={`auto-${a.key}`} onClick={() => { setSel(a.key); setPick(a.key === "nine" && !project.automationFixed ? "n" : null); }} className={`flex items-center justify-between rounded-xl px-3 py-2 text-left ${sel === a.key ? "border border-line-strong bg-raised" : "hover:bg-hover"}`}>
              <span className="flex flex-col">
                <span className="text-sm">{a.name}</span>
                <span className="text-xs text-ink-2">{a.sub}</span>
              </span>
              <span className={`size-2 rounded-full ${a.ok ? "bg-good" : "bg-bad"}`} aria-label={a.ok ? "last run worked" : "last run failed"} />
            </button>
          ))}
        </div>

        {agent && (
          <div className="relative flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto p-6 pb-24 md:items-center md:pb-6" style={dotted}>
              <div className="flex flex-col items-center gap-0">
                <div className="flex flex-col items-center gap-3 xl:flex-row xl:gap-0">
                  <Box label="When" title={agent.key === "voice" ? "A voice note arrives" : "The app asks"} sub={agent.asks} onClick={() => setOpen(true)} />
                  <span className="h-6 w-px bg-line-strong xl:h-px xl:w-10" />
                  <Box label="Agent" title={agent.name} sub={agent.does.split(" ").slice(0, 3).join(" ")} on={open} onClick={() => setOpen(true)} />
                  <span className="h-6 w-px bg-line-strong xl:h-px xl:w-10" />
                  <Box label="Reply" title={agent.reply[0]} sub={agent.reply[1]} onClick={() => setOpen(true)} />
                </div>
                {agent.tools.length > 0 && (
                  <>
                    <span className="h-8 w-px bg-line-strong" />
                    <Box label="Can use" title={agent.tools[0].name} sub={agent.tools[0].note || "read and write"} onClick={() => setOpen(true)} />
                    <button type="button" onClick={() => setOpen(true)} className="mt-2 text-[13px] text-accent">+ Add a tool</button>
                  </>
                )}
              </div>
            </div>
            {open && (
              <div className="absolute inset-0 z-10 flex justify-end bg-scrim lg:static lg:bg-transparent">
                <AgentPanel key={agent.key} agent={agent} project={project} update={update} onClose={() => setOpen(false)} />
              </div>
            )}
          </div>
        )}
        {auto && <AutomationView auto={auto} project={project} update={update} pick={pick} setPick={setPick} />}
      </div>
      <AddAgent open={adding} onClose={() => setAdding(false)} update={update} />
    </div>
  );
}
