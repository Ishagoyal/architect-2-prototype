import { DEMO_IDEA } from "./demo";
import { createProject, mealPlan, type ChatItem, type Project, type Version } from "./model";
import { SCENE_COUNT } from "./story";

/* The landing page's six scenes: the meal app, set up at one moment of its build.
   Each one is made fresh every time the scene opens, and lives only in memory. */

export type Scene = {
  n: number;
  /** Where the scene opens, inside the project. */
  path: string;
  /** The parts that stay sharp. The first group that is on screen wins. */
  spotlight: string[][];
  devView?: boolean;
  seed: (now: number) => Project;
};

const MIN = 60_000;

export const sceneId = (n: number) => `scene-${n}`;

/** "scene-3" → 3; anything else → null. */
export function sceneNumber(id: string) {
  const m = /^scene-(\d+)$/.exec(id);
  const n = m ? Number(m[1]) : 0;
  return n >= 1 && n <= SCENE_COUNT ? n : null;
}

let seq = 0;
const said = (type: "ai" | "user", text: string): ChatItem => ({ id: `s${seq++}`, type, text });
const stepDone = (title: string, detail: string): ChatItem => ({ id: `s${seq++}`, type: "step", title, detail });
const saved = (n: number, text: string): ChatItem => ({ id: `s${seq++}`, type: "version", n, text });

/** The meal app, planned; each scene builds on it. */
function mealApp(n: number, now: number): Project {
  const p = createProject(
    { idea: DEMO_IDEA, name: "Abhi Kya Banega", what: "", target: "Families who cook at home with help from a cook", instructions: "", appType: "Website", theme: 0, withAI: true },
    now - 3 * 24 * 60 * MIN,
  );
  return { ...p, id: sceneId(n), answer: "Only today", stage: "build", suggestionSeen: true, createdAt: now - 3 * 24 * 60 * MIN, updatedAt: now - MIN };
}

/** A version for step `step` (1-based) of the meal plan, `ago` minutes back. */
function stepVersion(n: number, step: number, ago: number, now: number, extra: Partial<Version> = {}): Version {
  const plan = mealPlan();
  const s = plan.steps[step - 1];
  return {
    n,
    title: `Step ${step}: ${s.title[0].toLowerCase()}${s.title.slice(1)}`,
    at: now - ago * MIN,
    summary: s.builds,
    parts: s.kind === "ai" ? ["Plan", `Code · ${s.files.length} files`, "App’s AI"] : ["Plan", `Code · ${s.files.length} files`],
    checks: s.checks.map((c) => [c, "not run", "passed"]),
    cost: `${Math.max(1, Math.round((s.cost[0] + s.cost[1]) / 2 - 0.4))}% of this month’s credits`,
    files: s.files,
    snap: { plan, stepsDone: step },
    ...extra,
  };
}

/** Scene 2 and 3's version 12: step 3 broke a check that used to pass (designs A22, A23). */
function v12(now: number): Version {
  return stepVersion(12, 3, 2, now, {
    summary: "Added the meal suggestions page. The app’s AI now suggests 3 meals from the kitchen and skips dishes from the last 3 days.",
    parts: ["Plan", "Code · 4 files", "App’s AI"],
    checks: [
      ["Suggests 3 meals", "not run", "passed"],
      ["Doesn’t repeat recent dishes", "not run", "passed"],
      ["Adding a kitchen item", "passed", "failed"],
    ],
    cost: "2% of this month’s credits",
    files: ["lib/suggest-meals.ts", "app/today/page.tsx", "agents/meal-planner/RULES.md", "plan.md"],
  });
}

const v11Live = (now: number) => stepVersion(11, 2, 6, now, { badge: "live" });
const v10Stopped = (now: number): Version => ({
  n: 10,
  title: "Step 3 stopped",
  at: now - 8 * MIN,
  summary: "Stopped while building meal suggestions. What was written so far is kept, but not tested.",
  parts: ["Code"],
  checks: mealPlan().steps[2].checks.map((c) => [c, "not run", "not run"]),
  cost: "1% of this month’s credits",
  files: ["lib/suggest-meals.ts"],
  badge: "stopped",
  snap: { plan: mealPlan(), stepsDone: 2 },
});
const v8Pinned = (now: number) => ({ ...stepVersion(8, 2, 26 * 60, now), title: "First working version", pinned: true });
const liveOn = (n: number, title: string, at: number) => ({ status: "live" as const, since: at, target: n, liveVersion: n, history: [{ n, title, at }], liveKey: true });

export const scenes: Scene[] = [
  {
    n: 1,
    path: "tests",
    spotlight: [['[data-scene="check-change"]']],
    seed: (now) => ({
      ...mealApp(1, now),
      stage: "test",
      stepsDone: 5,
      build: { status: "done", step: 4, since: now - MIN },
      creditsUsed: 12,
      versions: [stepVersion(12, 5, 1, now), stepVersion(11, 4, 6, now), stepVersion(10, 3, 9, now), stepVersion(9, 2, 12, now), stepVersion(8, 1, 15, now)],
      checkChange: {
        step: 2,
        index: 0,
        from: "Shows exactly 3 meals",
        to: "Shows up to 3 meals",
        reason: "with very little stock, 3 full meals aren’t possible",
        status: "waiting",
      },
      chat: [
        stepDone("All 5 steps built", "12 of 12 checks passed · used 12% of this month’s credits"),
        said("ai", "With very little stock, the app can’t make 3 full meals. I’d like to change the check “Shows exactly 3 meals” to “Shows up to 3 meals”. I won’t change it without your OK."),
      ],
    }),
  },
  {
    n: 2,
    path: "versions?v=12",
    spotlight: [['[data-scene="checks"]'], ['[data-scene="version-detail"]']],
    seed: (now) => ({
      ...mealApp(2, now),
      stepsDone: 3,
      stepByStep: true,
      build: { status: "waiting", step: 3, since: now - 2 * MIN },
      creditsUsed: 5,
      versions: [v12(now), v11Live(now), v10Stopped(now), v8Pinned(now)],
      deploy: liveOn(11, "Step 2: login", now - 5 * MIN),
      chat: [
        stepDone("Step 3 done: Meal suggestions", "3 of 3 checks passed · used 2% of this month’s credits"),
        saved(12, "saved · Meal suggestions"),
        said("ai", "Step 3 is built. One check that passed before, “Adding a kitchen item”, now fails. Fix it, or undo the change."),
      ],
    }),
  },
  {
    n: 3,
    path: "versions?v=12&tab=files",
    devView: true,
    spotlight: [['[data-scene="changed-files"]'], ['[data-scene="version-detail"]']],
    seed: (now) => ({
      ...mealApp(3, now),
      stepsDone: 2,
      build: { status: "stopped", step: 2, since: now - 20_000 },
      creditsUsed: 5,
      versions: [
        { n: 13, title: "Went back to v11", at: now - 20_000, summary: "A copy of v11 (step 2: login). The plan, the code and the app’s AI went back. Your app’s data stayed.", parts: ["Plan", "Code", "App’s AI"], checks: [], cost: "No credits", files: mealPlan().steps[1].files, snap: { plan: mealPlan(), stepsDone: 2 } },
        v12(now),
        v11Live(now),
      ],
      deploy: liveOn(11, "Step 2: login", now - 5 * MIN),
      chat: [stepDone("Step 3 done: Meal suggestions", "3 of 3 checks passed · used 2% of this month’s credits"), saved(12, "saved · Meal suggestions"), saved(13, "saved · went back to v11")],
    }),
  },
  {
    n: 4,
    path: "app?page=1",
    spotlight: [['[data-scene="build-status"]']],
    seed: (now) => ({
      ...mealApp(4, now),
      stepsDone: 4,
      reviewOn: true,
      build: { status: "waiting", step: 4, since: now - MIN },
      creditsUsed: 9,
      versions: [stepVersion(12, 4, 1, now), stepVersion(11, 3, 4, now), stepVersion(10, 2, 7, now), stepVersion(9, 1, 10, now)],
      chat: [
        stepDone("Step 3 done: Meal suggestions", "3 of 3 checks passed · used 2% of this month’s credits"),
        stepDone("Step 4 done: Inventory", "3 of 3 checks passed · used 1% of this month’s credits"),
        said("ai", "Step 4 is built on a copy. Files changed: lib/parse-hinglish.ts and app/inventory/page.tsx. Your app stays as it is until you continue."),
      ],
    }),
  },
  {
    n: 5,
    path: "database",
    spotlight: [['[data-scene="db-note"]', '[data-scene="db-table"]']],
    seed: (now) => ({
      ...mealApp(5, now),
      stage: "live",
      stepsDone: 5,
      build: { status: "done", step: 4, since: now - 2 * 24 * 60 * MIN },
      creditsUsed: 12,
      versions: [stepVersion(14, 5, 2 * 24 * 60, now, { badge: "live" }), stepVersion(13, 4, 2 * 24 * 60 + 5, now), stepVersion(12, 3, 2 * 24 * 60 + 9, now)],
      deploy: liveOn(14, "Step 5: screens", now - 2 * 24 * 60 * MIN),
      chat: [said("ai", "This is test data: a copy of your live data from 2 days ago, with names, emails and phone numbers made up. Change anything here; your live app won’t see it.")],
    }),
  },
  {
    n: 6,
    path: "deploy",
    spotlight: [['[data-scene="deploy-bar"]', '[data-scene="what-to-do"]']],
    seed: (now) => ({
      ...mealApp(6, now),
      stage: "test",
      stepsDone: 5,
      build: { status: "done", step: 4, since: now - 6 * MIN },
      creditsUsed: 14,
      versions: [
        { ...stepVersion(16, 5, 4, now), title: "Steps 3–5: meals, kitchen and screens", summary: "Meal suggestions, the Kitchen page and all four screens, built and checked in preview." },
        { ...stepVersion(15, 2, 26 * 60, now), title: "Invites for the family", summary: "Family members can invite each other by email." },
        stepVersion(14, 2, 27 * 60, now, { badge: "live" }),
      ],
      deploy: { status: "failed", since: now - MIN, target: 16, liveVersion: 14, failedVersion: 16, history: [{ n: 14, title: "Step 2: login", at: now - 27 * 60 * MIN }], liveKey: false },
      chat: [
        said("user", "Deploy latest changes"),
        said("ai", "Going live now. I’ll check the live link before calling it live."),
        said("ai", "I published version 16 and opened the live link, but the page showed an error. I kept version 14 live, so nothing changed for your users."),
      ],
    }),
  },
];

export const sceneFor = (n: number) => scenes.find((s) => s.n === n);
