import { applySuggestion, genericSuggestion, lowerFirst, mealSuggestion, planTotals, startBuild, uid, type Project } from "./model";

/* What the pretend AI says back. Fixed answers, no AI call. */

export type Mode = "Ask" | "Plan" | "Build";

const changeWords = /\b(add|change|make|remove|delete|show|let|also|don'?t|stop|want|need|should|could|can you|please)\b/i;

function suggestionFor(p: Project) {
  return p.kind === "meal" ? mealSuggestion() : genericSuggestion();
}

function alreadyPlanned(p: Project) {
  const s = suggestionFor(p);
  return p.plan.steps.some((x) => x.title === s.step.title);
}

/** Put a suggested change in Needs you (and in green in the plan). */
export function suggest(p: Project): Project {
  if (p.suggestion) return { ...p, chat: [...p.chat, { id: uid(), type: "ai", text: "There’s already a suggested change waiting in Needs you. Accept or reject it first." }] };
  if (alreadyPlanned(p)) return { ...p, chat: [...p.chat, { id: uid(), type: "ai", text: "That’s already in the plan." }] };
  return { ...p, suggestion: suggestionFor(p), suggestionSeen: false, chat: [...p.chat, { id: uid(), type: "ai", text: "Here’s the change I’d suggest." }] };
}

export function send(p: Project, text: string, mode: Mode): Project {
  const withUser: Project = { ...p, chat: [...p.chat, { id: uid(), type: "user", text }] };
  if (mode === "Plan") return suggest(withUser);
  if (mode === "Ask") {
    if (changeWords.test(text))
      return { ...withUser, chat: [...withUser.chat, { id: uid(), type: "ai", text: "This would change your app. Plan it first, or build it now?", actions: ["plan-first", "build-now"] }] };
    const answer = p.imported
      ? "In db/schema.ts, table meals. Confirming a meal writes there but never changes the stock, which is why that check fails."
      : "This is a demo, so I can only answer from the plan. Everything the app does is in the Plan tab.";
    return { ...withUser, chat: [...withUser.chat, { id: uid(), type: "ai", text: answer }] };
  }
  return { ...withUser, chat: [...withUser.chat, { id: uid(), type: "ai", text: "This is a bigger change. Want to see the plan first?", actions: ["see-plan", "build-now"] }] };
}

export function accept(p: Project): Project {
  if (!p.suggestion) return p;
  const plan = applySuggestion(p.plan, p.suggestion);
  const added = plan.steps.length;
  const t = planTotals(plan);
  let q: Project = {
    ...p,
    plan,
    planVersion: p.planVersion + 1,
    suggestion: null,
    chat: [...p.chat, { id: uid(), type: "ai", text: `Accepted. Step ${added} (${lowerFirst(p.suggestion.step.title)}) is in the plan now: ${t.steps} steps and ${t.checks} checks.` }],
  };
  // Already built? Build just the new step.
  if (q.build.status === "done" || q.build.status === "checking") q = startBuild({ ...q, build: { ...q.build, status: "idle" } });
  return q;
}

export function reject(p: Project): Project {
  if (!p.suggestion) return p;
  return { ...p, suggestion: null, chat: [...p.chat, { id: uid(), type: "ai", text: "Rejected. The plan stays as it was." }] };
}

/** "Build it now": skip the plan review, accept and build. */
export function buildNow(p: Project): Project {
  const q = p.suggestion ? p : suggest(p);
  if (!q.suggestion) return q;
  return accept(q);
}

/** "Looks right" on an imported project's plan (design B5). */
export function confirmImport(p: Project): Project {
  if (!p.imported) return p;
  return {
    ...p,
    imported: { ...p.imported, setup: "done" },
    planVersion: p.planVersion + 1,
    chat: [...p.chat, { id: uid(), type: "ai", text: "Thanks. That’s the plan now: every build and check uses it. Two things don’t work yet, so the plan has 2 steps to fix them. Confirm the plan and build when you’re ready." }],
  };
}
