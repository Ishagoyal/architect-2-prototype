"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon, type IconName } from "../Icon";
import { Modal, btnOutline, btnPrimary } from "../Modal";
import { useDismiss } from "../useDismiss";
import { useProjectUI } from "../project/ProjectUI";
import { send } from "@/lib/chat";
import { continueBuild, lowerFirst, planTotals, startBuild, stopBuild, STEP_MS, type Project, type Step } from "@/lib/model";
import { usePrefs } from "@/lib/prefs";

/* Designs A11, A13, A18: the App tab. While it builds, it shows each step's result, not a spinner.
   The user's app keeps its own colours. It follows dark mode only if the app has a dark version
   (the meal app does; apps people describe themselves don't, yet). */

type Update = (fn: (p: Project) => Project) => void;

type Palette = { bg: string; card: string; border: string; eyebrow: string; heading: string; text: string; sub: string; meta: string; button: string; onButton: string };

const warm: Palette = { bg: "#FFF6EA", card: "#FFFFFF", border: "#F0DDD0", eyebrow: "#B4470F", heading: "#2A1A10", text: "#17171B", sub: "#55555E", meta: "#1F6F4A", button: "#C8643A", onButton: "#FFFFFF" };
const warmDark: Palette = { bg: "#221B16", card: "#2C241E", border: "#3A2F27", eyebrow: "#E3A07A", heading: "#F3E6D8", text: "#EDE6DD", sub: "#B5A999", meta: "#8CC5A2", button: "#C8643A", onButton: "#FFFFFF" };
const calm: Palette = { bg: "#F4F7FB", card: "#FFFFFF", border: "#DCE6F5", eyebrow: "#2A57C9", heading: "#0F1B33", text: "#17171B", sub: "#55555E", meta: "#1F6F4A", button: "#2A57C9", onButton: "#FFFFFF" };
const bold: Palette = { bg: "#FFFFFF", card: "#F7F7F7", border: "#E6E6E6", eyebrow: "#E4572E", heading: "#17171B", text: "#17171B", sub: "#55555E", meta: "#1F6F4A", button: "#17171B", onButton: "#FFFFFF" };

function paletteFor(p: Project, dark: boolean): Palette {
  if (p.kind === "meal") return dark ? warmDark : warm;
  return [warm, calm, bold][p.theme % 3];
}

/* ---------- What the app shows at this point of the build ---------- */

function progress(p: Project, now: number) {
  const running = p.build.status === "running";
  const cur = running ? p.plan.steps[p.build.step] : undefined;
  const frac = running ? Math.min(1, (now - p.build.since) / STEP_MS) : 0;
  const doneKind = (k: Step["kind"]) => p.plan.steps.some((s, i) => s.kind === k && i < p.stepsDone);
  const aiIndex = p.plan.steps.findIndex((s) => s.kind === "ai");
  const itemsVisible =
    !!p.imported || (aiIndex >= 0 ? p.stepsDone > aiIndex || (cur?.kind === "ai" && frac > 0.3) : p.stepsDone >= 1);
  const buttonVisible = !!p.imported || doneKind("screens") || (cur?.kind === "screens" && frac > 0.5);
  return { running, cur, frac, itemsVisible, buttonVisible };
}

function writingLine(p: Project, step: Step) {
  switch (step.kind) {
    case "data":
      return `where your app keeps ${p.plan.saves.map((s) => s[0].toLowerCase()).slice(0, 3).join(", ")}`;
    case "login":
      return "the sign-in page";
    case "ai":
      return p.kind === "meal" ? "the meal suggestions" : "the app’s AI answers";
    case "feature":
      return lowerFirst(step.title);
    case "screens":
      return `“${p.template.action}” button`;
  }
}

function ResultBanner({ p, now }: { p: Project; now: number }) {
  const { cur, frac } = progress(p, now);
  const [typed, setTyped] = useState("");
  const [tried, setTried] = useState<string | null>(null);
  let step: Step | undefined;
  let n = 0;
  if (cur?.kind === "ai" && frac > 0.3) {
    step = cur;
    n = p.build.step + 1;
  } else if (p.stepsDone > 0 && p.build.status !== "done") {
    n = p.stepsDone;
    step = p.plan.steps[n - 1];
  }
  if (!step || step.kind === "screens") return null;

  let title = "";
  let body: React.ReactNode = null;
  if (step.kind === "data") {
    title = `Step ${n} result: your app can now save ${p.plan.saves.map((s) => s[0].toLowerCase()).slice(0, 3).join(", ")}`;
    body = (
      <span className="flex flex-wrap gap-x-4 gap-y-0.5">
        {p.plan.saves.slice(0, 3).map(([a, b]) => (
          <span key={a}>
            {a}: <em className="not-italic opacity-80">{b}</em>
          </span>
        ))}
      </span>
    );
  } else if (step.kind === "login") {
    title = `Step ${n} result: sign-in works. Try it`;
    body = (
      <form
        className="mt-1 flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTried("Sent a sign-in link to the test inbox ✓");
        }}
      >
        <input aria-label="Test email" defaultValue="test.user@example.com" className="h-9 flex-1 rounded-lg border border-info/30 bg-panel px-2.5 text-[13px] text-ink" />
        <button className="h-9 rounded-lg bg-info px-3 text-[13px] font-medium text-white dark:text-on-primary">Sign in</button>
      </form>
    );
  } else if (step.kind === "ai") {
    title = `Step ${n} result: your app's AI is answering`;
    body = <span>We asked it: &quot;{p.template.aiTest}&quot;</span>;
  } else {
    const example = p.kind === "meal" ? "2 kg atta aaya" : `A new ${p.template.entity.toLowerCase().replace(/s$/, "")}`;
    title = `Step ${n} result: ${lowerFirst(step.title)} works. Try it`;
    body = (
      <form
        className="mt-1 flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTried(p.kind === "meal" ? `Added: ${typed || example} ✓` : `Added “${typed || example}” ✓`);
        }}
      >
        <input
          aria-label="Try it"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={`Type “${example}”`}
          className="h-9 flex-1 rounded-lg border border-info/30 bg-panel px-2.5 text-[13px] text-ink placeholder:text-ink-3"
        />
        <button className="h-9 rounded-lg bg-info px-3 text-[13px] font-medium text-white dark:text-on-primary">Try</button>
      </form>
    );
  }
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-info-soft px-4 py-3.5 text-[13px] text-info">
      <span className="font-semibold">{title}</span>
      {body}
      {tried && <span className="font-medium text-good">{tried}</span>}
    </div>
  );
}

/* ---------- The user's app ---------- */

type Sel = { on: boolean; picked: number | null; pick: (i: number | null) => void };

function AppScreen({ p, now, page, device, dark, sel, testUser }: { p: Project; now: number; page: number; device: "desktop" | "phone"; dark: boolean; sel: Sel; testUser: boolean }) {
  const c = paletteFor(p, dark);
  const { running, cur, itemsVisible, buttonVisible } = progress(p, now);
  const building = running || p.build.status === "stopped" || p.build.status === "waiting";
  const next = building ? p.plan.steps[p.build.step + 1] : undefined;
  const phone = device === "phone";
  const screen = p.plan.screens[page] ?? p.plan.screens[0];
  const [edits, setEdits] = useState<Record<number, string>>({});

  const eyebrow = page === 0 ? p.template.eyebrow : screen.title.toUpperCase();
  const heading = page === 0 ? p.template.heading : screen.label;
  const items =
    page === 0
      ? p.template.items
      : p.plan.saves.map(([a, b]) => ({ title: b, sub: a, meta: "Example data" }));

  return (
    <div
      className={`flex flex-col gap-3.5 ${phone ? "min-h-full p-4 pt-6" : "min-h-full rounded-[14px] border p-5 md:p-[22px]"}`}
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {testUser && (
        <span className="self-start rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: c.card, border: `1px solid ${c.border}`, color: c.sub }}>
          Signed in as a test user · sample data
        </span>
      )}
      <span className="text-xs font-semibold tracking-[0.08em]" style={{ color: c.eyebrow }}>
        {eyebrow}
      </span>
      <span className={`font-serif leading-none ${phone ? "text-[30px]" : "text-[40px]"}`} style={{ color: c.heading }}>
        {heading}
      </span>
      {itemsVisible || page > 0 ? (
        <div className={`grid gap-3 ${phone ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
          {items.map((m, i) => {
            const picked = sel.on && sel.picked === i;
            return (
              <div
                key={m.title}
                onClick={sel.on ? () => sel.pick(i) : undefined}
                className={`relative flex flex-col gap-1 rounded-[10px] border p-3 ${sel.on ? "cursor-pointer hover:outline-2 hover:outline-dev/50" : ""} ${picked ? "outline-2 outline-offset-2 outline-dev" : ""}`}
                style={{ background: c.card, borderColor: c.border }}
              >
                <span
                  className="text-sm font-semibold outline-none"
                  contentEditable={sel.on && picked}
                  suppressContentEditableWarning
                  onBlur={(e) => setEdits((x) => ({ ...x, [i]: e.currentTarget.textContent ?? m.title }))}
                >
                  {edits[i] ?? m.title}
                </span>
                <span className="text-xs" style={{ color: c.sub }}>
                  {m.sub}
                </span>
                <span className="text-[11px] font-medium" style={{ color: c.meta }}>
                  {m.meta}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`grid gap-3 ${phone ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-[74px] rounded-[10px] border border-dashed" style={{ borderColor: c.border }} />
          ))}
        </div>
      )}
      {buttonVisible && page === 0 && (
        <span className="self-start rounded-[10px] px-4 py-2.5 text-sm font-medium" style={{ background: c.button, color: c.onButton }}>
          {p.template.action}
        </span>
      )}
      {building && cur && (
        <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed p-3.5" style={{ borderColor: "#F2A36B", background: dark && p.kind === "meal" ? "#2A2019" : "#FFFBF6" }}>
          <span className="text-[13px] font-medium" style={{ color: dark && p.kind === "meal" ? "#E3A07A" : "#8A3409" }}>
            Writing this now: {writingLine(p, cur)}
          </span>
          <span className="rounded-full px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap" style={{ background: "#FBEDE4", color: "#8A3409" }}>
            in progress
          </span>
        </div>
      )}
      {p.build.status === "stopped" && (
        <div className="rounded-xl border-2 border-dashed p-3.5 text-[13px]" style={{ borderColor: c.border, color: c.sub }}>
          Stopped here: {lowerFirst(p.plan.steps[p.build.step].title)} (step {p.build.step + 1})
        </div>
      )}
      {next && (
        <div className="rounded-xl border border-dashed p-3.5 text-[13px]" style={{ borderColor: c.border, color: c.sub }}>
          Coming next: {next.title} (step {p.build.step + 2})
        </div>
      )}
    </div>
  );
}

/* ---------- Toolbar ---------- */

function PageMenu({ p, page, setPage }: { p: Project; page: number; setPage: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Which page of your app you’re looking at. Pick another page to see it."
        className="flex h-[30px] items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 text-ink"
      >
        Page: <strong className="font-semibold">{p.plan.screens[page]?.title}</strong>
        <Icon name="chevronDown" size={12} strokeWidth={2} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full left-0 z-40 mt-1.5 w-48 rounded-xl border border-line bg-panel p-1.5 shadow-pop">
          {p.plan.screens.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="menuitemradio"
              aria-checked={page === i}
              onClick={() => {
                setPage(i);
                close();
              }}
              className={`flex w-full justify-between rounded-lg px-2.5 py-2 text-left text-[13px] ${page === i ? "bg-sunken font-medium" : "hover:bg-hover"}`}
            >
              {s.title}
              <span className="text-xs text-ink-2">{s.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MoreMenu({ p, look, setLook, restart }: { p: Project; look: "auto" | "light" | "dark"; setLook: (l: "auto" | "light" | "dark") => void; restart: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const row = "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-hover";
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="More preview options" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-[30px] items-center rounded-lg px-2 hover:text-ink">
        <Icon name="more" size={16} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-40 mt-1.5 w-64 rounded-xl border border-line bg-panel p-1.5 text-ink shadow-pop">
          <span className="block px-2.5 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">See it in</span>
          {(["auto", "light", "dark"] as const).map((l) => (
            <button key={l} type="button" role="menuitemradio" aria-checked={look === l} onClick={() => setLook(l)} className={row}>
              {l === "auto" ? "Match this device" : l === "light" ? "Light" : "Dark"}
              {look === l && <Icon name="check" size={14} strokeWidth={2.4} />}
            </button>
          ))}
          {p.kind !== "meal" && <p className="px-2.5 pb-1 text-xs text-ink-2">This app has no dark mode yet, so it stays light.</p>}
          <div className="my-1 h-px bg-line" />
          <button type="button" className={row} onClick={close}>
            Open in new tab
          </button>
          <button
            type="button"
            className={row}
            onClick={() => {
              restart();
              close();
            }}
          >
            Restart app
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- The tab ---------- */

export function AppView({ project: p, update, now }: { project: Project; update: Update; now: number }) {
  const { resolvedTheme } = usePrefs();
  const { openPanel } = useProjectUI();
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [select, setSelect] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [change, setChange] = useState("");
  const [testUser, setTestUser] = useState(false);
  const [page, setPage] = useState(0);
  const [look, setLook] = useState<"auto" | "light" | "dark">("auto");
  const [stopping, setStopping] = useState(false);
  const [restarted, setRestarted] = useState(0);

  const base = `/p/${p.id}`;
  const total = p.plan.steps.length;
  const t = planTotals(p.plan);
  const dark = look === "dark" || (look === "auto" && resolvedTheme === "dark");

  if (p.stage === "plan" && p.build.status === "idle" && !p.imported) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sunken text-ink-2">
          <Icon name="app" size={22} />
        </span>
        <h1 className="text-xl font-semibold">Nothing built yet</h1>
        <p className="max-w-sm text-sm text-ink-2">See the mockup in Plan. Your app shows up here, step by step, once you confirm the plan.</p>
        <Link href={`${base}/plan`} className={`${btnPrimary} mt-2`}>
          Open the plan
        </Link>
      </div>
    );
  }

  const tools: { key: string; label: string; icon: IconName; tip: string; on: boolean; onClick: () => void }[] = [
    { key: "desktop", label: "Desktop", icon: "desktop", tip: "See your app at computer size", on: device === "desktop", onClick: () => setDevice("desktop") },
    { key: "phone", label: "Phone", icon: "phone", tip: "See your app at phone size", on: device === "phone", onClick: () => setDevice("phone") },
    {
      key: "select",
      label: "Select",
      icon: "select",
      tip: "Click any part of your app to change it",
      on: select,
      onClick: () => {
        setSelect((s) => !s);
        setPicked(null);
      },
    },
    { key: "user", label: "Try as a user", icon: "user", tip: "Open your app signed in as a test user, with sample data", on: testUser, onClick: () => setTestUser((x) => !x) },
  ];

  const sel: Sel = { on: select, picked, pick: setPicked };
  const selectedItem = picked !== null ? p.template.items[picked] : null;
  const segs = p.plan.steps.map((_, i) => (i < p.stepsDone ? "bg-good" : i === p.build.step && p.build.status === "running" ? "bg-progress" : p.build.status === "stopped" && i === p.build.step ? "bg-bad" : "bg-todo"));

  return (
    <>
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {select ? (
            <>
              <strong className="font-semibold">Your app</strong>
              <span className="text-ink-2">Click any part to change it</span>
            </>
          ) : (
            <>
              <strong className="font-semibold">
                {p.imported && p.build.status === "idle"
                  ? "Your imported app, running in its own sandbox"
                  : p.build.status === "running"
                  ? `Building step ${p.build.step + 1} of ${total}: ${lowerFirst(p.plan.steps[p.build.step].title)}`
                  : p.build.status === "waiting"
                    ? `Step ${p.stepsDone} of ${total} is ready for your review`
                    : p.build.status === "stopped"
                    ? `Stopped at step ${p.build.step + 1} of ${total}`
                    : p.build.status === "checking"
                      ? "Checking the whole app"
                      : `All ${total} steps built`}
              </strong>
              <span className="flex gap-1" aria-hidden="true">
                {segs.map((c, i) => (
                  <span key={i} className={`h-1.5 w-[22px] rounded-[3px] ${c}`} />
                ))}
              </span>
              <span className="text-ink-2 max-sm:text-xs" title="Credits this build has used so far">
                {p.imported && p.build.status === "idle"
                  ? "6 of 8 things work today · see the plan"
                  : p.build.status === "done"
                    ? `Every check passed · used ${p.creditsUsed}% of this month’s credits`
                    : `Used ${p.creditsUsed}% of this month’s credits so far`}
              </span>
            </>
          )}
        </span>
        {p.build.status === "running" && (
          <button type="button" onClick={() => setStopping(true)} className="flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-line-strong px-3 text-[13px] hover:bg-hover">
            <Icon name="stop" size={14} strokeWidth={2} />
            Stop
          </button>
        )}
        {p.build.status === "waiting" && (
          <button type="button" data-tour="continue" onClick={() => update((q) => continueBuild(q))} className="flex h-8 shrink-0 items-center rounded-[9px] bg-primary px-3 text-[13px] font-medium text-on-primary">
            Continue
          </button>
        )}
        {p.build.status === "stopped" && (
          <button type="button" data-tour="keep-building" onClick={() => update((q) => startBuild(q))} className="flex h-8 shrink-0 items-center rounded-[9px] bg-primary px-3 text-[13px] font-medium text-on-primary">
            Keep building
          </button>
        )}
        {p.build.status === "done" && !select && (
          <Link href={`${base}/deploy`} className="flex h-8 shrink-0 items-center rounded-[9px] bg-primary px-3 text-[13px] font-medium text-on-primary">
            Go live
          </Link>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-2.5 border-b border-line bg-info-soft px-5 py-2.5 text-[13px] text-info dev:flex">
        <Icon name="code" size={15} strokeWidth={2} />
        <span>
          <strong className="font-semibold">Developer view is on.</strong> Code and agent files are visible.
          {p.build.status === "running" ? " Editing unlocks after the current step." : " "}
          <Link href={`${base}/code`} className="font-medium underline">
            Open Code
          </Link>
        </span>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4 text-[13px] text-ink-2 md:px-5">
        <PageMenu p={p} page={page} setPage={setPage} />
        <span className="flex items-center gap-1 md:gap-2">
          {tools.map((tl) => (
            <button
              key={tl.key}
              type="button"
              title={tl.tip}
              aria-pressed={tl.on}
              onClick={tl.onClick}
              className={`flex h-[30px] items-center gap-[5px] rounded-lg px-2 whitespace-nowrap md:px-2.5 ${tl.on ? "border border-ink font-medium text-ink" : "border border-transparent hover:text-ink"}`}
            >
              <Icon name={tl.icon} size={15} />
              <span className="sr-only lg:not-sr-only">{tl.label}</span>
            </button>
          ))}
          <MoreMenu p={p} look={look} setLook={setLook} restart={() => setRestarted((r) => r + 1)} />
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3.5 bg-bg p-4 md:p-5">
        {!select && <ResultBanner key={`${p.stepsDone}-${p.build.status}`} p={p} now={now} />}

        {device === "desktop" ? (
          <div key={restarted} className="flex flex-1 flex-col">
            <AppScreen p={p} now={now} page={page} device="desktop" dark={dark} sel={sel} testUser={testUser} />
          </div>
        ) : (
          <div className="flex flex-1 items-start justify-center py-2">
            <div key={restarted} className="w-[320px] overflow-hidden rounded-[36px] border-[10px] border-[#2B2B2E] bg-black shadow-pop">
              <div className="h-[600px] overflow-y-auto rounded-[26px]">
                <AppScreen p={p} now={now} page={page} device="phone" dark={dark} sel={sel} testUser={testUser} />
              </div>
            </div>
          </div>
        )}

        {select && selectedItem && (
          <div className="absolute right-4 bottom-4 left-4 z-20 flex flex-col gap-2.5 rounded-2xl border border-line bg-panel p-4 shadow-pop sm:left-auto sm:w-[300px]">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-dev">
              <Icon name="select" size={13} />
              {p.kind === "meal" ? "Meal card" : "Card"} · selected
            </span>
            <span className="text-sm font-semibold">Change this…</span>
            <form
              className="flex flex-col gap-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                const text = change.trim() || (p.kind === "meal" ? "Show a small photo of each dish" : "Make this card easier to read");
                update((q) => send(q, `${text} (on the “${selectedItem.title}” card)`, "Build"));
                setChange("");
                setPicked(null);
                if (window.innerWidth < 1024) openPanel();
              }}
            >
              <input
                autoFocus
                value={change}
                onChange={(e) => setChange(e.target.value)}
                placeholder={p.kind === "meal" ? "Show a small photo of each dish" : "Make this card easier to read"}
                className="h-10 rounded-[10px] border border-line-strong bg-raised px-3 text-[13px] outline-none placeholder:text-ink-3"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-ink-2">Tip: double-click text to edit it</span>
                <button type="submit" className={btnPrimary}>
                  Change
                </button>
              </span>
            </form>
          </div>
        )}
      </div>

      <Modal
        open={stopping}
        onClose={() => setStopping(false)}
        title="Stop building?"
        actions={
          <>
            <button type="button" onClick={() => setStopping(false)} className={btnOutline}>
              Keep going
            </button>
            <button
              type="button"
              onClick={() => {
                update((q) => stopBuild(q));
                setStopping(false);
              }}
              className={btnPrimary}
            >
              Stop
            </button>
          </>
        }
      >
        <p>
          {p.stepsDone > 0 ? `Steps 1–${p.stepsDone} are finished and saved. ` : ""}
          <strong>
            Step {p.build.step + 1} ({lowerFirst(p.plan.steps[p.build.step]?.title ?? "")}) stops here
          </strong>{" "}
          and is saved as a version marked <span className="rounded-md bg-bad-soft px-1.5 py-0.5 text-[13px] text-bad">Stopped · not tested</span>
        </p>
        <p className="text-[13px]">
          Your app keeps working. One click takes you back to version {p.versions[0].n}
          {p.stepsDone > 0 ? ` (after ${lowerFirst(p.plan.steps[p.stepsDone - 1].title)})` : ""}.
        </p>
      </Modal>
      <span className="sr-only" aria-live="polite">
        {p.build.status === "done" ? `All ${t.steps} steps built. ${t.checks} checks passed.` : ""}
      </span>
    </>
  );
}
