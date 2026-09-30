"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { useDismiss } from "./useDismiss";
import { useViewer } from "@/lib/viewer-context";
import { journeys, useTour, type JourneyKey } from "@/lib/tour";
import { useWorkspaces } from "@/lib/workspaces";
import { useProjects } from "@/lib/projects";
import { DEMO_PROJECT_ID } from "@/lib/demo";

/* The reviewer checklist: the five journeys, ticked once opened. Only shown in the demo. */

/** The checklist, backed by the shared tour state (lib/tour). */
function useTried() {
  const { tried, start } = useTour();
  const viewer = useViewer();
  const ws = useWorkspaces(viewer.id);
  // The tour's apps live in the first workspace, so picking a journey goes back there.
  return {
    tried: tried as string[],
    mark: (k: string) => {
      if (ws.current !== "main") ws.switchTo("main");
      start(k as JourneyKey);
    },
  };
}

/** Opens by itself once, when someone arrives from "Try the demo" (?tour=1). */
function useAutoOpen(media: string, open: () => void) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("tour") !== "1" || !window.matchMedia(media).matches) return;
    open();
    url.searchParams.delete("tour");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [media, open]);
}

function TourList({ tried, onPick }: { tried: string[]; onPick: (k: string) => void }) {
  // Agents, GitHub and Deploy use the app from the first journey; until it's built, they start at Home.
  const { projects } = useProjects();
  const built = projects.some((p) => p.id === DEMO_PROJECT_ID && p.build.status === "done");
  const needsApp = (k: string) => !built && (k === "agents" || k === "github" || k === "deploy");
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Five things to try</span>
        <span className="text-[13px] text-ink-2">
          You build one app, then try its agents, GitHub and going live. Pick one and press Show me to watch each step.
        </span>
      </div>
      <ol className="flex flex-col gap-1">
        {journeys.map((j, i) => {
          const done = tried.includes(j.key);
          return (
            <li key={j.key}>
              <Link
                href={needsApp(j.key) ? "/home" : j.href}
                onClick={() => onPick(needsApp(j.key) ? "prompt" : j.key)}
                className="flex items-start gap-3 rounded-[10px] p-2.5 hover:bg-hover"
              >
                <span
                  className={`mt-px flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done ? "bg-good-soft text-good" : "border border-line-strong text-ink-2"
                  }`}
                >
                  {done ? <Icon name="check" size={13} strokeWidth={2.6} /> : i + 1}
                  {done && <span className="sr-only">(done)</span>}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{j.title}</span>
                  <span className="text-xs text-ink-2">{needsApp(j.key) ? `${j.detail}. Build the app first` : j.detail}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="text-[11.5px] font-medium text-accent">
      {n} of {journeys.length} done
    </span>
  );
}

/** In the sidebar or full left rail: a card that opens the list beside it. */
export function DemoTourCard({ autoOpenMedia }: { autoOpenMedia: string }) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const { tried, mark } = useTried();
  if (viewer.kind !== "demo") return null;

  return (
    <div ref={ref} className="relative mb-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-[9px] rounded-[10px] border border-accent-line bg-needs py-2 pr-2 pl-2.5 text-left text-sm"
      >
        <span className="text-accent">
          <Icon name="map" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          Demo tour
          <Count n={tried.length} />
        </span>
        <Icon name="chevronRight" size={14} strokeWidth={2} />
      </button>
      {open && (
        <div role="dialog" aria-label="Demo tour" className="absolute bottom-0 left-full z-50 ml-3 w-[340px] rounded-2xl border border-line bg-panel shadow-pop">
          <TourList tried={tried} onPick={(k) => { mark(k); close(); }} />
        </div>
      )}
    </div>
  );
}

/** In the icon-only rail. */
export function DemoTourIcon({ autoOpenMedia }: { autoOpenMedia: string }) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const { tried, mark } = useTried();
  if (viewer.kind !== "demo") return null;

  return (
    <div ref={ref} className="relative mb-1 flex justify-center">
      <button
        type="button"
        title={`Demo tour · ${tried.length} of ${journeys.length} done`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-[10px] border border-accent-line bg-needs text-accent"
      >
        <Icon name="map" />
        <span className="sr-only">Demo tour</span>
      </button>
      {open && (
        <div role="dialog" aria-label="Demo tour" className="absolute bottom-0 left-full z-50 ml-3 w-[340px] rounded-2xl border border-line bg-panel shadow-pop">
          <TourList tried={tried} onPick={(k) => { mark(k); close(); }} />
        </div>
      )}
    </div>
  );
}

/** Phone: a small button that opens the list as a sheet. */
export function DemoTourButton({
  autoOpenMedia = "(max-width: 767px)",
  className = "",
}: {
  autoOpenMedia?: string;
  className?: string;
}) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => setOpen(true), []);
  const { tried, mark } = useTried();
  if (viewer.kind !== "demo") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-11 items-center gap-1.5 rounded-full border border-accent-line bg-needs px-4 text-[13px] font-medium whitespace-nowrap text-accent shadow-pop ${className}`}
      >
        <Icon name="map" size={15} />
        Tour {tried.length}/{journeys.length}
      </button>
      <Sheet open={open} onClose={close} label="Demo tour">
        <TourList tried={tried} onPick={(k) => { mark(k); close(); }} />
      </Sheet>
    </>
  );
}
