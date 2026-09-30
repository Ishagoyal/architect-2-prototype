"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useProjects } from "@/lib/projects";
import { useViewer } from "@/lib/viewer-context";
import { DEMO_PROJECT_ID } from "@/lib/demo";
import { journeys, runActs, useTour, type Act, type JourneyKey } from "@/lib/tour";
import { lowerFirst, type Project } from "@/lib/model";

/* The guide bar: says what to click on this screen for the journey you picked,
   with "Show me" to do it for you. Only in the demo. */

type Step = { n: number; of: number; text: string; acts?: Act[]; done?: boolean };

const P = `/p/${DEMO_PROJECT_ID}`;

const at = (path: string, href: string) => path === href.split("?")[0];

/** The guide for one journey: what you're looking at, and what "Show me" does next.
    In the demo nothing moves by itself; every change comes from "Show me". */
function stepFor(key: JourneyKey, since: number, path: string, projects: Project[]): Step {
  const demo = projects.find((p) => p.id === DEMO_PROJECT_ID);
  switch (key) {
    case "prompt": {
      const np = projects.filter((p) => !p.imported && p.id !== DEMO_PROJECT_ID && p.createdAt >= since).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (!np) {
        if (path.startsWith("/new"))
          return { n: 3, of: 6, text: "Architect read the idea and filled in the details: the name, what it does, who it’s for and the app’s AI. Nothing is built yet. Next, Show me confirms these.", acts: [{ click: '[data-tour="refine-confirm"]' }] };
        if (path === "/home")
          return { n: 2, of: 6, text: "This is Home, where you describe an app in your own words. Next, Show me picks one of the ideas and sends it.", acts: [{ click: '[data-tour="idea"]' }, { click: '[data-tour="send"]' }] };
        return { n: 1, of: 6, text: "This is a finished demo app. Let’s build a new one from a single sentence. Show me opens Home.", acts: [{ go: "/home" }] };
      }
      const base = `/p/${np.id}`;
      const onApp: Act[] = path === `${base}/app` ? [] : [{ go: `${base}/app` }];
      if (np.build.status === "done") return { n: 6, of: 6, text: "", done: true };
      if (np.stage === "plan" && np.build.status === "idle")
        return {
          n: 4,
          of: 6,
          text: "This is the plan: what the app does, the steps to build it, the checks for each step and the usual cost. Nothing is built yet. Next, Show me confirms the plan and builds step 1.",
          acts: [...(path === `${base}/plan` ? [] : [{ go: `${base}/plan` } as Act]), { click: '[data-tour="plan-confirm"]' }, { click: '[data-tour="build-without"]', optional: true }],
        };
      const cur = np.plan.steps[np.build.step];
      if (np.build.status === "running")
        return { n: 5, of: 6, text: `Building step ${np.build.step + 1} of ${np.plan.steps.length}: ${lowerFirst(cur.title)}. Watch the preview: it shows the step’s result, then its checks run.`, acts: onApp.length ? onApp : undefined };
      if (np.build.status === "checking") return { n: 6, of: 6, text: "Every step is built. Now the whole-app checks run, once more, from start to finish." };
      if (np.build.status === "waiting") {
        const built = np.plan.steps[np.stepsDone - 1];
        return {
          n: 5,
          of: 6,
          text: `Step ${np.stepsDone} is built: ${lowerFirst(built.builds)} Next, Show me builds step ${np.build.step + 1}: ${lowerFirst(cur.title)}.`,
          acts: [...onApp, { click: '[data-tour="continue"]' }],
        };
      }
      return { n: 5, of: 6, text: "The build is stopped. Show me carries on.", acts: [...onApp, { click: '[data-tour="keep-building"]' }] };
    }
    case "import": {
      const ip = projects.filter((p) => p.imported && p.createdAt >= since).sort((a, b) => b.createdAt - a.createdAt)[0];
      if (!ip)
        return {
          n: 1,
          of: 4,
          text: "You can also bring in an app you already have. Show me opens the import, connects GitHub with only the repos you pick, and imports CookBridge.",
          acts: [...(path === "/home" ? [] : [{ go: "/home" } as Act]), { click: '[data-tour="plus"]' }, { click: '[data-tour="import-open"]' }, { click: '[data-tour="import-connect"]', optional: true }, { click: '[data-tour="import-go"]' }],
        };
      const base = `/p/${ip.id}`;
      if (ip.imported?.setup === "keys")
        return { n: 2, of: 4, text: "Architect copied the code and found the keys it uses. It also warns that a key is saved in the repo’s history. Next, Show me moves on (in the demo, no real keys are needed).", acts: [...(path === `${base}/setup` ? [] : [{ go: `${base}/setup` } as Act]), { click: '[data-tour="setup-continue"]' }] };
      if (ip.imported?.setup === "plan")
        return { n: 3, of: 4, text: "This is what Architect thinks the app does, written from the code: its screens, its AI, and what works today (6 of 8 things). Next, Show me confirms it looks right.", acts: [...(path === `${base}/plan` ? [] : [{ go: `${base}/plan` } as Act]), { click: '[data-tour="looks-right"]' }] };
      return { n: 4, of: 4, text: "", done: true };
    }
    case "agents": {
      if (demo?.automationFixed) return { n: 3, of: 3, text: "", done: true };
      if (!at(path, `${P}/agents`))
        return { n: 1, of: 3, text: "Agents are the AI inside your app. Show me opens the Agents tab.", acts: [{ go: `${P}/agents` }] };
      return {
        n: 2,
        of: 3,
        text: "This is the meal planner: when it runs, what it does, what it must never do and what it can use, all in plain words. The 9 PM automation next to it keeps failing. Show me opens it and applies the suggested fix.",
        acts: [{ click: '[data-tour="auto-nine"]' }, { click: '[data-tour="use-email"]' }],
      };
    }
    case "github": {
      const gh = demo?.github;
      const go: Act[] = at(path, `${P}/settings`) ? [] : [{ go: `${P}/settings?tab=github` }];
      if (!gh) return { n: 1, of: 4, text: "Right now the code lives in Architect’s GitHub. Show me moves it to your own GitHub, with its full history.", acts: [...go, { click: '[data-tour="gh-move"]' }, { click: '[data-tour="gh-move-confirm"]' }] };
      if (gh.clash)
        return { n: 3, of: 4, text: "One file changed in the same lines on GitHub and in Architect. You choose; nothing is applied on its own. Show me asks the AI for a combined version and approves it.", acts: [...go, { click: '[data-tour="gh-ai"]' }, { click: '[data-tour="gh-approve"]' }] };
      if (gh.behind > 0) return { n: 2, of: 4, text: "A teammate changed 3 files on GitHub. Changes made outside Architect only come in when you ask. Show me gets them.", acts: [...go, { click: '[data-tour="gh-latest"]' }] };
      return { n: 4, of: 4, text: "", done: true };
    }
    case "deploy": {
      const d = demo?.deploy;
      const go: Act[] = at(path, `${P}/deploy`) ? [] : [{ go: `${P}/deploy` }];
      if (d?.status === "live" && d.liveVersion) return { n: 4, of: 4, text: "", done: true };
      if (d?.status === "deploying") return { n: 2, of: 4, text: "Going live: every check runs again, then Architect opens the live link to make sure it really loads." };
      if (d?.status === "failed")
        return {
          n: 3,
          of: 4,
          text: d.liveKey
            ? "The missing key is added. Show me tries again."
            : "The live link didn’t load: the live app is missing a key. Nothing broke and nobody saw an error, because the app isn’t switched over until the check passes. Show me adds the key and tries again.",
          acts: d.liveKey
            ? [...go, { click: '[data-tour="deploy-retry"]' }]
            : [...go, { click: '[data-tour="deploy-key"]' }, { fill: '[data-tour="deploy-key-input"]', value: "sk-demo-key-12345" }, { click: '[data-tour="deploy-key-save"]' }, { click: '[data-tour="deploy-retry"]' }],
        };
      if (!at(path, `${P}/deploy`)) return { n: 1, of: 4, text: "The demo app is built and every check passed. Show me opens Deploy.", acts: go };
      return { n: 1, of: 4, text: "This is how the app will appear when it’s live. Show me puts it live.", acts: [{ click: '[data-tour="deploy-go"]' }] };
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

  // Arriving from "Try the demo" (?tour=1): start the first journey straight away.
  useEffect(() => {
    if (viewer.kind !== "demo") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("tour") !== "1") return;
    url.searchParams.delete("tour");
    window.history.replaceState(null, "", url.pathname + url.search);
    start("prompt");
  }, [viewer.kind, start]);

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
