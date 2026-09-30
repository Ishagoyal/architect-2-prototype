"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../Icon";
import { btnOutline, btnPrimary } from "../Modal";
import { usePrefs } from "@/lib/prefs";
import { uid, type Project } from "@/lib/model";

/* Design B4: after import, add the keys the code uses. Keys go in a form, never in the chat. */

type Update = (fn: (p: Project) => Project) => void;

function Checklist({ at }: { at: number }) {
  const items = ["Copied your code", "Installed what it needs", "Add passwords and keys", "Here’s what we think your app does", "Check what works"];
  return (
    <ol className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4">
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-2.5 text-sm">
          <span className={`flex size-[22px] shrink-0 items-center justify-center rounded-full ${i < at ? "bg-good-soft text-good" : i === at ? "border-2 border-progress" : "border border-line-strong"}`}>
            {i < at && <Icon name="check" size={12} strokeWidth={2.6} />}
          </span>
          <span className={i === at ? "font-semibold" : i > at ? "text-ink-2" : ""}>{t}</span>
        </li>
      ))}
    </ol>
  );
}

export function SetupView({ project: p, update }: { project: Project; update: Update }) {
  const router = useRouter();
  const { devView, setDevView } = usePrefs();
  const [dismissed, setDismissed] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const replaced = p.imported?.keyReplaced;
  const rows: { name: string; where: string; preview: boolean; live: boolean }[] = [
    { name: "OPENAI_API_KEY", where: "lib/ai.ts · meal suggestions", preview: false, live: false },
    { name: "DEEPGRAM_API_KEY", where: "lib/voice.ts · voice updates", preview: true, live: false },
    { name: "DATABASE_URL", where: "db/index.ts · your app’s data", preview: true, live: true },
  ];
  const cell = (id: string, saved: boolean, label: string) =>
    saved || keys[id]?.trim() ? (
      <span className="flex h-10 items-center gap-1.5 rounded-[10px] border border-line bg-sunken px-3 text-[13px] text-good">
        <Icon name="check" size={13} strokeWidth={2.4} /> Saved
      </span>
    ) : (
      <input
        type="password"
        aria-label={label}
        placeholder={label}
        onBlur={(e) => setKeys((k) => ({ ...k, [id]: e.target.value }))}
        className="h-10 w-full rounded-[10px] border border-line-strong bg-raised px-3 text-[13px] outline-none placeholder:text-ink-3 focus:border-ink-3"
      />
    );

  if (!p.imported) return null;

  return (
    <div className="flex flex-col">
      <div className="flex min-h-12 flex-wrap items-center gap-x-3 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
        <strong className="font-semibold">Setting up {p.name}</strong>
        <span className="text-ink-2">Imported from {p.imported.repo} · we don’t change your GitHub repo</span>
      </div>
      {devView && (
        <div className="flex items-center gap-2 border-b border-line bg-info-soft px-5 py-2 text-[13px] text-info">
          <Icon name="code" size={14} />
          Developer view is on because you imported a project ·
          <button type="button" onClick={() => setDevView(false)} className="font-medium underline">
            Turn off
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="self-start">
          <Checklist at={p.imported.setup === "keys" ? 2 : 3} />
        </div>
        <div className="flex flex-col gap-4">
          {!dismissed && !replaced && (
            <div className="flex flex-col gap-2 rounded-2xl bg-bad-soft p-5">
              <h2 className="font-semibold text-bad">We found an OpenAI key in .env in your repo</h2>
              <p className="text-sm text-bad">
                It’s saved in your GitHub history, so anyone with access to the repo may have seen it. Replace it with a new key: create one at OpenAI, paste it below, then delete the old one
                there.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    update((q) => ({ ...q, imported: q.imported && { ...q.imported, keyReplaced: true } }));
                    document.getElementById("key-OPENAI_API_KEY-preview")?.focus();
                  }}
                  className={btnPrimary}
                >
                  Replace it
                </button>
                <button type="button" onClick={() => setDismissed(true)} className={btnOutline}>
                  Not now
                </button>
              </div>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="p-5">
              <h2 className="text-lg font-semibold">Passwords and keys your app uses</h2>
              <p className="text-sm text-ink-2">We found these in your code. Preview keys are for testing here, Live keys for the real app.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-y border-line bg-sunken text-[13px] text-ink-2">
                    <th className="px-5 py-2 font-semibold">Name · where it’s used</th>
                    <th className="px-2 py-2 font-semibold">Preview</th>
                    <th className="px-2 py-2 pr-5 font-semibold">Live</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.name} className="border-b border-line">
                      <td className="px-5 py-3 align-top">
                        <span className="block font-mono text-[13px]">{r.name}</span>
                        <span className="text-xs text-ink-2">{r.where}</span>
                      </td>
                      <td className="px-2 py-3" id={`key-${r.name}-preview-cell`}>{cell(`${r.name}-preview`, r.preview, "Paste preview key")}</td>
                      <td className="px-2 py-3 pr-5">{cell(`${r.name}-live`, r.live, "Paste live key")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <p className="text-xs text-ink-2">
                Saved encrypted, separately from your code and chat. Saved keys can’t be shown again. <Link href={`/p/${p.id}/settings?tab=keys`} className="text-accent">How we store keys</Link>
              </p>
              <button
                type="button"
                onClick={() => {
                  update((q) => ({
                    ...q,
                    imported: q.imported && { ...q.imported, setup: "plan" },
                    chat: [...q.chat, { id: uid(), type: "ai", text: "Thanks. I read your code, README and AGENTS.md and wrote down what I think your app does. Check it before building: every build and check will use it." }],
                  }));
                  router.push(`/p/${p.id}/plan`);
                }}
                className={btnPrimary}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
