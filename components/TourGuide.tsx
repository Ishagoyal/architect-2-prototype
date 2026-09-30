"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useProjects } from "@/lib/projects";
import { useViewer } from "@/lib/viewer-context";
import { DEMO_PROJECT_ID } from "@/lib/demo";
import { journeys, runActs, useTour, type Act, type JourneyKey } from "@/lib/tour";
import type { Project } from "@/lib/model";

/* The guide bar: says what to click on this screen for the journey you picked,
   with "Show me" to do it for you. Only in the demo. */

type Step = { n: number; of: number; text: string; acts?: Act[]; done?: boolean };

const P = `/p/${DEMO_PROJECT_ID}`;

function stepFor(key: JourneyKey, since: number, path: string, projects: Project[]): Step {
  const demo = projects.find((p) => p.id === DEMO_PROJECT_ID);
  switch (key) {
    case "prompt": {
      const np = projects.filter((p) => !p.imported && p.id !== DEMO_PROJECT_ID && p.createdAt >= since).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (!np) {
        if (path.startsWith("/new"))
          return { n: 2, of: 4, text: "This is what Architect understood from your words. Change anything you like, then click Confirm and see the plan.", acts: [{ click: '[data-tour="refine-confirm"]' }] };
        if (path === "/home")
          return { n: 1, of: 4, text: "Pick one of the ideas below, or type your own, then press the ↑ button.", acts: [{ click: '[data-tour="idea"]' }, { click: '[data-tour="send"]' }] };
        return { n: 1, of: 4, text: "It starts on Home, where you describe an app.", acts: [{ go: "/home" }] };
      }
      const base = `/p/${np.id}`;
      if (np.build.status === "done") return { n: 4, of: 4, text: "", done: true };
      if (np.stage === "plan" && np.build.status === "idle")
        return {
          n: 3,
          of: 4,
          text: "This is the plan: what the app does, the steps, their checks and cost. Nothing is built yet. Try asking for a change in the chat, then click Confirm plan and build.",
          acts: [...(path === `${base}/plan` ? [] : [{ go: `${base}/plan` }]), { click: '[data-tour="plan-confirm"]' }, { click: '[data-tour="build-without"]', optional: true }],
        };
      return {
        n: 4,
        of: 4,
        text:
          np.build.status === "stopped"
            ? "The build is stopped. Click Keep building to carry on."
            : np.build.status === "waiting"
              ? "Review is on, so each step waits for you. Click Continue."
              : "It’s building, step by step: each step shows its result, then its checks run. It takes about half a minute. Try Phone or Select above the preview.",
        acts: path === `${base}/app` ? undefined : [{ go: `${base}/app` }],
      };
    }
    case "import": {
      const ip = projects.filter((p) => p.imported && p.createdAt >= since).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (!ip)
        return {
          n: 1,
          of: 3,
          text: "Click + in the box, then Import project. Pick the repo Architect may see, then Import project.",
          acts: [...(path === "/home" ? [] : [{ go: "/home" } as Act]), { click: '[data-tour="plus"]' }, { click: '[data-tour="import-open"]' }, { click: '[data-tour="import-connect"]', optional: true }, { click: '[data-tour="import-go"]' }],
        };
      const base = `/p/${ip.id}`;
      if (ip.imported?.setup === "keys")
        return { n: 2, of: 3, text: "Architect found the keys your code uses, and warns about one saved in the repo. Nothing real is needed here: click Continue.", acts: [...(path === `${base}/setup` ? [] : [{ go: `${base}/setup` } as Act]), { click: '[data-tour="setup-continue"]' }] };
      if (ip.imported?.setup === "plan")
        return { n: 3, of: 3, text: "This is what Architect thinks your app does, written from the code, including what works today. Check it, then click Looks right.", acts: [...(path === `${base}/plan` ? [] : [{ go: `${base}/plan` } as Act]), { click: '[data-tour="looks-right"]' }] };
      return { n: 3, of: 3, text: "", done: true };
    }
    case "agents": {
      if (demo?.automationFixed) return { n: 2, of: 2, text: "", done: true };
      const here = path === `${P}/agents`;
      return {
        n: here ? 2 : 1,
        of: 2,
        text: here
          ? "Click any box to change the agent. Then click Every day 9 PM on the left: its last step keeps failing. Click Use email too to fix it."
          : "Agents are the AI inside your app. Open the Agents tab.",
        acts: [...(here ? [] : [{ go: `${P}/agents` } as Act]), { click: '[data-tour="auto-nine"]' }, { click: '[data-tour="use-email"]' }],
      };
    }
    case "github": {
      const gh = demo?.github;
      const go: Act[] = path === `${P}/settings` ? [] : [{ go: `${P}/settings?tab=github` }];
      if (!gh) return { n: 1, of: 3, text: "The code lives in Architect’s GitHub. Click Move to my GitHub, then Move it.", acts: [...go, { click: '[data-tour="gh-move"]' }, { click: '[data-tour="gh-move-confirm"]' }] };
      if (gh.clash)
        return { n: 3, of: 3, text: "The same lines changed on GitHub and in Architect. Pick one, or click Let AI suggest a combined version, then Approve.", acts: [...go, { click: '[data-tour="gh-ai"]' }, { click: '[data-tour="gh-approve"]' }] };
      if (gh.behind > 0) return { n: 2, of: 3, text: "A teammate changed files on GitHub. They only come in when you ask: click Get latest.", acts: [...go, { click: '[data-tour="gh-latest"]' }] };
      return { n: 3, of: 3, text: "", done: true };
    }
    case "deploy": {
      const d = demo?.deploy;
      const go: Act[] = path === `${P}/deploy` ? [] : [{ go: `${P}/deploy` }];
      if (d?.status === "live" && d.liveVersion) return { n: 3, of: 3, text: "", done: true };
      if (d?.status === "deploying") return { n: 2, of: 3, text: "Going live: every check runs again, then Architect opens the live link to make sure it loads." };
      if (d?.status === "failed")
        return {
          n: 3,
          of: 3,
          text: d.liveKey
            ? "The key is added. Click Try again."
            : "The live check failed, and nothing broke: nobody saw a broken page. Click Add the Live key (type anything), then Try again.",
          acts: d.liveKey
            ? [...go, { click: '[data-tour="deploy-retry"]' }]
            : [...go, { click: '[data-tour="deploy-key"]' }, { fill: '[data-tour="deploy-key-input"]', value: "sk-demo-key-12345" }, { click: '[data-tour="deploy-key-save"]' }, { click: '[data-tour="deploy-retry"]' }],
        };
      if (demo && demo.build.status !== "done" && !d?.liveVersion)
        return { n: 1, of: 3, text: "The demo app is still building. It finishes in under a minute, and this updates by itself.", acts: path === `${P}/app` ? undefined : [{ go: `${P}/app` }] };
      return { n: 1, of: 3, text: "The app is built and every check passed. Click Go live.", acts: [...go, { click: '[data-tour="deploy-go"]' }] };
    }
  }
}

export function TourGuide() {
  const viewer = useViewer();
  const path = usePathname();
  const router = useRouter();
  const { projects, loaded } = useProjects();
  const { active, tried, start, finish, stop } = useTour();
  const [busy, setBusy] = useState(false);

  const step = active && loaded ? stepFor(active.key, active.since, path, projects) : null;

  useEffect(() => {
    if (active && step?.done && !tried.includes(active.key)) finish(active.key);
  }, [active, step?.done, tried, finish]);

  if (viewer.kind !== "demo" || !active || !step) return null;
  const j = journeys.find((x) => x.key === active.key)!;
  const next = journeys.find((x) => !tried.includes(x.key) && x.key !== active.key);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[132px] z-40 flex justify-center px-3 md:bottom-5">
      <div role="status" className="pointer-events-auto flex w-full max-w-[620px] items-start gap-3 rounded-2xl border border-accent-line bg-panel p-3.5 shadow-pop">
        <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-good-soft text-good" : "bg-accent-soft text-accent"}`}>
          {step.done ? <Icon name="check" size={14} strokeWidth={2.6} /> : <Icon name="map" size={14} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-ink-2">
            Demo tour · {j.title}
            {!step.done && ` · step ${step.n} of ${step.of}`}
          </span>
          <span className="text-sm leading-snug">
            {step.done ? (next ? `Done. Next: ${next.title}.` : "That’s all five. Thanks for trying the demo!") : step.text}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
          {step.done ? (
            next && (
              <button
                type="button"
                onClick={() => {
                  start(next.key);
                  router.push(next.href);
                }}
                className="flex h-9 items-center rounded-[10px] bg-primary px-3 text-[13px] font-medium whitespace-nowrap text-on-primary"
              >
                Start
              </button>
            )
          ) : (
            step.acts && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await runActs(step.acts!, (href) => router.push(href));
                  setBusy(false);
                }}
                className="flex h-9 items-center rounded-[10px] bg-primary px-3 text-[13px] font-medium whitespace-nowrap text-on-primary disabled:opacity-60"
              >
                {busy ? "Doing it…" : "Show me"}
              </button>
            )
          )}
          <button type="button" onClick={stop} aria-label="Close the tour" className="flex size-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-hover">
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
