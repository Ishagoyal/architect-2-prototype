# Architect 2.0 prototype: notes for Claude

Read this first. It replaces the chat where the planning happened (30 Sep 2026).

## What this is

Isha Goyal's take-home for Lyzr's Technical PM role: **Architect 2.0**, a vibe-coding platform for non-technical users and developers. Brief: https://hiring.lyzrarchitect.space/

**What gets submitted:** a live URL with all major features, this public GitHub repo, the architecture diagrams (`docs/*.png`) and `docs/ARCHITECTURE.md`. Features can be dummy flows; working sign-in and a database are a plus.

## Where everything is

| What | Where |
|---|---|
| Every screen (the source of truth for layout and wording) | `design/README.md` → `design/screens/*.png` (pictures) and `design/source/*.dc.html` (HTML). Original: https://claude.ai/artifact/WiCUUTWd68faqafhexsANj |
| How each screen behaves, and why | `docs/PRODUCT.md` |
| How the system works (for the write-up, not the prototype) | `docs/ARCHITECTURE.md` |
| The original build brief | `docs/BUILD-BRIEF.md` (its paths point at Isha's claude.ai Project; the files are copied here) |
| Colours for light and dark | `styles/tokens.css` |

The originals of the docs live in Isha's claude.ai Project ("Assignments"). If you change a doc here, tell her, so she can update her copy.

## Decisions already made (don't ask again)

| Question | Answer |
|---|---|
| Stack | **Next.js + Supabase, hosted on Vercel** |
| Real vs dummy | **Real sign-in and saving projects** (Supabase). Everything else is a clickable dummy flow |
| Someone types their own app idea | A **ready-made plan using their app's name** (no AI call, free, never breaks), then the same dummy build |
| Reviewers | **"Try the demo"** on the sign-up screen (no sign-up, opens a ready project) + a **checklist of the 5 journeys**: prompt → import → agents → GitHub → deploy |
| Phone layout | Left rail → **bottom tab bar**. Needs you + chat → a **sheet** opened from a button. Journey bar → **only the current stage** |
| Repo | `Ishagoyal/architect-2-prototype`, public |
| Accounts | Isha creates **Supabase** and **Vercel** herself; give her short, plain steps. Never commit keys: they go in Vercel's settings and a local `.env.local` (already in `.gitignore`) |
| Dark theme | The design file's dark screens felt overpowering. Use the **calmer dark in `styles/tokens.css`** (neutral charcoal, soft clay accent, no bright orange, faint lines). Preview: `design/theme-preview/` |
| Preview in dark mode | The preview shows the user's app **as it would look on a dark-mode device: dark if the app has a dark mode, light if not**. The preview's ⋯ menu has Light / Dark to check both. The demo meal app gets a dark version too |

**Still waiting on Isha:** OK to change "Dark is warm charcoal, not black." in PRODUCT.md to "Dark is a soft, neutral charcoal, not black."

## Must-haves

1. Every journey clickable end to end: sign up → prompt → Refine → plan → build → preview → deploy, plus import, agents, GitHub and settings.
2. Works on desktop and phone.
3. "Try the demo" reviewer path.
4. **Developer view** chip (under the name) and **dark mode** (☾ / ☀ bottom-left) work on every screen.
5. **Same screens in both views.** Developer view only adds details, each marked with a small blue "Developer view" tag.

## Build plan (one step at a time; show Isha screenshots after each)

1. **Base** ← we are here. Done: colours (`styles/tokens.css`), repo, `.gitignore`. Next: set up Next.js (App Router, TypeScript, Tailwind reading the CSS variables); fonts from npm (`geist` package for Geist + Geist Mono, `@fontsource/instrument-serif`), because Google Fonts may be blocked in the build environment; the home sidebar; the project layout (top bar with journey bar, left rail, main area, Needs you + chat panel); the phone layout; theme toggle and Developer view chip, both remembered.
2. **Sign up, "Try the demo", onboarding, home.** The demo must work without Supabase, so nothing waits on Isha's accounts.
3. **Journey 1:** prompt → Refine → plan → build → preview, plus tests and versions.
4. **The rest:** import, agents, GitHub, deploy, settings and usage.
5. **Going live:** push to GitHub, then guide Isha through Supabase and Vercel.

Check your own work before showing it: run the build, take screenshots (Playwright; browsers are in `/opt/pw-browsers`), compare with `design/screens/`.

## How to work with Isha

- **Short, simple language, one thing at a time.** She said "I don't understand anything" when given a long list of options. Give one clear recommendation, at most 2–3 plain choices, and ask one question.
- Real examples. Back claims with sources, and say clearly when something is a guess.
- Ask before big choices (new screens, new rules, deploying).
- Screen text in plain words. Screens say what the user can do or what happened, not the rules behind it.
- Facts, not promises, in anything user-facing (legal risk).
- **Never edit `docs/ARCHITECTURE.md` without her OK.** Show exact text before saving any doc change.
- Cost numbers in the designs (e.g. "usually 1.5–4%") are examples, not real data. Keep them as examples.
