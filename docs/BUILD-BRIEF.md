# Build brief: Architect 2.0 prototype

For the chat that builds the prototype. Read this first, then `claude/PRODUCT.md`.

## What this is

Isha Goyal's take-home for Lyzr's Technical PM role: **Architect 2.0**, a vibe-coding platform for both non-technical users and developers. The brief is at https://hiring.lyzrarchitect.space/.

**What gets submitted (Submit tab):**
1. A **live URL** with all the major features in place
2. A **public GitHub repo**
3. The **architecture diagram** (`architect-2.0-diagram.png`, `architect-2.0-flow.png`, `architect-today.png` in this Project)
4. **ARCHITECTURE.md** (in this Project)

The brief says features can be dummy flows; working sign-in and database are a plus.

## Where everything is

| What | Where |
|---|---|
| Every screen, as designs | Design file: https://claude.ai/artifact/WiCUUTWd68faqafhexsANj (read it with the Artifact tool, `action: "read"`). Pages A–E and S |
| How each screen behaves, and why | `claude/PRODUCT.md` (current, updated 30 Sep) |
| How the system works | `ARCHITECTURE.md` |
| Older decision notes | `v2-decisions-log.md` (older; where it disagrees, PRODUCT.md wins) |

**Design file pages:**
- **A · Build by prompting:** sign up, onboarding, home, Refine, plan (summary, full plan, edit, save, download, step details, confirm), chat, building, preview, Select, code, stop, tests, versions, database, workspace menu, projects, agents (home)
- **B · Import a project:** + menu, connect GitHub, pick repo, keys, "here's what we think your app does", home later
- **C · Agents in any framework:** agent (plain + Developer view), files and traces, automation, imported LangGraph agent, your app's AI settings, add an agent, CrewAI crew
- **D · Connect GitHub:** choose repos, move to my GitHub, get latest, same lines changed, new changes while working
- **E · Deploy:** going live, live ✓, live check failed, deploy latest changes
- **S · Settings, usage, dark mode:** credits and usage, account, dark screens, team and review

## Must-haves

1. **Every journey clickable, end to end:** sign up → prompt → Refine → plan → build → preview → deploy, plus import, agents, GitHub and settings. Use the design file screens as the source of truth.
2. **Works on desktop and mobile.** The designs are desktop only (1440 px). **The mobile layout isn't designed yet. Agree it with Isha before building it.** A starting suggestion: the left rail becomes a bottom tab bar, the right panel (Needs you + chat) opens as a sheet from a button, and the journey bar shrinks to the current stage.
3. **A reviewer path:** a "Try the demo" button on the sign-up screen, no sign-up needed, opening a ready project.
4. **Developer view switch** (chip under the name) and **dark mode** (☾/☀ bottom-left) work everywhere.
5. **Same screens in both views.** Developer view only adds details, marked with a blue "Developer view" tag.

## Ask Isha before building (her answers decide the build)

1. **Tech stack.** Suggestion: Next.js + Supabase on Vercel (today's Architect is Next.js on Vercel; Supabase gives real sign-in and a database).
2. **What really works vs. dummy.** Suggestion: real sign-in and saving projects; everything else dummy flows.
3. **When someone types their own app idea.** Suggestion: a ready-made plan using their app's name (no AI call, free, never breaks), then the same dummy build.
4. **Reviewer path.** Suggestion: "Try the demo" + a checklist of the 5 journeys (prompt → import → agents → GitHub → deploy). Or free exploring with no checklist.
5. **Mobile layout** (see must-have 2).
6. **Accounts:** the GitHub repo name, and whether she'll create Vercel and Supabase accounts. This workspace can reach GitHub and package registries, but not Vercel or Supabase, so she'd link the repo to Vercel herself.

## How to work with Isha

- Short, simple language with real examples. Back claims with sources, and say clearly when something is a guess.
- One step at a time. Ask before big choices (stack, real vs. dummy, deploy, new screens or rules).
- Screen text in plain words. Screens say what the user can do or what happened, not the rules behind it.
- Facts, not promises, in anything user-facing (legal risk).
- **Never edit ARCHITECTURE.md without her OK.** Show exact text before saving any doc.
- Cost numbers in the designs (e.g. "usually 1.5–4%") are examples, not Architect's real data. Keep them clearly as examples.

## Still open (not part of the build)

- Restructuring ARCHITECTURE.md for readers (summary on top, easier to scan), a README, and the form answers.
