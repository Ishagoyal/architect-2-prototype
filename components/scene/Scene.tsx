"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { startDemo } from "@/app/actions";
import { ProjectsProvider } from "@/lib/projects";
import { usePrefs } from "@/lib/prefs";
import { sceneFor, type Scene } from "@/lib/scenes";
import { problems, SCENE_COUNT } from "@/lib/story";
import { forgetDemo } from "@/lib/tour";

/* A scene: the real project screen, with everything blurred except the part that answers
   one problem, and a card beside it. "Look around" lifts the blur. Nothing here is saved. */

type SceneState = { n: number; lookAround: boolean; setLookAround: (on: boolean) => void };
const SceneContext = createContext<SceneState | null>(null);

export function SceneRoot({ n, children }: { n: number; children: React.ReactNode }) {
  const scene = sceneFor(n)!;
  const [lookAround, setLookAround] = useState(false);
  const { holdDevView } = usePrefs();

  // Each scene opens in its own view (scene 3 is in Developer view), without changing the saved choice.
  useEffect(() => {
    holdDevView(!!scene.devView);
    return () => holdDevView(null);
  }, [scene.devView, holdDevView]);

  const seed = useCallback(() => [scene.seed(Date.now())], [scene]);

  return (
    <SceneContext.Provider value={{ n, lookAround, setLookAround }}>
      <ProjectsProvider kind="scene" owner="scene" seed={seed}>
        {children}
        {!lookAround && <Spotlight scene={scene} onLookAround={() => setLookAround(true)} />}
      </ProjectsProvider>
    </SceneContext.Provider>
  );
}

/** After "Look around": a thin strip at the top, in place of the demo strip. */
export function SceneStrip() {
  const ctx = useContext(SceneContext);
  if (!ctx?.lookAround) return null;
  return (
    <div className="flex min-h-8 shrink-0 items-center justify-center gap-2 bg-accent-soft px-3 py-1 text-center text-xs text-accent-strong">
      <span>Scene {ctx.n} of {SCENE_COUNT}</span>
      <span aria-hidden="true">·</span>
      <Link href={`/#problem-${ctx.n}`} className="font-semibold underline underline-offset-2">
        Back to the story
      </Link>
    </div>
  );
}

type Box = { x: number; y: number; w: number; h: number };
const PAD = 6;
const RADIUS = 14;
const PHONE = 767;

/** The parts to keep sharp: the first spotlight group with something on screen. */
function findTargets(scene: Scene): HTMLElement[] {
  for (const group of scene.spotlight) {
    const found = group.flatMap((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel))).filter((el) => el.offsetParent !== null);
    if (found.length) return found;
  }
  return [];
}

function boxesOf(els: HTMLElement[]): Box[] {
  return els.map((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
  });
}

const sameBoxes = (a: Box[], b: Box[]) => a.length === b.length && a.every((x, i) => Math.abs(x.x - b[i].x) < 0.5 && Math.abs(x.y - b[i].y) < 0.5 && Math.abs(x.w - b[i].w) < 0.5 && Math.abs(x.h - b[i].h) < 0.5);

/** A rounded rectangle, for cutting holes in the blur. */
function roundRect({ x, y, w, h }: Box) {
  const r = Math.min(RADIUS, w / 2, h / 2);
  return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Spotlight({ scene, onLookAround }: { scene: Scene; onLookAround: () => void }) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [cardH, setCardH] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const targets = useRef<HTMLElement[]>([]);
  const found = useRef(0);
  const problem = problems[scene.n - 1];
  const last = scene.n === SCENE_COUNT;

  // Follow the spotlight parts as the page scrolls, resizes or changes.
  useLayoutEffect(() => {
    let frame = 0;
    const tick = () => {
      const els = findTargets(scene);
      targets.current = els;
      const phone = window.innerWidth <= PHONE;
      // Bring the spotlight into view. The page may still be settling, so keep at it for a moment.
      if (els.length) {
        found.current ||= performance.now();
        if (performance.now() - found.current < 700) {
          els[0].style.scrollMarginTop = "12px";
          els[0].scrollIntoView({ block: phone ? "start" : "nearest" });
        }
      }
      const next = boxesOf(els);
      setBoxes((b) => (sameBoxes(b, next) ? b : next));
      setView((v) => (v.w === window.innerWidth && v.h === window.innerHeight ? v : { w: window.innerWidth, h: window.innerHeight }));
      if (card.current) {
        const h = card.current.offsetHeight;
        setCardH((c) => (c === h ? c : h));
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [scene]);

  // Focus starts on the card. Tab only moves between the spotlight and the card; Esc looks around.
  const ready = view.w > 0;
  useEffect(() => {
    if (ready) card.current?.focus();
  }, [ready]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A dialog opened from the spotlight (like "Add the Live key") handles its own keys.
      if (document.querySelector('[aria-modal="true"]')) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onLookAround();
        return;
      }
      if (e.key !== "Tab" || !card.current) return;
      const list = [...targets.current.flatMap((t) => Array.from(t.querySelectorAll<HTMLElement>(focusable))), ...Array.from(card.current.querySelectorAll<HTMLElement>(focusable))];
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const next = i === -1 ? (e.shiftKey ? list.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + list.length) % list.length;
      list[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onLookAround]);

  const phone = view.w > 0 && view.w <= PHONE;

  // On a phone the card covers the bottom of the screen: leave room below the page so the spotlight can scroll above it.
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main || !phone) return;
    main.style.paddingBottom = `${cardH + 24}px`;
    return () => {
      main.style.paddingBottom = "";
    };
  }, [phone, cardH]);

  const holes = boxes.map(roundRect).join(" ");
  const clip = view.w ? `path(evenodd, "M0,0 H${view.w} V${view.h} H0 Z ${holes}")` : undefined;

  // Beside the spotlight on a computer: below it if there's room, else above, else at the bottom.
  let cardStyle: React.CSSProperties = {};
  if (!phone && view.w) {
    const width = Math.min(500, view.w - 32);
    const top = boxes.length ? Math.min(...boxes.map((b) => b.y)) : view.h / 2;
    const bottom = boxes.length ? Math.max(...boxes.map((b) => b.y + b.h)) : view.h / 2;
    const left = boxes.length ? Math.min(...boxes.map((b) => b.x)) : (view.w - width) / 2;
    const x = Math.max(16, Math.min(left, view.w - width - 16));
    const y = bottom + 12 + cardH <= view.h - 16 ? bottom + 12 : top - 12 - cardH >= 16 ? top - 12 - cardH : view.h - cardH - 16;
    cardStyle = { width, left: x, top: y };
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-[rgba(246,244,239,0.45)] backdrop-blur-[3px] dark:bg-[rgba(18,18,17,0.55)]"
        style={{ clipPath: clip }}
      />
      {boxes.map((b, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-[14px] border-2 border-accent shadow-[0_0_0_5px_var(--accent-soft)]"
          style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
        />
      ))}
      <div
        ref={card}
        role="dialog"
        aria-labelledby="scene-title"
        aria-describedby="scene-answer"
        tabIndex={-1}
        className={`fixed z-[45] flex flex-col gap-3 bg-panel p-5 shadow-pop outline-none md:rounded-2xl md:border md:border-line md:p-6 ${
          phone ? "inset-x-0 bottom-0 max-h-[55dvh] overflow-y-auto rounded-t-2xl border-t border-line pb-[max(20px,env(safe-area-inset-bottom))]" : ""
        } ${view.w ? "" : "invisible"}`}
        style={cardStyle}
      >
        <span className="text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase">
          Scene {scene.n} of {SCENE_COUNT}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-bad uppercase">Problem</span>
          <h2 id="scene-title" className="font-serif text-[22px] leading-snug md:text-2xl">
            “{problem.quote}”
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-good uppercase">In 2.0</span>
          <p id="scene-answer" className="text-[15px] leading-normal">
            {problem.answer}
          </p>
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          {last ? (
            <form action={startDemo} onSubmit={() => forgetDemo()}>
              <button type="submit" className="flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium whitespace-nowrap text-on-primary">
                Try the full demo →
              </button>
            </form>
          ) : (
            <Link href={`/scene/${scene.n + 1}`} className="flex h-10 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium whitespace-nowrap text-on-primary">
              Next scene →
            </Link>
          )}
          <Link href={`/#problem-${scene.n}`} className="flex h-10 items-center rounded-[10px] border border-line-strong bg-panel px-4 text-[13px] whitespace-nowrap hover:bg-hover">
            Back to the story
          </Link>
          <button type="button" onClick={onLookAround} className="flex h-10 items-center rounded-[10px] border border-line-strong bg-panel px-4 text-[13px] whitespace-nowrap hover:bg-hover">
            Look around
          </button>
        </div>
      </div>
    </>
  );
}
