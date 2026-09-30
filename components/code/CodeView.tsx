"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../Icon";
import { planMarkdown, uid, type Project } from "@/lib/model";
import { useAddOn } from "@/lib/addon";

/* Designs A16 / A17: anyone can read the code. Editing it and the terminal come with the
   Developer add-on (PRODUCT.md: "Free users see, paid users do"). */

function filesFor(p: Project): Record<string, string> {
  const agent = p.kind === "meal" ? "meal-planner" : "assistant";
  const files: Record<string, string> = {
    "plan.md": planMarkdown(p),
    "AGENTS.md": "# Notes for AI tools\n\n- Keep screens simple enough for a phone.\n- Every change needs its checks to pass.\n",
    [`agents/${agent}/SOUL.md`]: p.plan.ai?.does ?? "No agent yet.",
    [`agents/${agent}/RULES.md`]: `Never: ${p.plan.ai?.cant ?? "—"}`,
    "package.json": '{\n  "name": "' + p.id + '",\n  "private": true,\n  "dependencies": { "next": "16", "react": "19" }\n}\n',
  };
  p.plan.steps.slice(0, Math.max(p.stepsDone, p.imported ? p.plan.steps.length : 0)).forEach((s) =>
    s.files.forEach((f) => {
      if (!f.includes(".")) return;
      files[f] =
        s.kind === "ai" && p.kind === "meal"
          ? `import { pantry } from "@/db/pantry"\nimport { runAgent } from "@/agents/run"\n\n// Asks the meal planner for 3 meals from what is in the kitchen.\n// Skips anything cooked in the last 3 days (step 3 of the plan).\nexport async function suggestMeals(householdId: string) {\n  const stock = await pantry.current(householdId)\n  const recent = await pantry.confirmedSince(householdId, 3)\n  return runAgent("meal-planner", { stock, recent, count: 3 })\n}\n`
          : `// ${s.title}: ${s.builds}\n// Written in step ${p.plan.steps.indexOf(s) + 1} of the plan.\n\nexport {}\n`;
    }),
  );
  return { ...files, ...p.codeEdits };
}

const system = (name: string) => name === "plan.md" || name === "package.json";

export function CodeView({ project: p, file, update }: { project: Project; file?: string; update?: (fn: (p: Project) => Project) => void }) {
  const { addOn } = useAddOn();
  const files = filesFor(p);
  const names = Object.keys(files).sort();
  const [open, setOpen] = useState(file && files[file] ? file : names.find((n) => n.startsWith("lib/")) ?? "plan.md");
  const [q, setQ] = useState("");
  const [term, setTerm] = useState<string[]>(["$ "]);
  const locked = p.build.status === "running";
  const lines = (files[open] ?? "").split("\n");
  const [draft, setDraft] = useState<string | null>(null);
  const editable = addOn && !locked && !system(open) && !!update;
  const text = draft ?? files[open] ?? "";
  const save = () => {
    if (draft === null || !update) return;
    const name = open;
    update((q) => ({
      ...q,
      codeEdits: { ...q.codeEdits, [name]: draft },
      chat: [...q.chat, { id: uid(), type: "ai", text: `Saved your change to ${name}. The next build and checks use it.` }],
    }));
    setDraft(null);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line bg-panel px-4 text-[13px] md:px-5">
        <span className="flex items-center gap-3">
          <strong className="font-semibold">Code</strong>
          <span className="text-ink-2">
            {!addOn ? (
              <>
                {names.length} files · read-only.{" "}
                <Link href="/settings" className="text-accent">Editing and the terminal come with the Developer add-on</Link>
              </>
            ) : locked ? (
              "Read-only while a step runs · editing unlocks after it"
            ) : (
              `${names.length} files · click a file to edit it`
            )}
          </span>
        </span>
        {p.github && p.github.behind > 0 && (
          <Link href={`/p/${p.id}/settings?tab=github`} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent-strong">
            {p.github.behind} new on GitHub · Get latest
          </Link>
        )}
      </div>
      <div className="flex min-h-[520px] flex-1 flex-col md:flex-row">
        <div className="flex shrink-0 flex-col gap-0.5 border-b border-line bg-panel p-2 md:w-[220px] md:border-r md:border-b-0">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" className="mb-2 h-9 rounded-[10px] border border-line-strong bg-raised px-3 text-[13px] placeholder:text-ink-3" />
          <div className="flex max-h-40 flex-col overflow-y-auto md:max-h-none">
            {names.filter((n) => n.includes(q)).map((n) => (
              <button key={n} type="button" onClick={() => {
                  setOpen(n);
                  setDraft(null);
                }} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left font-mono text-[12.5px] ${open === n ? "bg-sunken" : "hover:bg-hover"}`}>
                <Icon name="plan" size={12} />
                <span className="truncate">{n}</span>
              </button>
            ))}
          </div>
          <span className="mt-2 flex items-center gap-1.5 border-t border-line px-2 pt-2 text-xs text-ink-2">
            <Icon name="lock" size={12} /> System files · read-only
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-line px-4 py-1.5 font-mono text-xs text-ink-2">
            <span>
              {open}
              {addOn && system(open) && " · read-only (system file)"}
            </span>
            {draft !== null && (
              <span className="flex gap-2 font-sans">
                <button type="button" onClick={() => setDraft(null)} className="h-8 rounded-lg px-2.5 text-[13px] text-ink-2 hover:bg-hover">Undo</button>
                <button type="button" onClick={save} className="h-8 rounded-lg bg-primary px-3 text-[13px] font-medium text-on-primary">Save</button>
              </span>
            )}
          </div>
          {editable ? (
            <textarea
              aria-label={`Edit ${open}`}
              value={text}
              spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[360px] flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 outline-none"
            />
          ) : (
          <pre className="flex-1 overflow-auto py-3 font-mono text-[13px] leading-6">
            {lines.map((l, i) => (
              <div key={i} className="flex gap-4 px-4">
                <span className="w-6 shrink-0 text-right text-ink-3 select-none">{i + 1}</span>
                <span className="whitespace-pre-wrap">{l}</span>
              </div>
            ))}
          </pre>
          )}
          <div className={`${addOn ? "flex" : "hidden"} flex-col border-t border-line bg-sunken`}>
            <div className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="flex gap-4">
                <strong className="font-semibold">Terminal</strong>
                <span className="text-ink-2">Logs</span>
              </span>
              <span className="text-ink-2">runs in your app’s sandbox</span>
            </div>
            <form
              className="px-4 pb-3 font-mono text-xs"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("cmd") as HTMLInputElement).value;
                setTerm((t) => [...t.slice(0, -1), `$ ${input}`, input.startsWith("npm") ? "added 1 package in 2s" : "done", "$ "]);
                e.currentTarget.reset();
              }}
            >
              {term.slice(0, -1).map((l, i) => (
                <div key={i} className={l.startsWith("$") ? "" : "text-ink-2"}>{l}</div>
              ))}
              <label className="flex gap-1">
                $ <input name="cmd" aria-label="Terminal command" disabled={locked} placeholder={locked ? "waiting for the current step" : "npm install dayjs"} className="flex-1 bg-transparent outline-none placeholder:text-ink-3" />
              </label>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
