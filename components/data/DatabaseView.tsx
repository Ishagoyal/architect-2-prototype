"use client";

import { useState } from "react";
import { btnOutline } from "../Modal";
import { uid, type Project } from "@/lib/model";

/* Designs A24 / A24.1: test data (a copy you can change) and live data (view only). */

type Row = string[];
const mealTables: Record<string, { head: string[]; rows: Row[] }> = {
  Households: { head: ["Name", "People", "Cook", "Since"], rows: [["The Rao family", "4", "Meena", "12 Sep"]] },
  Members: { head: ["Name", "Email", "Role", "Joined"], rows: [["Asha Rao", "asha.rao@example.com", "Owner", "12 Sep"], ["Meena", "meena@example.com", "Cook", "12 Sep"], ["Kabir Rao", "kabir@example.com", "Family", "14 Sep"], ["Tara Rao", "tara@example.com", "Family", "20 Sep"]] },
  "Kitchen items": { head: ["Item", "Amount", "Updated"], rows: [["Aloo", "2 kg", "today"], ["Rice", "5 kg", "yesterday"], ["Dal", "1 kg", "yesterday"], ["Tomato", "out", "today"]] },
  Meals: { head: ["Meal", "Eaten", "Confirmed by"], rows: [["Rajma chawal", "Tue 29 Sep", "Asha"], ["Aloo paratha", "Mon 28 Sep", "Kabir"]] },
};

function tablesFor(p: Project) {
  if (p.kind === "meal") return mealTables;
  const t: Record<string, { head: string[]; rows: Row[] }> = {};
  t[p.template.entity] = { head: ["Title", "Details", "Status"], rows: p.template.items.map((i) => [i.title, i.sub, i.meta]) };
  t.People = { head: ["Name", "Email", "Role"], rows: [["Sam Lee", "sam@example.com", "Owner"], ["Ravi Shah", "ravi@example.com", "Member"]] };
  return t;
}

export function DatabaseView({ project: p, update }: { project: Project; update: (fn: (p: Project) => Project) => void }) {
  const tables = tablesFor(p);
  const names = Object.keys(tables);
  const [which, setWhich] = useState<"test" | "live">("test");
  const [table, setTable] = useState(names[Math.min(1, names.length - 1)]);
  const [extra, setExtra] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const live = which === "live";
  const isLive = !!p.deploy?.liveVersion;
  const t = tables[table];
  const rows = [...t.rows, ...(live ? [] : extra)].filter((r) => r.join(" ").toLowerCase().includes(q.toLowerCase()));

  if (p.stepsDone === 0 && !p.imported)
    return <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-ink-2">Your app’s data shows here once step 1 is built.</div>;

  return (
    <div className="flex flex-col">
      <div className="flex min-h-12 items-center gap-3 border-b border-line bg-panel px-4 text-[13px] md:px-5">
        <strong className="font-semibold">Database</strong>
        <span className="flex gap-0.5 rounded-[10px] bg-sunken p-[3px]">
          {(["test", "live"] as const).map((w) => (
            <button key={w} type="button" aria-pressed={which === w} onClick={() => setWhich(w)} className={`h-[30px] rounded-lg px-3 ${which === w ? "border border-line bg-raised font-semibold" : "text-ink-2"}`}>
              {w === "test" ? "Test data" : "Live data"}
            </button>
          ))}
        </span>
      </div>
      <div className="flex flex-col gap-4 p-4 md:p-5">
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-[13px] ${live ? "bg-sunken" : "bg-info-soft text-info"}`}>
          <span>
            {live ? (
              <>
                <strong className="font-semibold">Live data</strong> · view only. The AI can never change it. {isLive ? "" : "Your app isn’t live yet, so this is empty."}
              </>
            ) : (
              <>
                <strong className="font-semibold">Test data</strong> · a copy for trying things. Your live app doesn’t see changes here.
                <span className="block">{isLive ? "Copied from live data 2 days ago · names, emails and phone numbers replaced with made-up ones" : "Sample data, made for the preview"}</span>
              </>
            )}
          </span>
          {!live && isLive && <button type="button" className={`${btnOutline} h-9`}>Refresh with live data</button>}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
          <div className="flex gap-1 overflow-x-auto md:flex-col">
            <span className="hidden px-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase md:block">Tables</span>
            {names.map((n) => (
              <button key={n} type="button" onClick={() => setTable(n)} className={`flex h-10 shrink-0 items-center justify-between gap-3 rounded-[10px] px-3 text-sm ${table === n ? "border border-line-strong bg-raised" : "hover:bg-hover"}`}>
                {n}
                <span className="text-xs text-ink-2">{live && !isLive ? 0 : tables[n].rows.length + (n === table && !live ? extra.length : 0)}</span>
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <span className="flex flex-col">
                <span className="text-lg font-semibold">{table}</span>
                <span className="text-xs text-ink-2">{live && !isLive ? "empty" : `${rows.length} rows`}</span>
              </span>
              <span className="flex gap-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${table.toLowerCase()}`} className="h-9 w-44 rounded-[10px] border border-line-strong bg-raised px-3 text-[13px] placeholder:text-ink-3" />
                {!live && (
                  <button
                    type="button"
                    onClick={() => {
                      setExtra((x) => [...x, t.head.map((h, i) => (i === 0 ? `New ${table.toLowerCase().replace(/s$/, "")} ${x.length + 1}` : "—"))]);
                      update((pp) => ({ ...pp, chat: [...pp.chat, { id: uid(), type: "ai", text: `Added a made-up row to ${table.toLowerCase()} in test data. Your live app doesn’t see it.` }] }));
                    }}
                    className={`${btnOutline} h-9`}
                  >
                    + Add row
                  </button>
                )}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-y border-line text-xs text-ink-2">
                    {t.head.map((h) => (
                      <th key={h} className="px-4 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(live && !isLive ? [] : rows).map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      {r.map((c, j) => (
                        <td key={j} className="px-4 py-2.5">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-3 text-xs text-ink-2">{live ? "View only. Asked to change live data, the AI offers a way that works instead, like adding a button to the app." : "Click any row to change it."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
