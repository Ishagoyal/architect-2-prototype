"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { DevOnly, DevTag } from "./DevTag";
import { useProjects } from "@/lib/projects";
import { useCreditsUsed } from "@/lib/credits";
import { createProject, detectAppType, instructionsFromIdea, isMealIdea, nameFromIdea, needsAI, suggestTarget, whatFromIdea } from "@/lib/model";

/* Design A5 (and A6 in Developer view). Shows what the planner understood; nothing is built yet. */

const themes = [
  { name: "Warm and friendly", colors: ["#FFF6EA", "#F4E3CC", "#C8643A", "#2E4A3B"] },
  { name: "Calm and clear", colors: ["#F4F7FB", "#DCE6F5", "#2A57C9", "#17171B"] },
  { name: "Bold and simple", colors: ["#FFFFFF", "#F2F2F2", "#17171B", "#E4572E"] },
];

function Filled() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-xs text-info">
      <Icon name="sparkle" size={10} strokeWidth={2} />
      AI-filled
    </span>
  );
}

const input = "w-full rounded-xl border border-line-strong bg-raised px-3.5 py-3 text-[15px] leading-normal outline-none focus:border-ink-3";

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`h-9 rounded-[9px] text-[13px] ${value === o ? "border border-line-strong bg-raised font-medium shadow-sm" : "text-ink"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Refine({ idea }: { idea: string }) {
  const router = useRouter();
  const { add } = useProjects();
  const credits = useCreditsUsed();
  const meal = isMealIdea(idea);
  const [name, setName] = useState(() => nameFromIdea(idea));
  const [what, setWhat] = useState(() => whatFromIdea(idea));
  const [target, setTarget] = useState("");
  const [instructions, setInstructions] = useState(() => instructionsFromIdea(idea));
  const [appType, setAppType] = useState(() => detectAppType(idea));
  const [withAI, setWithAI] = useState(() => needsAI(idea));
  const [model, setModel] = useState<"Faster & cheaper" | "Best quality">("Faster & cheaper");
  const [theme, setTheme] = useState(0);
  const [busy, setBusy] = useState(false);

  const confirm = () => {
    setBusy(true);
    const p = createProject({ idea, name, what, target, instructions, appType, theme, withAI });
    add(p);
    router.push(`/p/${p.id}/plan`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col px-4 pt-6 pb-32 md:px-10 md:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/home`} className="flex items-center gap-2 text-sm hover:text-ink-2">
          <Icon name="back" size={16} strokeWidth={2} />
          Back to prompt
        </Link>
        <ol aria-label="New project" className="hidden items-center gap-2.5 text-[13px] sm:flex">
          <li className="flex items-center gap-1.5 text-good">
            <Icon name="check" size={14} strokeWidth={2.4} />
            Describe
          </li>
          <li aria-hidden="true" className="h-px w-6 bg-line-strong" />
          <li aria-current="step" className="rounded-full bg-primary px-3 py-1.5 font-medium text-on-primary">
            Refine
          </li>
          <li aria-hidden="true" className="h-px w-6 bg-line-strong" />
          <li className="text-ink-2">Plan</li>
          <li aria-hidden="true" className="h-px w-6 bg-line-strong" />
          <li className="text-ink-2">Build</li>
        </ol>
      </div>

      <h1 className="mt-6 font-serif text-[40px] leading-[1.05] md:mt-8 md:text-[48px]">Here&apos;s what we understood</h1>
      <p className="mt-2 text-[15px] text-ink-2 md:text-[17px]">Check the details and change anything. Every field is optional.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-7">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-sunken p-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs tracking-[0.06em] text-ink-2 uppercase">You said</span>
              <p className="text-[15px] leading-relaxed">{idea}</p>
            </div>
            <Link href={`/home?idea=${encodeURIComponent(idea)}`} className="shrink-0 text-[13px] font-medium text-accent">
              Edit prompt
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-5 md:p-7">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="r-name" className="text-sm font-medium">
                  Project name
                </label>
                <Filled />
              </div>
              <input id="r-name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="r-what" className="text-sm font-medium">
                  What should it do?
                </label>
                <Filled />
              </div>
              <textarea id="r-what" rows={3} value={what} onChange={(e) => setWhat(e.target.value)} className={`${input} resize-none`} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="r-target" className="text-sm font-medium">
                  Target user <span className="font-normal text-ink-2">· optional</span>
                </label>
                {!target && <span className="text-xs text-ink-2">Not in your prompt</span>}
              </div>
              <textarea
                id="r-target"
                rows={2}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={`e.g. ${suggestTarget(idea)}`}
                className={`${input} resize-none ${target ? "" : "border-dashed bg-sunken placeholder:text-ink-3"}`}
              />
              {!target && (
                <button type="button" onClick={() => setTarget(suggestTarget(idea))} className="flex items-center gap-1.5 self-start text-[13px] text-accent">
                  <Icon name="sparkle" size={12} strokeWidth={2} />
                  Suggest for me
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="r-inst" className="text-sm font-medium">
                  Description / instructions
                </label>
                {instructions && meal && <Filled />}
              </div>
              <textarea
                id="r-inst"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Anything it should always or never do"
                className={`${input} resize-none placeholder:text-ink-3`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">App type</span>
              <span className="text-xs text-ink-2">Detected from your prompt</span>
            </div>
            <Segmented label="App type" value={appType} options={["Website", "Phone app"]} onChange={setAppType} />
          </div>

          {withAI ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-accent-line bg-needs p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
                  <Icon name="agent" size={16} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">Your app uses an AI model</span>
                  <span className="text-[13px] text-ink-2">{meal ? "For suggesting three meals from what’s in the kitchen" : `For the main task: ${what.replace(/\.$/, "").toLowerCase()}`}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-accent-line pt-3">
                <div className="flex items-center justify-between text-xs tracking-[0.04em] text-ink-2 uppercase">
                  Agent
                  <Link href="/agents" className="text-[13px] tracking-normal text-accent normal-case">
                    Use one of my agents
                  </Link>
                </div>
                <span className="flex items-center gap-2 text-[15px]">
                  New agent <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-strong">Auto</span>
                </span>
              </div>

              <div className="flex flex-col gap-2 border-t border-accent-line pt-3 dev:hidden">
                <div className="flex items-center justify-between text-xs tracking-[0.04em] text-ink-2 uppercase">
                  Model
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] tracking-normal text-accent-strong normal-case">Auto</span>
                </div>
                <Segmented label="Model" value={model} options={["Faster & cheaper", "Best quality"]} onChange={setModel} />
                <span className="text-xs text-ink-2">Best quality costs more each time someone uses your app.</span>
              </div>

              <DevOnly>
                <div className="flex flex-col gap-2 border-t border-accent-line pt-3">
                  <div className="flex items-center justify-between text-xs tracking-[0.04em] text-ink-2 uppercase">
                    <label htmlFor="r-fw">Framework</label>
                    <DevTag />
                  </div>
                  <select id="r-fw" className={`${input} py-2.5`}>
                    <option>Lyzr (recommended)</option>
                    <option>LangGraph</option>
                    <option>CrewAI</option>
                    <option>OpenAI Agents SDK</option>
                    <option>Vercel AI SDK</option>
                  </select>
                  <span className="text-xs text-ink-2">The agent is saved as files in your code, in the framework you pick.</span>
                </div>
                <div className="flex flex-col gap-2 border-t border-accent-line pt-3">
                  <div className="flex items-center justify-between text-xs tracking-[0.04em] text-ink-2 uppercase">
                    <label htmlFor="r-model">Model</label>
                    <DevTag />
                  </div>
                  <select id="r-model" className={`${input} py-2.5`}>
                    <option>gpt-4.1-mini · OpenAI</option>
                    <option>claude-haiku-4-5 · Anthropic</option>
                    <option>gemini-2.5-flash · Google</option>
                  </select>
                  <span className="text-xs text-ink-2">Picking an exact model is part of the Developer add-on.</span>
                </div>
              </DevOnly>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel p-5">
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">No AI model needed</span>
                <span className="text-[13px] text-ink-2">Nothing in your prompt needs one.</span>
              </span>
              <button type="button" onClick={() => setWithAI(true)} className="h-9 shrink-0 rounded-[10px] border border-line-strong px-3 text-[13px]">
                Add one
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Theme</span>
              <button type="button" onClick={() => setTheme((t) => (t + 1) % themes.length)} className="text-[13px] text-accent">
                Change
              </button>
            </div>
            <div className="flex items-center gap-2">
              {themes[theme].colors.map((c) => (
                <span key={c} className="size-6 rounded-full border border-line" style={{ background: c }} />
              ))}
              <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-strong">Auto</span>
              <span className="text-[15px]">{themes[theme].name}</span>
            </div>
            <span className="text-[13px] text-ink-2">
              {meal ? "Your users are households cooking together." : target ? `Your users: ${target.replace(/\.$/, "").toLowerCase()}.` : "Picked from what you described."}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Cost</span>
              <span className={`text-[13px] ${credits >= 70 ? "text-accent" : "text-good"}`}>
                {credits >= 70 ? "Running low" : "On track"} · {credits}% used
              </span>
            </div>
            <span className="text-[13px] text-ink-2">Shown after each step, as a share of this month’s credits.</span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-14 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:static md:mt-10 md:border-t md:bg-transparent md:px-0 md:pt-6 md:backdrop-blur-none">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/home?idea=${encodeURIComponent(idea)}`} className="hidden h-12 items-center rounded-xl border border-line-strong bg-panel px-5 text-[15px] md:flex">
            Back to prompt
          </Link>
          <span className="flex flex-1 items-center justify-end gap-4">
            <span className="hidden text-[13px] text-ink-2 sm:inline">Nothing is built until you approve the plan.</span>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-medium text-on-primary disabled:opacity-70 sm:w-auto"
            >
              Confirm and see the plan
              <Icon name="back" size={16} strokeWidth={2} className="rotate-180" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
