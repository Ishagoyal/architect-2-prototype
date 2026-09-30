"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { LET_AUTO_PICK, useAddOn, useExactModel } from "@/lib/addon";
import { UnlockButton } from "./UpgradeModal";

/** A row for something that comes with the paid Developer add-on (PRODUCT.md: "Free users see,
    paid users do"). Without the add-on it's locked, and hover, tap or focus says why.
    With it (Settings → Your plan → Try the Developer add-on), the row shows `unlocked` instead. */
export function AddOnTip({ label, className = "", unlocked }: { label: string; className?: string; unlocked?: React.ReactNode }) {
  const { addOn } = useAddOn();
  if (addOn && unlocked)
    return (
      <span className={`flex items-center justify-between gap-3 ${className}`}>
        <span>{label}</span>
        {unlocked}
      </span>
    );
  return (
    <span className={`group relative flex items-center justify-between gap-3 ${className}`}>
      <button type="button" aria-describedby="add-on-tip" className="peer flex items-center gap-2 text-left outline-none">
        <Icon name="lock" size={13} />
        {label}
      </button>
      <span className="flex items-center gap-2">
        <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">Developer add-on</span>
        <UnlockButton className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-on-primary" />
      </span>
      <span
        id="add-on-tip"
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 bottom-full z-50 mb-2 w-64 rounded-lg bg-ink px-3 py-2 text-xs leading-snug text-bg opacity-0 shadow-pop transition-opacity peer-hover:visible peer-hover:opacity-100 peer-focus:visible peer-focus:opacity-100"
      >
        This comes with the Developer add-on. Developer view shows more; the add-on lets you change it. Press Unlock to see what it adds.
      </span>
    </span>
  );
}

/** The exact model picker, once the add-on is on. Names are model families, as examples. */
export function ExactModelPicker() {
  // Shared with the Builder button, and remembered in this browser.
  const [model, setModel] = useExactModel();
  return (
    <select
      aria-label="Exact model"
      value={model}
      onChange={(e) => setModel(e.target.value)}
      className="h-8 rounded-lg border border-line-strong bg-raised px-2 text-[13px] text-ink"
    >
      {[LET_AUTO_PICK, "Claude Sonnet", "Claude Opus", "GPT", "Gemini Pro"].map((m) => (
        <option key={m}>{m}</option>
      ))}
    </select>
  );
}

/** A limit per project, once the add-on is on. */
export function ProjectLimitInput() {
  const [limit, setLimit] = useState("20");
  return (
    <span className="flex items-center gap-1 text-ink">
      <input
        aria-label="Limit per project, percent of monthly credits"
        inputMode="numeric"
        value={limit}
        onChange={(e) => setLimit(e.target.value.replace(/\D/g, "").slice(0, 3))}
        className="h-8 w-14 rounded-lg border border-line-strong bg-raised px-2 text-right text-sm"
      />
      % of credits
    </span>
  );
}

/** Exact models for the app's own AI (Developer add-on). Examples. */
export const agentModels = ["gpt-4.1-mini · OpenAI", "claude-haiku-4-5 · Anthropic", "gemini-2.5-flash · Google"];
