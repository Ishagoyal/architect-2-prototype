"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { BuilderMenu } from "./project/Panel";
import { ImportModal } from "./import/ImportModal";
import { useDismiss } from "./useDismiss";
import { useCallback, useEffect } from "react";

/* The big "Describe your app" box on Home. Sending it opens Refine (step 3 of the build plan). */
export function PromptBox({ heading, ideas, initial = "" }: { heading: string; ideas: string[]; initial?: string }) {
  const [text, setText] = useState(initial);
  const router = useRouter();
  const [plus, setPlus] = useState(false);
  const [importing, setImporting] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const closePlus = useCallback(() => setPlus(false), []);
  const plusRef = useDismiss<HTMLDivElement>(plus, closePlus);
  // The demo tour opens the import straight away (/home?import=1).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("import") !== "1") return;
    setImporting(true);
    url.searchParams.delete("import");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, []);
  const go = () => {
    if (text.trim()) router.push(`/new?idea=${encodeURIComponent(text.trim())}`);
  };
  const empty = text.trim() === "";
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="mt-7 flex flex-col gap-4 rounded-[18px] border border-line-strong bg-panel p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:mt-9 md:p-[22px]"
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
          aria-label="Describe your app"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              go();
            }
          }}
          placeholder="Describe your app — e.g. an app that reminds my team about unpaid invoices"
          rows={3}
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-base leading-normal outline-none placeholder:text-ink-3 md:text-[17px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div ref={plusRef} className="relative">
              <button
                type="button"
                aria-label="Add files, import a project or connect apps"
                data-tour="plus"
                aria-expanded={plus}
                onClick={() => setPlus((x) => !x)}
                className={`flex size-10 items-center justify-center rounded-[10px] border ${plus ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-panel"}`}
              >
                <Icon name="plus" size={16} strokeWidth={2} />
              </button>
              {plus && (
                <div role="menu" className="absolute top-full left-0 z-40 mt-2 w-[min(380px,calc(100vw-48px))] rounded-2xl border border-line bg-panel p-2 shadow-pop">
                  {[
                    { icon: "folder" as const, t: "Add files", s: "Docs, spreadsheets or images your app should use", chip: "brief.pdf" },
                    { icon: "share" as const, t: "Connect apps", s: "Gmail, Slack, Google Sheets and more", chip: "Google Sheets" },
                    { icon: "app" as const, t: "Add a design reference", s: "A screenshot, website link or Figma file", chip: "reference.png" },
                  ].map((it) => (
                    <button key={it.t} type="button" role="menuitem" onClick={() => { setChips((c) => (c.includes(it.chip) ? c : [...c, it.chip])); closePlus(); }} className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-hover">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sunken"><Icon name={it.icon} size={15} /></span>
                      <span className="flex flex-col"><span className="text-sm">{it.t}</span><span className="text-xs text-ink-2">{it.s}</span></span>
                    </button>
                  ))}
                  <div className="my-1 h-px bg-line" />
                  <button type="button" role="menuitem" data-tour="import-open" onClick={() => { closePlus(); setImporting(true); }} className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-hover">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sunken"><Icon name="share" size={15} /></span>
                    <span className="flex flex-col"><span className="text-sm">Import project</span><span className="text-xs text-ink-2">From GitHub, a ZIP file, or Lovable, Bolt and v0</span></span>
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setChips((c) => (c.includes("AGENTS.md") ? c : [...c, "AGENTS.md"])); closePlus(); }} className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-hover">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sunken"><Icon name="plan" size={15} /></span>
                    <span className="flex flex-col"><span className="text-sm">Add context file</span><span className="text-xs text-ink-2">AGENTS.md or notes on how it should be built</span></span>
                  </button>
                </div>
              )}
            </div>
            <BuilderMenu size="md" placement="down" />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Speak instead of typing"
              className="flex size-10 items-center justify-center rounded-[10px] border border-line-strong bg-panel"
            >
              <Icon name="mic" size={16} />
            </button>
            <button
              type="submit"
              aria-label="Send"
              data-tour="send"
              disabled={empty}
              className="flex size-10 items-center justify-center rounded-[10px] bg-primary text-on-primary disabled:cursor-default disabled:bg-line-strong disabled:text-panel"
            >
              <Icon name="send" size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-between text-[13px]">
        <span className="text-ink-2">{heading}</span>
        <Link href="/explore" className="font-medium text-accent hover:text-accent-strong">
          Browse templates →
        </Link>
      </div>
      <div className="mt-3 flex flex-col items-start gap-2">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            data-tour="idea"
            onClick={() => setText(idea)}
            className="rounded-full border border-line-strong bg-panel px-4 py-[11px] text-left text-sm hover:border-ink-3"
          >
            {idea}
          </button>
        ))}
      </div>
      <ImportModal open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
