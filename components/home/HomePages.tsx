"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectCard, projectStatus } from "../HomeContent";
import { Switch } from "../YouCorner";
import { DevTag } from "../DevTag";
import { btnOutline, btnPrimary } from "../Modal";
import { ImportModal } from "../import/ImportModal";
import { useProjects } from "@/lib/projects";
import { useCreditsUsed } from "@/lib/credits";
import { usePrefs, type ThemeChoice } from "@/lib/prefs";
import { useViewer } from "@/lib/viewer-context";
import { AddOnTip, ProjectLimitInput } from "../AddOnTip";
import { useAddOn } from "@/lib/addon";
import { UnlockButton, addOnFeatures } from "../UpgradeModal";
import { useWorkspaceList } from "../workspaces";

const page = "mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 pt-8 pb-24 md:px-8 md:pt-10 md:pb-10";
const card = "flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5";

/* A27 */
export function ProjectsPage() {
  const { projects, now } = useProjects();
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [importing, setImporting] = useState(false);
  const filters = ["All", "Live", "Building", "Built", "Not built yet", "Setting up"];
  const shown = projects
    .filter((p) => filter === "All" || (filter === "Setting up" ? p.imported && p.imported.setup !== "done" : projectStatus(p).label === filter))
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className={page}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-[44px] leading-none">Projects</h1>
        <span className="flex gap-2">
          <button type="button" onClick={() => setImporting(true)} className={btnOutline}>Import from GitHub</button>
          <Link href="/home?new=1" className={btnPrimary}>New project</Link>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="h-10 w-56 rounded-[10px] border border-line-strong bg-panel px-3 text-sm placeholder:text-ink-3" />
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`h-9 rounded-full border px-3 text-[13px] ${filter === f ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-panel"}`}>
            {f}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-ink-2">No projects here yet. Describe an idea on Home to start one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <div key={p.id} className="flex flex-col gap-1">
              <ProjectCard project={p} now={now} />
              <span className="px-1 text-xs text-ink-2">
                Version {p.versions[0].n} · used {p.creditsUsed}% of this month’s credits
              </span>
            </div>
          ))}
        </div>
      )}
      <ImportModal open={importing} onClose={() => setImporting(false)} />
    </div>
  );
}

/* A28 */
export function AgentsHomePage() {
  const { projects } = useProjects();
  const automations = projects.filter((p) => p.kind === "meal" && !p.imported);
  const agents = projects.filter((p) => p.plan.ai).map((p) => ({ p, name: p.plan.ai!.name, framework: p.imported ? "LangGraph" : "Lyzr" }));
  return (
    <div className={page}>
      <h1 className="font-serif text-[44px] leading-none">Agents</h1>
      <p className="-mt-3 text-[15px] text-ink-2">Every agent in this workspace, and what runs on its own.</p>
      {agents.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-6">
          <span className="text-[15px] font-semibold">No agents yet</span>
          <p className="text-sm text-ink-2">Agents are the AI inside your apps, like one that answers questions or sorts messages. Build an app that uses AI, and its agent shows up here.</p>
          <Link href="/home?new=1" className={btnPrimary}>Describe an app</Link>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-2">
              <th className="px-4 py-2.5 font-semibold">Agent</th>
              <th className="px-4 py-2.5 font-semibold">Framework</th>
              <th className="px-4 py-2.5 font-semibold">Project</th>
              <th className="px-4 py-2.5 font-semibold">This week</th>
              <th className="px-4 py-2.5 font-semibold">Credits</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(({ p, name, framework }) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><Link href={`/p/${p.id}/agents`} className="font-medium hover:underline">{name}</Link></td>
                <td className="px-4 py-3 text-ink-2">{framework}</td>
                <td className="px-4 py-3 text-ink-2">{p.name}</td>
                <td className="px-4 py-3 text-ink-2">{p.deploy?.liveVersion ? "212 answers · 2 refused" : "Not live yet"}</td>
                <td className="px-4 py-3 text-ink-2">{p.deploy?.liveVersion ? "3%" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <h2 className="text-lg font-semibold">Automations</h2>
      <div className="flex flex-col gap-2">
        {automations.length === 0 && <p className="text-sm text-ink-2">Nothing runs on its own yet. Automations, like a daily summary at 9 AM, show up here once an app has one.</p>}
        {automations.map((p) => (
          <Link key={p.id} href={`/p/${p.id}/agents`} className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3">
            <span className="flex flex-col">
              <span className="text-sm font-medium">Every day 9 PM · {p.name}</span>
              <span className="text-xs text-ink-2">{p.automationFixed ? "Worked on the last run" : "Failed on the last 4 runs · notifications blocked"}</span>
            </span>
            <span className={`size-2 rounded-full ${p.automationFixed ? "bg-good" : "bg-bad"}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* S1 */
export function UsagePage() {
  const used = useCreditsUsed();
  const { projects } = useProjects();
  const viewer = useViewer();
  const low = used >= 70;
  const total = Math.max(1, projects.reduce((s, p) => s + p.creditsUsed, 0));
  return (
    <div className={page}>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-ink-2">Credits · {viewer.kind === "demo" ? "Pro plan" : "Free plan"} · refresh on 24 Oct</span>
        <h1 className="font-serif text-[36px] leading-[1.1] md:text-[44px]">{low ? "Running low. You may run out before your credits refresh on 24 Oct." : "On track. You should reach the refresh with room to spare."}</h1>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-todo">
          <div className={`h-full rounded-full ${low ? "bg-accent" : "bg-good"}`} style={{ width: `${used}%` }} />
        </div>
        <div className="flex justify-between text-[13px] text-ink-2">
          <span><strong className="font-semibold text-ink">{used}% used</strong> in 5 days</span>
          {low && <span>At this pace, around 12 Oct</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <span className="text-lg font-semibold">By project</span>
          {projects.length === 0 && <p className="text-sm text-ink-2">No projects yet.</p>}
          {projects.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-3 text-sm">
              <span className="truncate">{p.name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-todo"><span className="block h-full rounded-full bg-accent" style={{ width: `${(p.creditsUsed / total) * 100}%` }} /></span>
              <span className="w-10 text-right text-ink-2">{p.creditsUsed}%</span>
            </div>
          ))}
        </div>
        <div className={card}>
          <span className="text-lg font-semibold">Building vs your live apps</span>
          {viewer.kind !== "demo" ? (
            <p className="text-sm text-ink-2">Nothing to show yet. Once an app is live, this splits your credits between building and people using your apps.</p>
          ) : (
            <div className="flex h-2 overflow-hidden rounded-full"><span className="bg-accent" style={{ width: "66%" }} /><span className="bg-info" style={{ width: "34%" }} /></div>
          )}
          <div className="flex justify-between text-[13px]">
            <span><strong className="font-semibold">Building</strong><span className="block text-xs text-ink-2">you, making changes</span></span>
            <span className="text-right"><strong className="font-semibold">Live apps</strong><span className="block text-xs text-ink-2">people using them + scheduled runs</span></span>
          </div>
        </div>
        <div className={card}>
          <span className="flex justify-between text-lg font-semibold">Where your credits went {viewer.kind === "demo" && <span className="text-xs font-normal text-ink-2">example</span>}</span>
          {viewer.kind !== "demo" && <p className="text-sm text-ink-2">Nothing to show yet. After a few builds, this shows what used the most credits, with a tip for each.</p>}
          {viewer.kind === "demo" && [
            ["3 fix attempts in step 3 of Abhi Kya Banega", "Tip: describe the expected result more clearly", "12%"],
            ["Scheduled runs at 9 PM and 3 PM", "Tip: pause them when you’re not using the app", "15% a month"],
            ["Long chats in one project", "Tip: start a new chat for an unrelated change", "9%"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex justify-between gap-3 border-t border-line pt-3 text-sm">
              <span className="flex flex-col">{a}<span className="text-xs text-ink-2">{b}</span></span>
              <strong className="font-semibold whitespace-nowrap">{c}</strong>
            </div>
          ))}
        </div>
        <div className={card}>
          <span className="text-lg font-semibold">Limits</span>
          <div className="flex justify-between text-sm">Monthly spending limit <strong className="font-semibold">₹1,500</strong></div>
          <div className="flex justify-between text-sm">Alert me at <strong className="font-semibold">80%</strong></div>
          <AddOnTip label="Limit per project" unlocked={<ProjectLimitInput />} className="text-sm text-ink-2" />
          <span className="flex gap-2"><button type="button" className={btnPrimary}>Top up</button><button type="button" className={btnOutline}>Change limit</button></span>
        </div>
      </div>
      <TeamReport used={used} />
      <p className="text-xs text-ink-2">All numbers here are made-up examples for the prototype.</p>
    </div>
  );
}

/* S2 */
export function AccountPage() {
  const viewer = useViewer();
  const { theme, setTheme, devView, setDevView } = usePrefs();
  const [alerts, setAlerts] = useState<"Browser" | "Email" | "Both">("Browser");
  const seg = (active: boolean) => `h-9 rounded-[9px] px-3 text-[13px] ${active ? "border border-line-strong bg-raised font-medium" : "text-ink-2"}`;
  return (
    <div className={page}>
      <h1 className="font-serif text-[44px] leading-none">Account settings</h1>
      <div className={card}>
        <span className="text-lg font-semibold">Appearance</span>
        <div className="flex w-fit gap-1 rounded-xl bg-sunken p-1">
          {(["light", "dark", "system"] as ThemeChoice[]).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)} className={seg(theme === t)}>
              {t === "light" ? "Light" : t === "dark" ? "Dark" : "Match my computer"}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setDevView(!devView)} className={`${card} flex-row items-start justify-between text-left`}>
        <span className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-lg font-semibold">Developer view <DevTag /></span>
          <span className="text-sm text-ink-2">See code, agent files, the exact model and cost per step. It only shows more; it never pauses anything.</span>
        </span>
        <Switch on={devView} />
      </button>
      <div className={card}>
        <span className="text-lg font-semibold">Profile</span>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">{viewer.initials}</span>
          <span className="flex flex-col"><span className="text-sm">{viewer.name}</span><span className="text-xs text-ink-2">{viewer.role ?? "No role set"}{viewer.kind === "demo" ? " · demo account" : ""}</span></span>
        </div>
      </div>
      <div className={card}>
        <span className="text-lg font-semibold">When a build finishes, tell me by</span>
        <div className="flex w-fit gap-1 rounded-xl bg-sunken p-1">
          {(["Browser", "Email", "Both"] as const).map((a) => (
            <button key={a} type="button" aria-pressed={alerts === a} onClick={() => setAlerts(a)} className={seg(alerts === a)}>{a}</button>
          ))}
        </div>
      </div>
      <div className={card}>
        <span className="text-lg font-semibold">GitHub</span>
        <p className="text-sm text-ink-2">Connect per project, in Project settings → GitHub. Architect only sees the repos you pick.</p>
      </div>
      <PlanCard plan={viewer.kind === "demo" ? "Pro" : "Free"} />
    </div>
  );
}

/** Your plan, and a pretend switch for the Developer add-on so reviewers can see what it unlocks. */
function PlanCard({ plan }: { plan: string }) {
  const { addOn, setAddOn } = useAddOn();
  return (
    <div className={card}>
      <span className="flex items-center justify-between text-lg font-semibold">
        Your plan
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-normal text-accent-strong">{addOn ? `${plan} + Developer add-on` : plan}</span>
      </span>
      <p className="text-sm text-ink-2">
        {addOn ? "Developer add-on is on. " : "Developer add-on not included. "}
        It adds: {addOnFeatures.map((f) => f.charAt(0).toLowerCase() + f.slice(1)).join(", ")}.
      </p>
      <span className="flex flex-wrap items-center gap-3">
        {addOn ? (
          <button type="button" onClick={() => setAddOn(false)} className={btnOutline}>
            Turn off the Developer add-on
          </button>
        ) : (
          <UnlockButton className={btnPrimary}>Try the Developer add-on</UnlockButton>
        )}
        <span className="text-xs text-ink-2">Prototype only: no payment, and it stays in this browser.</span>
      </span>
    </div>
  );
}

/** Usage report by person (Developer add-on): who used what this month, and a CSV to download. */
function TeamReport({ used }: { used: number }) {
  const { addOn } = useAddOn();
  const { current } = useWorkspaceList();
  const { projects } = useProjects();
  const people = current.people.filter((p) => !p.invited);
  const weights = people.length === 1 ? [1] : people.map((_, i) => Math.max(1, people.length - i));
  const sum = weights.reduce((a, b) => a + b, 0);
  const rows = people.map((p, i) => ({
    name: p.name,
    role: p.role,
    share: Math.round((used * weights[i]) / sum),
    top: projects[i % Math.max(1, projects.length)]?.name ?? "—",
  }));
  const download = () => {
    const csv = ["Person,Role,Credits this month (%),Used most on", ...rows.map((r) => [r.name, r.role, r.share, r.top].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${current.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-usage.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className={card}>
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-semibold">Report by person</span>
        {addOn ? (
          <button type="button" onClick={download} className={btnOutline}>Download CSV</button>
        ) : (
          <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2">Developer add-on</span>
        )}
      </span>
      {!addOn ? (
        <>
          <p className="text-sm text-ink-2">Who used how many credits this month, and on which project. Useful for teams sharing one workspace.</p>
          <UnlockButton className={`${btnPrimary} self-start`}>Unlock the report</UnlockButton>
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-2">
                <th className="py-2 font-semibold">Person</th>
                <th className="py-2 font-semibold">Credits this month</th>
                <th className="py-2 font-semibold">Used most on</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name + r.role} className="border-t border-line">
                  <td className="py-2.5">{r.name} <span className="text-xs text-ink-2">· {r.role}</span></td>
                  <td className="py-2.5">{r.share}%</td>
                  <td className="py-2.5 text-ink-2">{r.top}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
