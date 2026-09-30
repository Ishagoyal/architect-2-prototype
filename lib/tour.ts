"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_PROJECT_ID } from "./demo";

/* The demo tour: five journeys a reviewer can try, which one is running,
   and which are done. Kept in this browser; every open tab stays in step. */

const P = `/p/${DEMO_PROJECT_ID}`;

export const journeys = [
  { key: "prompt", title: "Build from a prompt", detail: "Describe a meal planner in one sentence, read the plan, watch it build", href: "/home" },
  { key: "agents", title: "Agents", detail: "The app’s AI in plain words, and a 9 PM automation that needs a fix", href: `${P}/agents` },
  { key: "github", title: "GitHub", detail: "Move the code to your GitHub, get a teammate’s changes, sort out a clash", href: `${P}/settings?tab=github` },
  { key: "deploy", title: "Deploy", detail: "Go live, and see what happens when a check fails", href: `${P}/deploy` },
  { key: "import", title: "Import a project", detail: "Bring in an app you already have, from GitHub", href: "/home" },
] as const;

export type JourneyKey = (typeof journeys)[number]["key"];
export type TourState = { tried: JourneyKey[]; active: { key: JourneyKey; since: number } | null };

const KEY = "architect.tour";
const ACTIVE = "architect.tour.active";
const EVENT = "architect-tour";

function read(): TourState {
  try {
    return { tried: JSON.parse(localStorage.getItem(KEY) ?? "[]"), active: JSON.parse(localStorage.getItem(ACTIVE) ?? "null") };
  } catch {
    return { tried: [], active: null };
  }
}

function write(s: TourState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s.tried));
    localStorage.setItem(ACTIVE, JSON.stringify(s.active));
  } catch {
    /* not remembered; this page still works */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useTour() {
  const [state, setState] = useState<TourState>({ tried: [], active: null });
  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const start = useCallback((key: JourneyKey) => write({ ...read(), active: { key, since: Date.now() - 1000 } }), []);
  const finish = useCallback((key: JourneyKey) => {
    const s = read();
    write({ tried: s.tried.includes(key) ? s.tried : [...s.tried, key], active: s.active });
  }, []);
  const stop = useCallback(() => write({ ...read(), active: null }), []);
  return { ...state, start, finish, stop };
}

/** Starting or leaving the demo: forget its projects, the tour, the pretend GitHub connection,
    and go back to the default view. The next visit starts from the beginning. */
export function forgetDemo() {
  try {
    for (const k of [KEY, ACTIVE, "architect.github", "architect.addon"]) localStorage.removeItem(k);
    // Every demo project list (each demo workspace has its own) and the demo's workspaces.
    for (const k of Object.keys(localStorage)) if (k.startsWith("architect.projects.demo") || k === "architect.workspaces.demo") localStorage.removeItem(k);
    localStorage.setItem("architect.devView", "off");
  } catch {
    /* nothing remembered; nothing to clear */
  }
  document.documentElement.dataset.dev = "off";
}

/* ---------- "Show me": does the clicks for one step ---------- */

export type Act = { click: string; optional?: boolean } | { fill: string; value: string } | { go: string };

function find(selector: string, timeout = 4000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el && !(el as HTMLButtonElement).disabled) return resolve(el);
      if (Date.now() - t0 > timeout) return resolve(null);
      setTimeout(tick, 120);
    };
    tick();
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Briefly rings the element, so people see what is being clicked. */
function flash(el: HTMLElement) {
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  const prev = el.style.boxShadow;
  el.style.boxShadow = "0 0 0 4px var(--accent)";
  setTimeout(() => (el.style.boxShadow = prev), 700);
}

export async function runActs(acts: Act[], go: (href: string) => void) {
  for (const a of acts) {
    if ("go" in a) {
      go(a.go);
      await wait(700);
      continue;
    }
    if ("fill" in a) {
      const el = (await find(a.fill)) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      flash(el);
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, a.value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(400);
      continue;
    }
    const el = await find(a.click, a.optional ? 900 : 4000);
    if (!el) {
      if (a.optional) continue;
      return;
    }
    flash(el);
    await wait(550);
    el.click();
    await wait(500);
  }
}
