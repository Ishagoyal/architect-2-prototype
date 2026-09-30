"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Modal, btnOutline, btnPrimary } from "../Modal";
import { useProjects } from "@/lib/projects";
import { useViewer } from "@/lib/viewer-context";
import { uid, type Project } from "@/lib/model";
import { InviteModal, useWorkspaceList } from "../workspaces";
import { Icon } from "../Icon";
import { Switch } from "../YouCorner";
import { UnlockButton } from "../UpgradeModal";
import { useAddOn } from "@/lib/addon";

/* Designs D1–D5, C6, S6: project settings. */

type Update = (fn: (p: Project) => Project) => void;

const tabs = [
  { key: "general", label: "General" },
  { key: "keys", label: "Passwords and keys" },
  { key: "github", label: "GitHub" },
  { key: "ai", label: "Your app’s AI" },
  { key: "team", label: "Team and review" },
  { key: "danger", label: "Danger zone" },
] as const;
type Tab = (typeof tabs)[number]["key"];

const card = "flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5";
const input = "w-full rounded-[10px] border border-line-strong bg-raised px-3 py-2.5 text-sm outline-none focus:border-ink-3";

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-xl bg-sunken p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`h-9 rounded-[9px] text-[13px] ${value === o ? "border border-line-strong bg-raised font-medium" : "text-ink-2"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

/* ---------- GitHub ---------- */

function Code({ lines, tone }: { lines: [number, string, boolean?][]; tone: "info" | "accent" | "good" }) {
  const hl = tone === "info" ? "bg-info-soft" : tone === "accent" ? "bg-accent-soft" : "bg-good-soft";
  return (
    <pre className="overflow-x-auto py-2 font-mono text-[13px] leading-7">
      {lines.map(([n, t, h]) => (
        <div key={n} className={`flex gap-4 px-3 ${h ? hl : ""}`}>
          <span className="w-5 shrink-0 text-right text-ink-3">{n}</span>
          <span>{t}</span>
        </div>
      ))}
    </pre>
  );
}

function Clash({ update }: { update: Update }) {
  const [ai, setAi] = useState(false);
  const resolve = (how: string) =>
    update((q) => {
      const n = q.versions[0].n + 1;
      return {
        ...q,
        github: q.github && { ...q.github, behind: 0, clash: false },
        versions: [{ n, title: "Got latest from GitHub", at: Date.now(), summary: `3 changes from GitHub came in. In lib/parse-hinglish.ts, ${how}.`, parts: ["Code · 3 files"], checks: [["“tamatar khatam” marks tomatoes as out", "passed", "passed"]], cost: "No credits", files: ["lib/parse-hinglish.ts", "app/today/page.tsx", "README.md"] }, ...q.versions],
        chat: [...q.chat, { id: uid(), type: "version", n, text: "saved · got latest from GitHub" }],
      };
    });
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[13px]">
        <strong className="font-semibold">The same lines changed in two places</strong> <span className="text-ink-2">· lib/parse-hinglish.ts · 1 of 3 new changes from GitHub</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-line border-t-2 border-t-info bg-panel">
          <div className="px-3 pt-2.5 text-[13px]">
            <strong className="font-semibold">On GitHub</strong>
            <span className="block text-xs text-ink-2">Rahul · 40 min ago · also catches “khatm” spelling</span>
          </div>
          <Code tone="info" lines={[[12, 'if (text.includes("khatam")) {'], [13, "  return { item, amount: 0 }", true], [14, "}"]]} />
        </div>
        <div className="overflow-hidden rounded-xl border border-line border-t-2 border-t-accent bg-panel">
          <div className="px-3 pt-2.5 text-[13px]">
            <strong className="font-semibold">In Architect</strong>
            <span className="block text-xs text-ink-2">Step 4 · marks the item as out</span>
          </div>
          <Code tone="accent" lines={[[12, 'if (text.includes("khatam")) {'], [13, '  return { item, amount: 0, status: "out" }', true], [14, "}"]]} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => resolve("GitHub’s version was kept")} className={btnOutline}>Keep GitHub’s</button>
        <button type="button" onClick={() => resolve("Architect’s version was kept")} className={btnOutline}>Keep Architect’s</button>
        <button type="button" data-tour="gh-ai" onClick={() => setAi(true)} className={btnPrimary}>Let AI suggest a combined version</button>
      </div>
      {ai && (
        <div className="overflow-hidden rounded-xl border border-line border-t-2 border-t-good bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2.5">
            <span className="text-[13px]">
              <strong className="font-semibold">AI suggestion: keep both</strong>
              <span className="block text-xs text-ink-2">Rahul’s spellings + Architect’s “out” status · checks: 3 of 3 pass</span>
            </span>
            <span className="flex gap-2">
              <button type="button" className={`${btnOutline} h-9`}>Edit</button>
              <button type="button" data-tour="gh-approve" onClick={() => resolve("both changes were combined (approved by you)")} className={`${btnPrimary} h-9`}>Approve</button>
            </span>
          </div>
          <Code tone="good" lines={[[12, "if (/khatam|khatm|finish/.test(text)) {", true], [13, '  return { item, amount: 0, status: "out" }', true], [14, "}"]]} />
        </div>
      )}
    </div>
  );
}

function GitHubTab({ project: p, update }: { project: Project; update: Update }) {
  const viewer = useViewer();
  const handle = viewer.kind === "demo" ? "alexmorgan" : viewer.firstName.toLowerCase();
  const [moving, setMoving] = useState(false);
  const [name, setName] = useState(p.id.replace(/-[a-z0-9]{4}$/, ""));
  const gh = p.github;
  const { addOn } = useAddOn();
  const autoPull = addOn && (p.sync?.pull ?? true);

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className="flex items-start justify-between gap-2">
          <span className="flex flex-col">
            <span className="text-lg font-semibold">Where your code lives</span>
            <span className="text-sm text-ink-2">Architect only sees the repos you pick.</span>
          </span>
          {gh && <span className="rounded-full bg-good-soft px-2 py-0.5 text-xs text-good">Connected</span>}
        </div>
        {gh ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sunken px-3 py-2.5">
            <span className="flex flex-col">
              <span className="font-mono text-[13px]">{gh.repo}</span>
              <span className="text-xs text-ink-2">Moved from Architect’s GitHub just now · full history kept</span>
            </span>
            <span className="text-[13px] text-accent">Open on GitHub</span>
          </div>
        ) : (
          <>
            <p className="rounded-xl bg-sunken px-3 py-2.5 text-sm">
              In Architect’s GitHub, private. <span className="text-ink-2">You can move it to your own GitHub any time, free on every plan. Nothing changes in how you build.</span>
            </p>
            <button type="button" data-tour="gh-move" onClick={() => setMoving(true)} className={`${btnPrimary} self-start`}>
              Move to my GitHub
            </button>
          </>
        )}
      </div>

      {gh && <TwoWaySync project={p} update={update} />}

      {gh && (
        <div className={card}>
          <div className="flex items-start justify-between gap-2">
            <span className="flex flex-col">
              <span className="text-lg font-semibold">Changes made outside Architect</span>
              <span className="text-sm text-ink-2">{autoPull ? "Two-way sync brings them in before each build. You can also get them now." : "They only come in when you ask."}</span>
            </span>
            {gh.behind > 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-strong">{gh.behind} new on GitHub</span>}
          </div>
          {gh.clash ? (
            <Clash update={update} />
          ) : gh.behind > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-line bg-needs px-3 py-3">
              <span className="text-sm">
                Rahul changed <span className="font-mono text-[13px]">lib/parse-hinglish.ts</span> and 2 other files · 40 min ago
              </span>
              <button
                type="button"
                data-tour="gh-latest"
                onClick={() =>
                  update((q) => ({
                    ...q,
                    github: q.github && { ...q.github, clash: true },
                    chat: [
                      ...q.chat,
                      { id: uid(), type: "user", text: "Get latest" },
                      { id: uid(), type: "ai", text: "Got 3 changes from GitHub. 2 went in cleanly. In 1 file, Rahul and step 4 changed the same lines, so you choose. Nothing is applied until you approve." },
                    ],
                  }))
                }
                className={btnPrimary}
              >
                Get latest
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-good">✓ Your copy has everything from GitHub.</p>
              <button
                type="button"
                onClick={() => update((q) => ({ ...q, github: q.github && { ...q.github, behind: 3 }, chat: [...q.chat, { id: uid(), type: "ai", text: "Rahul pushed 3 changes to GitHub. They’re not in your copy yet. Get them before the next build so we start from the newest code." }] }))}
                className="text-[13px] text-accent"
              >
                Simulate: Rahul pushes 3 changes
              </button>
            </div>
          )}
          <p className="text-xs text-ink-2">If the same lines changed here too, you choose: keep GitHub’s, keep Architect’s, or let AI suggest a combined version.</p>
        </div>
      )}

      {gh && (
        <div className={card}>
          <span className="text-lg font-semibold">How changes reach your repo</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`rounded-xl border p-3 ${p.reviewOn ? "border-2 border-ink" : "border-line"}`}>
              <span className="text-sm font-semibold">Pull request for every step</span>
              <span className="block text-xs text-ink-2">Review changes is {p.reviewOn ? "on" : "off"} · turn it on in Team and review</span>
            </div>
            <div className={`rounded-xl border p-3 ${!p.reviewOn ? "border-2 border-ink" : "border-line"}`}>
              <span className="text-sm font-semibold">Merging to main deploys</span>
              <span className="block text-xs text-ink-2">Live ✓ only after the live check</span>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={moving}
        onClose={() => setMoving(false)}
        title="Move to my GitHub"
        actions={
          <>
            <button type="button" onClick={() => setMoving(false)} className={btnOutline}>Cancel</button>
            <button
              type="button"
              data-tour="gh-move-confirm"
              onClick={() => {
                update((q) => ({
                  ...q,
                  github: { repo: `${handle}/${name}`, own: true, behind: 3, clash: false },
                  chat: [
                    ...q.chat,
                    { id: uid(), type: "ai", text: `Moved to ${handle}/${name} with its full history. Nothing changes in how you build.` },
                    { id: uid(), type: "ai", text: "Rahul pushed 3 changes to GitHub. They’re not in your copy yet. Get them before the next build so we start from the newest code." },
                  ],
                }));
                setMoving(false);
              }}
              className={btnPrimary}
            >
              Move it
            </button>
          </>
        }
      >
        <p>Connects GitHub (only the new repo), then moves the code with its full history.</p>
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          New repo name
          <span className="flex items-center gap-1 font-mono text-[13px]">
            <span className="text-ink-2">{handle}/</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${input} font-mono`} />
          </span>
        </label>
        <p className="text-[13px]">Private. This is a demo: no real repo is made.</p>
      </Modal>
    </div>
  );
}

/* ---------- Other tabs ---------- */

function TeamTab({ project: p, update }: { project: Project; update: Update }) {
  const viewer = useViewer();
  const on = !!p.reviewOn;
  const { current } = useWorkspaceList();
  const [inviting, setInviting] = useState(false);
  const invited = current.people.filter((x) => x.invited);
  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <span className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-lg font-semibold">
              Review changes <span className={`rounded-full px-2 py-0.5 text-xs font-normal ${on ? "bg-good-soft text-good" : "bg-sunken text-ink-2"}`}>{on ? "On" : "Off"}</span>
            </span>
            <span className="text-sm text-ink-2">
              {on ? "Every step is built on a copy and waits for approval. Your app changes only when someone approves it." : "Each step is saved as soon as it’s built. Turn on to check and approve each step first."}
            </span>
          </span>
          <button type="button" onClick={() => update((q) => ({ ...q, reviewOn: !on }))} className={on ? btnOutline : btnPrimary}>
            {on ? "Turn off" : "Turn on"}
          </button>
        </div>
        <p className="text-xs text-ink-2">Free on every plan.</p>
      </div>
      <div className={card}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">People on this project</span>
          <button type="button" onClick={() => setInviting(true)} className={btnOutline}>Invite by email</button>
        </div>
        {[
          [viewer.initials, `${viewer.name} (you)`, "Owner", "Can approve"],
          ["RK", "Rahul", "Developer view · edits in code and on GitHub", "Can approve"],
          ["NS", "Neha", "Her changes go for review to you or Rahul", "Can edit"],
        ].map(([i, n, s, r]) => (
          <div key={n} className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">{i}</span>
              <span className="flex flex-col">
                <span className="text-sm">{n}</span>
                <span className="text-xs text-ink-2">{s}</span>
              </span>
            </span>
            <span className="rounded-full bg-sunken px-2.5 py-1 text-xs">{r}</span>
          </div>
        ))}
        {invited.map((x) => (
          <div key={x.name} className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-line-strong text-ink-2">
                <Icon name="people" size={13} />
              </span>
              <span className="flex flex-col">
                <span className="text-sm">{x.name}</span>
                <span className="text-xs text-ink-2">{x.detail}</span>
              </span>
            </span>
            <span className="rounded-full bg-sunken px-2.5 py-1 text-xs">{x.role === "Admin" ? "Can approve" : "Can edit"}</span>
          </div>
        ))}
        <InviteModal open={inviting} onClose={() => setInviting(false)} workspace={current} />
        <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-ink-2">
          Choosing who can approve is part of the Team plan.
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent-strong">Team plan</span>
        </div>
      </div>
      <div className={card}>
        <span className="text-lg font-semibold">When two people work at the same time</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-xl p-3 ${on ? "border-2 border-ink" : "border border-line"}`}>
            <span className="text-sm font-semibold">Review on{on ? " · now" : ""}</span>
            <p className="text-xs text-ink-2">Each person works on their own copy, so nobody overwrites anyone. If two people changed the same lines, you choose.</p>
          </div>
          <div className={`rounded-xl p-3 ${!on ? "border-2 border-ink" : "border border-line"}`}>
            <span className="text-sm font-semibold">Review off{!on ? " · now" : ""}</span>
            <p className="text-xs text-ink-2">Changes are built one at a time: “Rahul’s change is being built. Yours starts next.”</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AITab({ project: p }: { project: Project }) {
  const [who, setWho] = useState<"Architect’s AI" | "My own key">("Architect’s AI");
  if (!p.plan.ai) return <div className={card}><p className="text-sm text-ink-2">This app doesn’t use an AI model.</p></div>;
  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <span className="text-lg font-semibold">Who pays for your app’s AI</span>
        <Segmented value={who} options={["Architect’s AI", "My own key"]} onChange={setWho} />
        <p className="text-sm text-ink-2">
          {who === "Architect’s AI" ? "Uses your credits. Nothing to set up." : "Billed by the provider. Add the key in Passwords and keys."} Your live app never holds your key: its AI goes through Architect.
        </p>
      </div>
      <div className={card}>
        <span className="text-lg font-semibold">Limits</span>
        <label className="flex items-center justify-between gap-3 text-sm">
          Monthly budget for this app
          <select className={`${input} w-40`} defaultValue="20%">
            <option>10%</option>
            <option>20%</option>
            <option>40%</option>
          </select>
        </label>
        <p className="text-xs text-ink-2">When it’s reached, the AI pauses and the app stays live.</p>
        <label className="flex items-center justify-between gap-3 text-sm">
          Limit per person
          <input defaultValue={p.kind === "meal" ? "20 meal ideas a day" : "20 uses a day"} className={`${input} w-48`} />
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" /> Alert me at 80%
        </label>
      </div>
      <div className={card}>
        <span className="text-lg font-semibold">This month</span>
        <p className="text-sm text-ink-2">{p.deploy?.liveVersion ? "14 people · 3% of your credits · top user: Didi (cook)" : "Not live yet, so nobody has used it. Example numbers show up here once it’s live."}</p>
      </div>
    </div>
  );
}

function KeysTab({ project: p }: { project: Project }) {
  const keys = p.plan.keys;
  return (
    <div className={card}>
      <span className="text-lg font-semibold">Passwords and keys</span>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-2">
              <th className="py-2 font-semibold">Name</th>
              <th className="py-2 font-semibold">For</th>
              <th className="py-2 font-semibold">Where</th>
              <th className="py-2 font-semibold">Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {keys.map(([k, why, status]) => (
              <tr key={k} className="border-b border-line last:border-0">
                <td className="py-2.5 font-mono text-[13px]">{k.toUpperCase().replace(/\s+/g, "_")}</td>
                <td className="py-2.5 text-ink-2">{why}</td>
                <td className="py-2.5 text-xs">{status}</td>
                <td className="py-2.5 text-xs text-ink-2">by you · today</td>
                <td className="py-2.5 text-right whitespace-nowrap">
                  <button type="button" title="For security, saved keys can’t be shown again. To change one, replace it." className="text-[13px] text-accent">Replace</button>
                  <button type="button" className="ml-3 text-[13px] text-bad">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-2">Saved encrypted, separately from your code and chat. For security, saved keys can’t be shown again. To change one, replace it.</p>
    </div>
  );
}

function GeneralTab({ project: p, update }: { project: Project; update: Update }) {
  const [name, setName] = useState(p.name);
  return (
    <div className={card}>
      <label className="flex flex-col gap-1.5 text-sm">
        Project name
        <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        What it does
        <textarea readOnly value={p.plan.what} rows={3} className={`${input} resize-none text-ink-2`} />
        <span className="text-xs text-ink-2">To change this, edit the plan.</span>
      </label>
      <button type="button" disabled={name.trim() === p.name || !name.trim()} onClick={() => update((q) => ({ ...q, name: name.trim() }))} className={`${btnPrimary} self-start`}>
        Save
      </button>
    </div>
  );
}

function DangerTab({ project: p }: { project: Project }) {
  const { remove } = useProjects();
  const router = useRouter();
  const [sure, setSure] = useState(false);
  return (
    <div className={`${card} border-bad/40`}>
      <span className="text-lg font-semibold text-bad">Delete this project</span>
      <p className="text-sm text-ink-2">Deletes the plan, code, versions and test data. {p.deploy?.liveVersion ? "The live app goes offline." : ""}</p>
      <button type="button" onClick={() => setSure(true)} className="flex h-10 items-center self-start rounded-[10px] border border-bad px-4 text-[13px] font-medium text-bad">
        Delete project
      </button>
      <Modal
        open={sure}
        onClose={() => setSure(false)}
        title={`Delete ${p.name}?`}
        actions={
          <>
            <button type="button" onClick={() => setSure(false)} className={btnOutline}>Keep it</button>
            <button
              type="button"
              onClick={() => {
                remove(p.id);
                router.push("/home");
              }}
              className="flex h-10 items-center rounded-[10px] bg-bad px-4 text-[13px] font-medium text-white"
            >
              Delete
            </button>
          </>
        }
      >
        <p>This can’t be undone.</p>
      </Modal>
    </div>
  );
}

export function ProjectSettings({ project, update }: { project: Project; update: Update }) {
  const params = useSearchParams();
  const router = useRouter();
  // The tab follows the address, so links like the top bar's "Review" (…?tab=team) always open the right one.
  const asked = params.get("tab") as Tab | null;
  const tab: Tab = asked && tabs.some((t) => t.key === asked) ? asked : "general";
  const go = (t: Tab) => router.replace(`/p/${project.id}/settings?tab=${t}`, { scroll: false });
  return (
    <div className="flex flex-col">
      <div className="flex min-h-12 items-center gap-3 border-b border-line bg-panel px-4 text-[13px] md:px-5">
        <strong className="font-semibold">Project settings</strong>
        <span className="text-ink-2">{project.name}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[200px_minmax(0,1fr)] md:p-6">
        <nav aria-label="Project settings" className="-mx-1 flex gap-1 overflow-x-auto md:mx-0 md:flex-col">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-current={tab === t.key ? "page" : undefined}
              onClick={() => go(t.key)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 text-left text-sm whitespace-nowrap ${tab === t.key ? "border border-line-strong bg-raised" : "hover:bg-hover"} ${t.key === "danger" ? "text-bad" : ""}`}
            >
              {t.label}
              {t.key === "github" && project.github && project.github.behind > 0 && <span className="size-1.5 rounded-full bg-accent" />}
            </button>
          ))}
        </nav>
        <div className="min-w-0 max-w-[760px]">
          {tab === "general" && <GeneralTab project={project} update={update} />}
          {tab === "keys" && <KeysTab project={project} />}
          {tab === "github" && <GitHubTab project={project} update={update} />}
          {tab === "ai" && <AITab project={project} />}
          {tab === "team" && <TeamTab project={project} update={update} />}
          {tab === "danger" && <DangerTab project={project} />}
        </div>
      </div>
    </div>
  );
}

/** Two-way sync with your own repo (Developer add-on): versions go out as pull requests, GitHub changes come in by themselves. */
function TwoWaySync({ project: p, update }: { project: Project; update: (fn: (p: Project) => Project) => void }) {
  const { addOn } = useAddOn();
  const sync = p.sync ?? { prs: true, pull: true };
  const set = (k: "prs" | "pull") => update((q) => ({ ...q, sync: { ...(q.sync ?? { prs: true, pull: true }), [k]: !sync[k] } }));
  return (
    <div className={card}>
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-semibold">Two-way sync</span>
        <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2">Developer add-on</span>
      </span>
      {!addOn ? (
        <>
          <p className="text-sm text-ink-2">
            Now, changes from GitHub come in when you press Get latest. With the Developer add-on it happens both ways by itself: each version goes to your repo as a pull request, and changes made on GitHub come in on their own.
          </p>
          <UnlockButton className={`${btnPrimary} self-start`}>Unlock two-way sync</UnlockButton>
        </>
      ) : (
        <>
          {([
            ["prs", "Send each version to GitHub as a pull request", "You or a teammate merge it on GitHub, as usual."],
            ["pull", "Bring in changes made on GitHub", "Before each build. If the same lines changed in both places, you choose."],
          ] as const).map(([k, title, sub]) => (
            <button key={k} type="button" role="switch" aria-checked={sync[k]} onClick={() => set(k)} className="flex items-start justify-between gap-3 border-t border-line pt-3 text-left">
              <span className="flex flex-col">
                <span className="text-sm">{title}</span>
                <span className="text-xs text-ink-2">{sub}</span>
              </span>
              <Switch on={sync[k]} />
            </button>
          ))}
          {sync.prs && p.versions[0] && (
            <p className="rounded-xl bg-sunken px-3 py-2.5 text-xs text-ink-2">
              Latest pull request: <span className="font-mono">#{p.versions[0].n + 3}</span> · v{p.versions[0].n} · {p.versions[0].title} <span className="text-ink-3">(example)</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
