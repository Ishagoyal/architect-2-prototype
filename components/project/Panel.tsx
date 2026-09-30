"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../Icon";

/* Right panel: "Needs you" on top (hidden when empty), chat below.
   The content is the demo project mid-build; journey steps replace it with real states. */

export type NeedsItem = {
  title: string;
  detail: string;
  action: string;
  links?: { label: string; href: string }[];
};

export function NeedsYou({ items }: { items: NeedsItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Needs you" className="flex shrink-0 flex-col gap-2.5 border-b border-line bg-needs p-4">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-accent-strong uppercase">
        <Icon name="flag" size={14} strokeWidth={2} />
        Needs you
      </div>
      {items.slice(0, 2).map((item) => (
        <div key={item.title} className="flex flex-col gap-2.5 rounded-xl border border-accent-line bg-panel p-3">
          <span className="text-[13px] font-semibold">{item.title}</span>
          <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <span className="text-good">
              <Icon name="check" size={14} strokeWidth={2.4} />
            </span>
            {item.detail}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium whitespace-nowrap text-on-primary"
            >
              {item.action}
            </button>
            {item.links?.map((l) => (
              <Link key={l.label} href={l.href} className="text-[13px] font-medium text-accent hover:text-accent-strong">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function Bot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[9px]">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-primary text-on-primary">
        <Icon name="sparkle" size={12} strokeWidth={2} />
      </span>
      <div className="text-[13px] leading-normal">{children}</div>
    </div>
  );
}

function FoldedLine({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-[10px] border border-line px-3 py-[9px] text-left text-xs text-ink-2 hover:bg-hover"
    >
      <span className="flex items-center gap-2">
        {dot && <span className="size-[7px] rounded-full bg-progress" />}
        {children}
      </span>
      <Icon name="chevronRight" size={13} strokeWidth={2} />
    </button>
  );
}

export function ChatMessages({ projectId }: { projectId: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-y-auto p-4">
      <FoldedLine>Steps 1–2 done ✓ · 14 messages</FoldedLine>
      <div className="flex flex-col gap-1.5 rounded-xl border border-line p-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="text-good">
            <Icon name="check" size={15} strokeWidth={2.4} />
          </span>
          Step 2 done: Login
        </div>
        <div className="text-xs text-ink-2">2 of 2 checks passed · used 1% of this month’s credits</div>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-[10px] bg-sunken px-3 py-[9px] text-xs">
        <span className="flex items-center gap-[7px]">
          <Icon name="clock" size={13} />
          <strong className="font-semibold">v11</strong> saved · Login added
        </span>
        <span className="flex shrink-0 gap-2.5 whitespace-nowrap">
          <Link href={`/p/${projectId}/versions`} className="font-medium text-accent">
            What changed
          </Link>
          <Link href={`/p/${projectId}/versions`} className="text-ink-2">
            Go back
          </Link>
        </span>
      </div>
      <Bot>Now building step 3: meal suggestions. I&apos;m testing the app&apos;s AI with a sample kitchen.</Bot>
      <FoldedLine dot>Writing the meal suggestions page… 6 actions</FoldedLine>
    </div>
  );
}

const modes = ["Ask", "Plan", "Build"] as const;

export function Composer({ placeholder = "Ask anything while it builds…" }: { placeholder?: string }) {
  const [mode, setMode] = useState<(typeof modes)[number]>("Build");
  const [text, setText] = useState("");
  return (
    <div className="shrink-0 border-t border-line px-3.5 pt-3 pb-3.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setText("");
        }}
        className="flex flex-col gap-2.5 rounded-[14px] border border-line-strong bg-panel p-3"
      >
        <textarea
          aria-label="Message"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="max-h-36 min-h-10 resize-none border-0 bg-transparent p-0 text-sm leading-[1.45] outline-none placeholder:text-ink-3"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Add files, photos or apps"
              className="flex size-[30px] items-center justify-center rounded-[9px] border border-line-strong bg-panel"
            >
              <Icon name="plus" size={15} strokeWidth={2} />
            </button>
            <div role="group" aria-label="Mode" className="flex gap-0.5 rounded-[10px] bg-sunken p-[3px]">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={`h-[30px] rounded-lg px-[9px] text-xs ${
                    mode === m ? "border border-line bg-raised font-semibold text-ink" : "text-ink-2"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Builder model: Auto"
              className="flex h-[30px] items-center gap-1 rounded-lg bg-accent-soft px-2 text-xs font-medium text-accent-strong"
            >
              <Icon name="sparkle" size={12} strokeWidth={2} />
              Auto
              <Icon name="chevronDown" size={11} strokeWidth={2} />
            </button>
          </div>
          <button
            type="submit"
            aria-label="Send"
            className="flex size-[30px] items-center justify-center rounded-[9px] bg-primary text-on-primary"
          >
            <Icon name="send" size={15} strokeWidth={2.2} />
          </button>
        </div>
      </form>
    </div>
  );
}

export const demoNeeds: NeedsItem[] = [];

export function PanelBody({ projectId, needs }: { projectId: string; needs: NeedsItem[] }) {
  return (
    <>
      <NeedsYou items={needs} />
      <ChatMessages projectId={projectId} />
      <Composer />
    </>
  );
}
