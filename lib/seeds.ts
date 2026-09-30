import { createProject, type Project } from "./model";

/* The demo's ready-made projects. Times are relative to when the demo starts. */

const MIN = 60_000;

export function demoSeeds(now = Date.now()): Project[] {
  // Abhi Kya Banega: mid-build, step 3 of 5 (design A11). The build carries on by itself.
  const meal = createProject(
    {
      idea: "Build an app for Indian households with a cook. The family updates what's in the kitchen in Hinglish or with photos, and it suggests three meals we can make right now.",
      name: "Abhi Kya Banega",
      what: "",
      target: "Families who cook at home with help from a cook",
      instructions: "Don't repeat a dish within three days. Keep meals practical for a home cook. Make the day's plan easy to share on WhatsApp.",
      appType: "Website",
      theme: 0,
      withAI: true,
    },
    now - 30 * MIN,
  );
  const abhi: Project = {
    ...meal,
    id: "abhi-kya-banega",
    stage: "build",
    stepsDone: 2,
    creditsUsed: 2,
    answer: "Only today",
    build: { status: "running", step: 2, since: now - 1500 },
    versions: [
      { n: 11, title: "Step 2: login", at: now - 6 * MIN, summary: "Sign-in by email, and invites for the rest of the family.", parts: ["Plan", "Code · 2 files"], checks: [["A family member can sign in", "not run", "passed"], ["Someone outside the family can’t see the kitchen", "not run", "passed"]], cost: "1% of this month’s credits", files: ["app/login/page.tsx", "lib/auth.ts"], snap: { plan: meal.plan, stepsDone: 2 } },
      { n: 10, title: "Step 1: kitchen data", at: now - 12 * MIN, summary: "The place your app keeps households, kitchen items and meals, with a few examples.", parts: ["Plan", "Code · 2 files"], checks: [["Saves a kitchen item", "not run", "passed"], ["Keeps each family’s data separate", "not run", "passed"]], cost: "1% of this month’s credits", files: ["db/schema.ts", "db/seed.ts"], snap: { plan: meal.plan, stepsDone: 1 } },
      { n: 9, title: "Plan confirmed", at: now - 15 * MIN, summary: "The plan for Abhi Kya Banega: 5 steps and 15 checks.", parts: ["Plan"], checks: [], cost: "Less than 1% of this month’s credits", files: ["plan.md"], pinned: true, snap: { plan: meal.plan, stepsDone: 0 } },
    ],
    chat: [
      { id: "s1", type: "fold", text: "Steps 1–2 done ✓ · 14 messages" },
      { id: "s2", type: "step", title: "Step 2 done: Login", detail: "2 of 2 checks passed · used 1% of this month’s credits" },
      { id: "s3", type: "version", n: 11, text: "saved · Login added" },
      { id: "s4", type: "ai", text: "Now building step 3: meal suggestions. I'm testing the app's AI with a sample kitchen." },
    ],
    createdAt: now - 3 * 60 * MIN,
    updatedAt: now - 2 * MIN,
  };

  const docs = createProject(
    { idea: "An agent that answers customer questions from our docs", name: "Docs Support Agent", what: "Answers customer questions from our help docs.", target: "Customers looking for help", instructions: "", appType: "Website", theme: 1, withAI: true },
    now - 26 * 60 * MIN,
  );
  const docsAgent: Project = {
    ...docs,
    id: "docs-support-agent",
    stage: "build",
    stepsDone: 1,
    creditsUsed: 1,
    build: { status: "stopped", step: 1, since: now - 24 * 60 * MIN },
    updatedAt: now - 24 * 60 * MIN,
  };

  const leave = createProject(
    { idea: "A leave request bot that checks the policy and asks a manager", name: "Leave Request Bot", what: "Checks each leave request against the policy and asks the manager.", target: "Employees and their managers", instructions: "", appType: "Website", theme: 2, withAI: true },
    now - 3 * 24 * 60 * MIN,
  );
  const leaveBot: Project = { ...leave, id: "leave-request-bot", suggestion: null };

  return [abhi, docsAgent, leaveBot];
}

