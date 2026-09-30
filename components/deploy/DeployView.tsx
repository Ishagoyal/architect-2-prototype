"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../Icon";
import { Modal, btnOutline, btnPrimary } from "../Modal";
import { DEPLOY_STEP_MS, DEPLOY_STEPS, planTotals, rollBackLive, startDeploy, timeAgo, uid, type Project } from "@/lib/model";

/* Designs E1–E4: going live. It only says Live once the live link works;
   if it doesn't, the previous version stays live. */

type Update = (fn: (p: Project) => Project) => void;

const card = "flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5";
const input = "w-full rounded-[10px] border border-line-strong bg-raised px-3 py-2.5 text-sm outline-none focus:border-ink-3";

function address(p: Project) {
  return `${p.id.replace(/-[a-z0-9]{4}$/, "")}.architect.space`;
}

function Steps({ p, now, failed = false }: { p: Project; now: number; failed?: boolean }) {
  const t = planTotals(p.plan);
  const labels = [`Running all ${t.checks} checks`, "Setting live keys", "Updating the app’s data", `Publishing${p.deploy?.liveVersion ? ` version ${p.deploy?.target}` : ""}`, "Checking the live link", "Live"];
  const d = p.deploy;
  const at = d?.status === "deploying" ? Math.floor((now - d.since) / DEPLOY_STEP_MS) : d?.status === "failed" ? 4 : -1;
  return (
    <ol className="flex flex-col gap-3">
      {labels.slice(0, failed ? 5 : DEPLOY_STEPS).map((l, i) => {
        const state = failed && i === 4 ? "failed" : i < at || (d?.status === "live" && d.target === d.liveVersion) ? "done" : i === at && d?.status === "deploying" ? "now" : "todo";
        return (
          <li key={l} className="flex items-center gap-3 text-[15px]">
            <span
              className={`flex size-[22px] shrink-0 items-center justify-center rounded-full ${
                state === "done" ? "bg-good-soft text-good" : state === "failed" ? "bg-bad-soft text-bad" : state === "now" ? "border-2 border-progress" : "border border-line-strong"
              }`}
            >
              {state === "done" && <Icon name="check" size={12} strokeWidth={2.6} />}
              {state === "failed" && <Icon name="close" size={11} strokeWidth={2.6} />}
              {state === "now" && <span className="size-2 animate-pulse rounded-full bg-progress" />}
            </span>
            <span className={state === "todo" ? "text-ink-2" : ""}>{l}</span>
          </li>
        );
      })}
    </ol>
  );
}

function KeyModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [key, setKey] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add the Live OpenAI key"
      actions={
        <>
          <button type="button" onClick={onClose} className={btnOutline}>
            Cancel
          </button>
          <button type="button" data-tour="deploy-key-save" disabled={key.trim().length < 8} onClick={onSave} className={btnPrimary}>
            Save key
          </button>
        </>
      }
    >
      <p>Your live app uses this key. The preview keeps using the Preview key.</p>
      <input type="password" data-tour="deploy-key-input" aria-label="Live OpenAI key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-…" className={input} />
      <p className="text-[13px]">For security, saved keys can’t be shown again. To change one, replace it. (This is a demo: anything you type is thrown away.)</p>
    </Modal>
  );
}

export function DeployView({ project: p, update, now }: { project: Project; update: Update; now: number }) {
  const [title, setTitle] = useState(`${p.name} · ${p.plan.tagline}`);
  const [description, setDescription] = useState(p.plan.what);
  const [checkFirst, setCheckFirst] = useState(false);
  const [testAI, setTestAI] = useState(!!p.plan.ai);
  const [keyOpen, setKeyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const d = p.deploy;
  const latest = p.versions[0].n;
  const built = p.stepsDone > 0 && (p.build.status === "done" || !!d?.liveVersion);
  const deploy = () => update((q) => startDeploy(q));
  const addKey = () => {
    update((q) => ({
      ...q,
      deploy: q.deploy ? { ...q.deploy, liveKey: true } : q.deploy,
      plan: { ...q.plan, keys: q.plan.keys.map((k) => (k[0] === "OpenAI" ? [k[0], k[1], "Preview ✓ · Live ✓"] : k)) },
      chat: [...q.chat, { id: uid(), type: "ai", text: "Live OpenAI key added. It can’t be shown again. Try going live again." }],
    }));
    setKeyOpen(false);
  };

  const bar = (icon: "check" | "explore", strong: string, rest: string, action?: React.ReactNode) => (
    <div data-scene="deploy-bar" className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={icon === "check" ? "text-good" : "text-ink-2"}>
          <Icon name={icon} size={15} strokeWidth={icon === "check" ? 2.4 : 1.8} />
        </span>
        <strong className="font-semibold">{strong}</strong>
        <span className="text-ink-2">{rest}</span>
      </span>
      {action}
    </div>
  );

  if (!built && d?.status !== "deploying") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sunken text-ink-2">
          <Icon name="explore" size={22} />
        </span>
        <h1 className="text-xl font-semibold">Build your app first</h1>
        <p className="max-w-sm text-sm text-ink-2">
          {p.build.status === "running" ? "It’s building now. Once every step is built and checked, you can put it live here." : "Once every step is built and checked, you can put it live here."}
        </p>
        <Link href={`/p/${p.id}/${p.stage === "plan" ? "plan" : "app"}`} className={`${btnPrimary} mt-2`}>
          {p.stage === "plan" ? "Open the plan" : "See the build"}
        </Link>
      </div>
    );
  }

  /* E3: the live check failed */
  if (d?.status === "failed") {
    return (
      <>
        {d.liveVersion
          ? bar("check", `Your app is still live on version ${d.liveVersion}`, `version ${d.failedVersion} didn’t load, so nobody saw it`)
          : bar("explore", "Your app isn’t live yet", `version ${d.failedVersion} didn’t load, so nobody saw it`)}
        <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className="text-lg font-semibold">Going live with version {d.failedVersion}</h2>
            <Steps p={p} now={now} failed />
            <p className="rounded-xl bg-bad-soft px-3 py-3 text-sm text-bad">
              The live page showed an error: {p.kind === "meal" ? "the meal list" : "the main screen"} couldn’t load because the Live key for OpenAI is missing.
            </p>
          </div>
          <div data-scene="what-to-do" className={`${card} self-start`}>
            <h2 className="text-lg font-semibold">What to do</h2>
            <p className="text-sm text-ink-2">
              {d.liveKey ? "The Live key is added. Try again." : "Add the Live OpenAI key, then try again. Preview worked because it uses the Preview key."}
            </p>
            <div className="flex gap-2">
              {!d.liveKey && (
                <button type="button" data-tour="deploy-key" onClick={() => setKeyOpen(true)} className={btnPrimary}>
                  Add the Live key
                </button>
              )}
              <button type="button" data-tour="deploy-retry" onClick={deploy} className={d.liveKey ? btnPrimary : btnOutline}>
                Try again
              </button>
            </div>
            <p className="border-t border-line pt-3 text-xs text-ink-2">
              {d.liveVersion ? `Version ${d.liveVersion} stayed live the whole time. No one using the app saw a broken page.` : "Nothing went live, so no one saw a broken page."}
            </p>
          </div>
        </div>
        <KeyModal open={keyOpen} onClose={() => setKeyOpen(false)} onSave={addKey} />
      </>
    );
  }

  /* E2 / E4: live */
  if (d?.status === "live" && d.liveVersion) {
    const pending = p.versions.filter((v) => v.n > d.liveVersion! && v.badge !== "stopped");
    if (pending.length > 0) {
      return (
        <>
          {bar("check", `Live on version ${d.liveVersion}`, `${pending.length} change${pending.length > 1 ? "s" : ""} since then aren’t live yet`)}
          <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className={card}>
              <h2 className="text-lg font-semibold">Not live yet</h2>
              <p className="text-sm text-ink-2">People using your app still see version {d.liveVersion}.</p>
              <ul className="flex flex-col">
                {pending.map((v) => (
                  <li key={v.n} className="flex items-center justify-between gap-3 border-t border-line py-3">
                    <span className="flex flex-col">
                      <span className="text-sm">
                        <span className="text-ink-2">v{v.n} ·</span> {v.title}
                      </span>
                      <span className="text-xs text-ink-2">{timeAgo(v.at, now)} · all checks passed</span>
                    </span>
                    <Link href={`/p/${p.id}/versions?v=${v.n}`} className="shrink-0 text-[13px] text-accent">
                      What changed
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={deploy} disabled={p.build.status === "running"} className={`${btnPrimary} self-end`}>
                {p.build.status === "running" ? "Wait for the build to finish" : "Deploy latest changes"}
              </button>
            </div>
            <div className={`${card} self-start`}>
              <h2 className="text-lg font-semibold">Before it goes live</h2>
              <p className="text-sm leading-relaxed text-ink-2">
                All {planTotals(p.plan).checks} checks run again, the Live keys are set, and I open the live link. If it doesn’t load, version {d.liveVersion} stays live.
              </p>
            </div>
          </div>
        </>
      );
    }
    const url = address(p);
    return (
      <>
        {bar(
          "check",
          `${p.name} is live`,
          "checked the live link · loads in 1.2 s",
          <a href={`https://${url}`} onClick={(e) => e.preventDefault()} className={`${btnOutline} h-8 gap-1.5`} title="In this demo the address isn’t real">
            <Icon name="explore" size={14} />
            Open app
          </a>,
        )}
        <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className={card}>
              <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Web address</span>
              <span className="flex items-center justify-between rounded-[10px] bg-sunken px-3 py-2.5 font-mono text-[13px]">
                {url}
                <button type="button" className="font-sans text-[13px] text-accent">
                  Edit
                </button>
              </span>
              <button type="button" className="self-start text-[13px] text-accent">
                + Use your own domain
              </button>
              <span className="text-sm font-semibold">Share</span>
              <div className="flex flex-wrap gap-2">
                {["WhatsApp", "LinkedIn", "X"].map((s) => (
                  <button key={s} type="button" className={`${btnOutline} h-9`}>
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://${url}`).catch(() => {});
                    setCopied(true);
                  }}
                  className={`${btnOutline} h-9`}
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
            </div>
            <div className={card}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Lyzr app store</span>
                <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] text-ink-2">Not listed</span>
              </div>
              <p className="text-sm text-ink-2">Title, description and picture are ready from your plan.</p>
              <button type="button" className={`${btnOutline} justify-start`}>
                Review and publish
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className={card}>
              <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Deploys</span>
              {d.history.map((h) => (
                <div key={`${h.n}-${h.at}`} className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="flex flex-col">
                    <span className="text-sm">
                      <span className="text-ink-2">v{h.n} ·</span> {h.title}
                    </span>
                    <span className="text-xs text-ink-2">{h.n === d.liveVersion ? `Live now · checked ${timeAgo(h.at, now)}` : `Live ${timeAgo(h.at, now)}`}</span>
                  </span>
                  {h.n === d.liveVersion ? (
                    <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] text-good">Live</span>
                  ) : (
                    <button type="button" onClick={() => update((q) => rollBackLive(q, h.n))} className={`${btnOutline} h-9`}>
                      Go back to this
                    </button>
                  )}
                </div>
              ))}
            </div>
            {p.plan.ai && (
              <div className={card}>
                <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">Your app’s AI</span>
                <p className="text-sm text-ink-2">
                  People using the app go through Architect, not your key. Monthly budget for this app: 20% of your credits · each person 20 {p.kind === "meal" ? "suggestions" : "uses"} a
                  day.
                </p>
                <Link href={`/p/${p.id}/settings?tab=ai`} className="text-[13px] text-accent">
                  Change limits
                </Link>
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                update((q) => ({
                  ...q,
                  stage: "test",
                  deploy: q.deploy ? { ...q.deploy, status: "offline", liveVersion: null } : q.deploy,
                  versions: q.versions.map((x) => ({ ...x, badge: x.badge === "live" ? undefined : x.badge })),
                  chat: [...q.chat, { id: uid(), type: "ai", text: `${q.name} is offline. Nothing is lost; deploy again any time.` }],
                }))
              }
              className="self-center text-[13px] text-bad"
            >
              Take the app offline
            </button>
          </div>
        </div>
      </>
    );
  }

  /* E1: before and while going live */
  const deploying = d?.status === "deploying";
  return (
    <>
      {bar("explore", "Going live", address(p))}
      <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className={card}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">How your app appears</h2>
              <span className="text-xs text-ink-2">From your plan · edit anything</span>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} disabled={deploying} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${input} resize-none`} disabled={deploying} />
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-line p-2.5">
              <span className="flex h-12 w-[88px] shrink-0 items-center justify-center rounded-lg border border-[#F0DDD0] bg-[#FFF6EA] px-1 text-center font-serif text-[13px] text-[#7A3A12]">
                {p.template.heading}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Share preview</span>
                <span className="text-xs text-ink-2">What people see when you send the link on WhatsApp</span>
              </span>
            </div>
          </div>
          <div className={card}>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={checkFirst} onChange={(e) => setCheckFirst(e.target.checked)} disabled={deploying} className="mt-1 accent-[var(--accent)]" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Check the live version first</span>
                <span className="text-[13px] text-ink-2">Opens a private link to the real live app before anyone else sees it</span>
              </span>
            </label>
            {p.plan.ai && (
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={testAI} onChange={(e) => setTestAI(e.target.checked)} disabled={deploying} className="mt-1 accent-[var(--accent)]" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">Test the app’s AI too</span>
                  <span className="text-[13px] text-ink-2">Asks the {p.plan.ai.name.toLowerCase()} 5 real questions · about 1% of this month’s credits</span>
                </span>
              </label>
            )}
          </div>
        </div>
        <div className={`${card} self-start`}>
          <h2 className="text-lg font-semibold">Progress</h2>
          <Steps p={p} now={now} />
          <p className="border-t border-line pt-3 text-xs text-ink-2">It only says Live once the live link works. If it doesn’t, your previous version stays live.</p>
          {!deploying && (
            <button type="button" data-tour="deploy-go" onClick={deploy} className={btnPrimary}>
              Go live
            </button>
          )}
        </div>
      </div>
    </>
  );
}
