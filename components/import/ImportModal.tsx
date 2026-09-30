"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { btnOutline, btnPrimary } from "../Modal";
import { useProjects } from "@/lib/projects";
import { usePrefs } from "@/lib/prefs";
import { useViewer } from "@/lib/viewer-context";
import { importedProject } from "@/lib/model";

/* Designs B2 (connect GitHub, only the repos you pick) and B3 (pick the repo). */

const repos = ["CookBridge", "school-fees-tracker", "portfolio-site", "notes-api"];
const KEY = "architect.github";

export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const viewer = useViewer();
  const { add } = useProjects();
  const { setDevView } = usePrefs();
  const handle = viewer.kind === "demo" ? "alexmorgan" : viewer.firstName.toLowerCase();
  const [connected, setConnected] = useState(false);
  const [scope, setScope] = useState<"only" | "all">("only");
  const [picked, setPicked] = useState<string[]>(["CookBridge"]);
  const [source, setSource] = useState<"GitHub" | "ZIP file" | "Lovable, Bolt, v0…">("GitHub");
  const [repo, setRepo] = useState("CookBridge");

  useEffect(() => {
    if (!open) return;
    try {
      setConnected(localStorage.getItem(KEY) === "1");
    } catch {
      /* not remembered */
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const connect = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* fine */
    }
    setConnected(true);
    if (!picked.includes(repo)) setRepo(picked[0] ?? repos[0]);
  };
  const doImport = () => {
    const p = { ...importedProject(`${handle}/${repo}`), stepByStep: viewer.kind === "demo" };
    add(p);
    setDevView(true);
    onClose();
    router.push(`/p/${p.id}/setup`);
  };
  const visible = scope === "all" ? repos : picked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-scrim" />
      <div role="dialog" aria-modal="true" aria-label="Import a project" className="relative flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-panel shadow-pop">
        <div className="flex items-start gap-3 px-6 pt-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sunken">
            <Icon name="share" size={17} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-xl font-semibold">{connected ? "Import a project" : "Connect GitHub"}</span>
            <span className="text-sm text-ink-2">{connected ? "Bring existing code and keep working on it in Architect." : "Pick the repos Architect can see. It can’t see or change anything else."}</span>
          </span>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-9 items-center justify-center rounded-[10px] hover:bg-hover">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {!connected ? (
            <>
              <div role="radiogroup" className="flex flex-col gap-2">
                {(["only", "all"] as const).map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={scope === s} onClick={() => setScope(s)} className={`flex flex-col rounded-xl border p-3 text-left ${scope === s ? "border-accent bg-needs" : "border-line-strong"}`}>
                    <span className="text-sm font-semibold">{s === "only" ? "Only these repos (recommended)" : "All repos, now and later"}</span>
                    <span className="text-[13px] text-ink-2">{s === "only" ? "Architect sees only what you tick below." : "Architect can see every repo in your account."}</span>
                  </button>
                ))}
              </div>
              {scope === "only" && (
                <div className="flex flex-col gap-1.5 rounded-xl border border-line p-3">
                  {repos.map((r) => (
                    <label key={r} className="flex items-center gap-2.5 text-sm">
                      <input type="checkbox" checked={picked.includes(r)} onChange={() => setPicked((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]))} className="size-4 accent-[var(--primary)]" />
                      <span className="font-mono text-[13px]">{handle}/{r}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-ink-2">This is a demo: nothing connects to your real GitHub.</p>
            </>
          ) : (
            <>
              <div role="tablist" className="grid grid-cols-3 gap-1 rounded-xl bg-sunken p-1">
                {(["GitHub", "ZIP file", "Lovable, Bolt, v0…"] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={source === t} onClick={() => setSource(t)} className={`h-10 rounded-[10px] text-sm ${source === t ? "border border-line-strong bg-raised" : "text-ink"}`}>
                    {t}
                  </button>
                ))}
              </div>
              {source !== "GitHub" ? (
                <p className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-ink-2">
                  {source === "ZIP file" ? "Drop a ZIP of your app here." : "Paste the link to your Lovable, Bolt or v0 project."} In this demo, use GitHub to see the full import.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 text-good">
                      <Icon name="check" size={13} strokeWidth={2.4} />
                      Connected as @{handle}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem(KEY);
                        } catch {
                          /* fine */
                        }
                        setConnected(false);
                      }}
                      className="text-accent"
                    >
                      Switch account
                    </button>
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm">
                    Repository
                    <select value={repo} onChange={(e) => setRepo(e.target.value)} className="h-12 rounded-xl border border-line-strong bg-raised px-3 text-[15px]">
                      {visible.map((r) => (
                        <option key={r} value={r}>
                          {handle}/{r}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5 text-sm">
                      Branch
                      <select className="h-12 rounded-xl border border-line-strong bg-raised px-3 text-[15px]">
                        <option>main</option>
                        <option>dev</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span>
                        Subfolder <span className="text-ink-2">(optional)</span>
                      </span>
                      <input placeholder="e.g. apps/web" className="h-12 rounded-xl border border-line-strong bg-raised px-3 text-[15px] placeholder:text-ink-3" />
                    </label>
                  </div>
                  {repo === "CookBridge" && (
                    <p className="flex items-center gap-2 rounded-xl bg-info-soft px-3 py-2.5 text-[13px] text-info">
                      <Icon name="plan" size={14} />
                      Found <span className="font-mono">AGENTS.md</span> in this repo. Architect will follow it as your project’s instructions.
                    </p>
                  )}
                  <p className="flex items-center gap-2 rounded-xl bg-good-soft px-3 py-2.5 text-[13px] text-good">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    We don’t change your GitHub repo. Your work is saved in Architect.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-line p-3 text-[13px]">
                      <span className="font-semibold">Comes over now</span>
                      <p className="mt-1 text-ink-2">Your app’s code and files</p>
                      <p className="text-ink-2">Your notes for AI tools (like AGENTS.md)</p>
                    </div>
                    <div className="rounded-xl border border-line p-3 text-[13px]">
                      <span className="font-semibold">We’ll ask you after import</span>
                      <p className="mt-1 text-ink-2">Passwords and keys your app uses</p>
                      <p className="text-ink-2">Your app’s saved data</p>
                      <p className="text-ink-2">Your own web address, if you have one</p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <span className="text-[13px] text-accent">{connected ? "Public repo? Paste a URL instead" : ""}</span>
          <span className="flex gap-2">
            <button type="button" onClick={onClose} className={btnOutline}>
              Cancel
            </button>
            {connected ? (
              <button type="button" data-tour="import-go" disabled={source !== "GitHub"} onClick={doImport} className={btnPrimary}>
                Import project
              </button>
            ) : (
              <button type="button" data-tour="import-connect" disabled={scope === "only" && picked.length === 0} onClick={connect} className={btnPrimary}>
                Connect
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
