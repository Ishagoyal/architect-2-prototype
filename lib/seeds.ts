import { createProject, type Project } from "./model";

/* The demo's ready-made projects. Times are relative to when the demo starts. */

const MIN = 60_000;

export function demoSeeds(now = Date.now()): Project[] {
  // Abhi Kya Banega isn't here: the demo tour builds it from a prompt, then uses it for every other journey.
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

  return [docsAgent, leaveBot];
}

