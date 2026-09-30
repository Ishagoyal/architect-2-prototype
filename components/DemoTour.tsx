"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { useDismiss } from "./useDismiss";
import { useViewer } from "@/lib/viewer-context";
import { demoProject } from "@/lib/demo";

/* The reviewer checklist: the five journeys, ticked once opened. Only shown in the demo. */

const p = `/p/${demoProject.id}`;
const journeys = [
  { key: "prompt", title: "Build from a prompt", detail: "Describe an app, refine it, read the plan, watch it build", href: "/home" },
  { key: "import", title: "Import a project", detail: "Bring in a GitHub repo and see what Architect makes of it", href: "/home" },
  { key: "agents", title: "Agents", detail: "The app’s AI in plain words, and a 9 PM automation", href: `${p}/agents` },
  { key: "github", title: "GitHub", detail: "Connect, get the latest changes, sort out a clash", href: `${p}/settings` },
  { key: "deploy", title: "Deploy", detail: "Go live, and see what happens when a check fails", href: `${p}/deploy` },
];

const KEY = "architect.tour";

function useTried() {
  const [tried, setTried] = useState<string[]>([]);
  useEffect(() => {
    try {
      setTried(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      /* nothing remembered yet */
    }
  }, []);
  const mark = useCallback((k: string) => {
    setTried((t) => {
      const next = t.includes(k) ? t : [...t, k];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* not remembered, still fine */
      }
      return next;
    });
  }, []);
  return { tried, mark };
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
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Five things to try</span>
        <span className="text-[13px] text-ink-2">
          This demo has made-up data, so click anything. Each one opens where that journey starts.
        </span>
      </div>
      <ol className="flex flex-col gap-1">
        {journeys.map((j, i) => {
          const done = tried.includes(j.key);
          return (
            <li key={j.key}>
              <Link
                href={j.href}
                onClick={() => onPick(j.key)}
                className="flex items-start gap-3 rounded-[10px] p-2.5 hover:bg-hover"
              >
                <span
                  className={`mt-px flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done ? "bg-good-soft text-good" : "border border-line-strong text-ink-2"
                  }`}
                >
                  {done ? <Icon name="check" size={13} strokeWidth={2.6} /> : i + 1}
                  {done && <span className="sr-only">(tried)</span>}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{j.title}</span>
                  <span className="text-xs text-ink-2">{j.detail}</span>
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
      {n} of {journeys.length} tried
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
  useAutoOpen(autoOpenMedia, show);
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
  useAutoOpen(autoOpenMedia, show);
  if (viewer.kind !== "demo") return null;

  return (
    <div ref={ref} className="relative mb-1 flex justify-center">
      <button
        type="button"
        title={`Demo tour · ${tried.length} of ${journeys.length} tried`}
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
  useAutoOpen(autoOpenMedia, show);
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
