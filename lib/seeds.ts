import { createProject, lowerFirst, planTotals, usedFor, type Project, type Version } from "./model";

/* The demo's ready-made projects. Times are relative to when the demo starts. */

const MIN = 60_000;

export function demoSeeds(now = Date.now()): Project[] {
  // Abhi Kya Banega: fully built, every check passed, not live yet. Nothing moves until the reviewer clicks.
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
    now - 3 * 60 * MIN,
  );
  const steps = meal.plan.steps;
  const stepVersions: Version[] = steps
    .map((st, i) => ({
      n: 10 + i,
      title: `Step ${i + 1}: ${lowerFirst(st.title)}`,
      at: now - (40 - i * 6) * MIN,
      summary: st.builds,
      parts: st.kind === "ai" ? ["Plan", `Code · ${st.files.length} files`, "App’s AI"] : ["Plan", `Code · ${st.files.length} files`],
      checks: st.checks.map((c) => [c, "not run", "passed"] as [string, string, string]),
      cost: `${usedFor(st)}% of this month’s credits`,
      files: st.files,
      snap: { plan: meal.plan, stepsDone: i + 1 },
    }))
    .reverse();
  const total = planTotals(meal.plan);
  const used = steps.reduce((sum, st) => sum + usedFor(st), 0);
  const abhi: Project = {
    ...meal,
    id: "abhi-kya-banega",
    stage: "test",
    stepsDone: steps.length,
    creditsUsed: used,
    answer: "Only today",
    build: { status: "done", step: steps.length - 1, since: now - 10 * MIN },
    versions: [
      ...stepVersions,
      { n: 9, title: "Plan confirmed", at: now - 45 * MIN, summary: `The plan for Abhi Kya Banega: ${total.steps} steps and ${total.checks} checks.`, parts: ["Plan"], checks: [], cost: "Less than 1% of this month’s credits", files: ["plan.md"], pinned: true, snap: { plan: meal.plan, stepsDone: 0 } },
    ],
    chat: [
      { id: "s1", type: "fold", text: `Steps 1–${steps.length} done ✓ · 31 messages` },
      { id: "s2", type: "step", title: `All ${steps.length} steps built`, detail: `${total.checks} of ${total.checks} checks passed · used ${used}% of this month’s credits` },
      { id: "s3", type: "version", n: 9 + steps.length, text: "saved · Screens added" },
      { id: "s4", type: "ai", text: "Your app is built and every check passed. It isn’t live yet: go live when you’re ready." },
    ],
    createdAt: now - 3 * 60 * MIN,
    updatedAt: now - 10 * MIN,
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

