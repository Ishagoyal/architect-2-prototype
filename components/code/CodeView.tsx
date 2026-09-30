"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../Icon";
import { planMarkdown, uid, type Project } from "@/lib/model";
import { useAddOn } from "@/lib/addon";
import { UnlockButton } from "../UpgradeModal";

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
      if (f.endsWith("/") && f.startsWith("agents/")) return; // the agent's own files are above
      const name = f.includes(".") ? f : `${f}/page.tsx`;
      files[name] = s.kind === "ai" && p.kind === "meal" && name.startsWith("lib/") ? mealAI : codeFor(p, s, name);
    }),
  );
  return { ...files, ...p.codeEdits };
}

const mealAI = `import { pantry } from "@/db/pantry"\nimport { runAgent } from "@/agents/run"\n\n// Asks the meal planner for 3 meals from what is in the kitchen.\n// Skips anything cooked in the last 3 days (step 3 of the plan).\nexport async function suggestMeals(householdId: string) {\n  const stock = await pantry.current(householdId)\n  const recent = await pantry.confirmedSince(householdId, 3)\n  return runAgent("meal-planner", { stock, recent, count: 3 })\n}\n`;

const camel = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
const snake = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const pascal = (x: string) => camel(x).replace(/^./, (c) => c.toUpperCase());

/** Believable code for a file a step wrote, from the plan (what the app saves, its screens, its AI). */
function codeFor(p: Project, s: Project["plan"]["steps"][number], name: string): string {
  const head = `// ${s.title}: written in step ${p.plan.steps.indexOf(s) + 1} of the plan.\n`;
  const saves = p.plan.saves;
  if (name.endsWith("schema.ts"))
    return `${head}import { table, id, text, timestamp, references } from "@/db/lib"\n\n${saves
      .map(([label], i) => `export const ${camel(label)} = table("${snake(label)}", {\n  id: id(),\n  name: text().notNull(),${i > 0 ? `\n  ${camel(saves[0][0])}Id: references(${camel(saves[0][0])}.id),` : ""}\n  createdAt: timestamp().defaultNow(),\n})`)
      .join("\n\n")}\n`;
  if (name.endsWith("seed.ts"))
    return `${head}import { db } from "@/db"\nimport { ${saves.map(([l]) => camel(l)).join(", ")} } from "@/db/schema"\n\n// A few examples, so the preview isn't empty.\nexport async function seed() {\n${saves.map(([l, ex]) => `  await db.insert(${camel(l)}).values({ name: ${JSON.stringify(ex)} })`).join("\n")}\n}\n`;
  if (name.includes("login"))
    return `${head}"use client"\n\nimport { useState } from "react"\nimport { sendSignInLink } from "@/lib/auth"\n\nexport default function Login() {\n  const [email, setEmail] = useState("")\n  const [sent, setSent] = useState(false)\n  return sent ? (\n    <p>Check your email for a sign-in link.</p>\n  ) : (\n    <form onSubmit={async (e) => { e.preventDefault(); await sendSignInLink(email); setSent(true) }}>\n      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />\n      <button>Send me a link</button>\n    </form>\n  )\n}\n`;
  if (name.endsWith("auth.ts"))
    return `${head}import { auth } from "@/lib/server"\n\n// Sign-in by email: a one-time link, no password to remember.\nexport async function sendSignInLink(email: string) {\n  return auth.signInWithOtp({ email, options: { emailRedirectTo: "/" } })\n}\n\nexport async function currentUser() {\n  const { data } = await auth.getUser()\n  return data.user\n}\n`;
  if (name.startsWith("lib/") && s.kind === "ai")
    return `${head}import { runAgent } from "@/agents/run"\n\n// The app’s AI: ${p.plan.ai?.does ?? "answers questions"}\n// It can’t: ${p.plan.ai?.cant ?? "change anything by itself"}\nexport async function ask(question: string, userId: string) {\n  const reply = await runAgent("assistant", { question, userId })\n  return { answer: reply.text, sources: reply.sources ?? [] }\n}\n`;
  if (name.startsWith("app/") && name.endsWith(".tsx")) {
    const page = pascal(name.split("/")[1] || "Home") || "Page";
    const t = p.template;
    return `${head}import { db } from "@/db"\nimport { ${camel(saves[0]?.[0] ?? "items")} } from "@/db/schema"\n\nexport default async function ${page}Page() {\n  const rows = await db.select().from(${camel(saves[0]?.[0] ?? "items")}).limit(20)\n  return (\n    <main>\n      <p className="eyebrow">${t.eyebrow}</p>\n      <h1>${name.split("/")[1] === p.plan.screens[0]?.sub.split("/")[1] ? t.heading : pascal(name.split("/")[1] ?? "Page")}</h1>\n      <ul>\n        {rows.map((row) => <li key={row.id}>{row.name}</li>)}\n      </ul>\n      <button>${t.action}</button>\n    </main>\n  )\n}\n`;
  }
  if (name.startsWith("lib/"))
    return `${head}import { db } from "@/db"\n\n// ${s.builds}\nexport async function run(userId: string) {\n  // Reads what the step needs, then saves the result.\n  const rows = await db.query.${camel(saves[0]?.[0] ?? "items")}.findMany({ where: { userId } })\n  return rows\n}\n`;
  return `${head}// ${s.builds}\nexport {}\n`;
}

const system = (name: string) => name === "plan.md" || name === "package.json";

export function CodeView({ project: p, file, update }: { project: Project; file?: string; update?: (fn: (p: Project) => Project) => void }) {
  const { addOn } = useAddOn();
  const files = filesFor(p);
  const names = Object.keys(files).sort();
  const [open, setOpen] = useState(file && files[file] ? file : names.find((n) => n.startsWith("lib/")) ?? "plan.md");
  const [q, setQ] = useState("");
  const [term, setTerm] = useState<string[]>(["$ "]);
  const locked = p.build.status === "running" || p.build.status === "checking";
  const lines = (files[open] ?? "").split("\n");
  const [draft, setDraft] = useState<string | null>(null);
  const editable = addOn && !locked && !system(open) && !!update;
  const text = draft ?? files[open] ?? "";
  const save = () => {
    if (draft === null || !update || locked) return;
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
                Editing and the terminal come with the Developer add-on.{" "}
                <UnlockButton className="font-medium text-accent">Unlock</UnlockButton>
              </>
            ) : locked ? (
              "Read-only while a step or its checks run · editing unlocks after"
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
                <Icon name={system(n) ? "lock" : "plan"} size={12} />
                <span className="truncate">{n}</span>
              </button>
            ))}
          </div>
          <span className="mt-2 flex items-center gap-1.5 border-t border-line px-2 pt-2 text-xs text-ink-2">
            <Icon name="lock" size={12} /> plan.md and package.json are kept by Architect, so they’re read-only
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
