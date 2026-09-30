"use client";

import { Icon } from "./Icon";

/* "Connect apps" in the + menus: pick the apps your app should use. Each pick shows as a chip
   on the message. Prototype: nothing connects to real accounts. */

export const connectableApps: { name: string; does: string }[] = [
  { name: "Gmail", does: "Read and send email" },
  { name: "Slack", does: "Post and read messages" },
  { name: "Google Sheets", does: "Read and update spreadsheets" },
  { name: "Google Calendar", does: "See and add events" },
  { name: "Google Drive", does: "Read your files" },
  { name: "Notion", does: "Read and write pages" },
  { name: "HubSpot", does: "Contacts and deals" },
  { name: "WhatsApp", does: "Send messages" },
];

export function ConnectAppsList({
  selected,
  onToggle,
  onBack,
  onDone,
}: {
  selected: string[];
  onToggle: (name: string) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-1 pt-1 pb-2">
        <button type="button" aria-label="Back" onClick={onBack} className="flex size-8 items-center justify-center rounded-lg hover:bg-hover">
          <Icon name="back" size={15} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold">Connect apps</span>
      </div>
      <div role="group" aria-label="Apps" className="flex max-h-[300px] flex-col overflow-y-auto">
        {connectableApps.map((a) => {
          const on = selected.includes(a.name);
          return (
            <button
              key={a.name}
              type="button"
              role="menuitemcheckbox"
              aria-checked={on}
              onClick={() => onToggle(a.name)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hover"
            >
              <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border ${on ? "border-primary bg-primary text-on-primary" : "border-line-strong"}`}>
                {on && <Icon name="check" size={12} strokeWidth={2.6} />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm">{a.name}</span>
                <span className="text-xs text-ink-2">{a.does}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-line px-1.5 pt-2">
        <span className="text-xs text-ink-2">Prototype: nothing connects to your real accounts.</span>
        <button type="button" onClick={onDone} className="h-8 shrink-0 rounded-lg bg-primary px-3 text-[13px] font-medium text-on-primary">
          Done
        </button>
      </div>
    </div>
  );
}
