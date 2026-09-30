# Architect 2.0: product and screens

How Architect 2.0 looks and feels, screen by screen. The system behind it is in `ARCHITECTURE.md`.

## The problems I hit

**Keep what works today:**
- Plan first → build → one-click deploy.
- Architect already sits on Lyzr Studio, so models, tools, voice and data are already there.

**Fix what I hit while building my own app:**

| What happened to me | What I saw |
|---|---|
| I couldn't tell what the builder was doing | The screen only said "taking actions". One reply was 16 steps behind the scenes |
| I stopped a slow build and my app broke | The half-done work was saved as a commit and marked ready. I had to revert |
| I didn't know where my credits went | ~74% of the month's credits in 4 days, 3 different cost numbers, I didn't find a spending limit |
| I changed the plan but the app's agent didn't change | Agent last updated 24 Sep |
| My agent lived only in Lyzr Studio | Not in the app's code, so a developer can't edit it there |
| My live app got my Lyzr key | So people using my app likely spend my credits (not confirmed) |
| GitHub wanted all my repos | And there is no way to import an existing project |

## Two kinds of users

The one rule I used for every decision:

- **Non-technical users:** everything is on Auto. It should be fast, with only a few controls. They change something only if they want to.
- **Developers:** full control, from the screen and from the code.

These are not two account types. They are two settings (see below): **Developer view** and **Review changes**.

**Same screens in both views.** Developer view never moves or replaces anything on a screen. It only adds details, and each one is marked with a small blue "Developer view" tag, so it's always clear what a developer gets extra.

| | Default (non-technical) | Developer view + Review changes |
|---|---|---|
| Starts in | Plan mode (new project), Ask mode once it's built | Ask mode |
| Stages | Run on their own, progress shown | Each waits for approval. To reorder or drop a step, edit the plan |
| Changes | Go straight to the main copy, saved as a version, one-click rollback | Made on a copy (branch), main changes only with approval |
| Code | Read-only Code tab. Chat, click on the app, edit text in place | Full code editor + terminal |
| Builder model | Auto, plus Standard / Max | Auto, or pick the exact model |
| Cost | Cost after each step as % of this month's credits, alert at 80%. Paid plans: where the credits went + spending limit | Same, plus steps, tokens and cost per step, limit per project |
| GitHub | Code kept in Architect's GitHub, "Move to my GitHub" any time | Their own repo, every change as a pull request |
| Agents | The Agents tab: a diagram and a side panel, changed by clicking any box or by chat | The same tab, plus the agent's files, exact model and tools, and frameworks |

- **Plans:** normal plans (Free / Pro / Team) + a **Developer add-on**.
  - **Free for everyone:** cost after each step as % of this month's credits, 80% alert, read-only Code tab, Developer view to look (code and agent files, read-only), Review changes on Architect's GitHub, "Move to my GitHub", importing any repo.
  - **Any paid plan (Pro, Team):** where the credits went, as causes in plain words with a tip ("Most of stage 3 came from 3 fix attempts. Tip: describe the expected result more clearly"), and a spending limit (free users can't buy more credits, so their monthly credits are already the limit).
  - **Developer add-on:** edit code + terminal, exact model choice, steps, tokens and cost per step, limit per project, usage report for teams, two-way sync with your own repo (pull requests to it, outside edits come back in).
  - **Team plan:** choosing extra approvers.
  - **Why review is free:** it's a safety feature (it fixes what broke my app) and costs almost nothing (a copy is free, the second preview pauses when idle). I charge for pro control and team value instead. Lovable charges for editing code, Replit and Bolt for picking the model.

### How Architect knows which view to show

- **Nobody is asked "are you a developer?"** I checked the docs of all 9 products in the brief and found none that asks. Lovable and v0 put the code behind a "Code" tab instead.
- **Signals set the starting defaults:**
  - Role at onboarding is "Developer / Engineering" or "Solutions Architect", signing up with GitHub, or importing a repo → developer defaults.
  - Technical words in a prompt ("use LangGraph") → only a suggestion, never a switch.
- **Three levels:**
  1. **Code tab, read-only, for everyone.** Looking changes nothing about how the build runs.
  2. **Developer view** (belongs to the person, works instantly): editor, terminal, agent files, exact model, cost per step. It only shows more. It never pauses anything.
  3. **Review changes** (belongs to the project, starts from the next stage): stages pause for approval, changes go to a copy. Turned on only after a short explainer: "Your builds will pause after each stage until you approve it. Most people don't need this." **Turn on** / **Keep it automatic**.
- **Always one click off:** a "Developer view" chip under your name, and a "Review: on / off" button in the project's top bar. Hovering on it says what it means ("Review off: each step is saved as soon as it's built. Turn on to check and approve each step first.").
- **Free plan:** everything is visible, and the paid parts are marked "Developer add-on" (Lovable does the same: free users see code as read-only). Free users see, paid users do.

### Switching in the middle of a build

Example: the meal app has 5 stages (database → login → meal suggestions → inventory → screens). I turn on both settings during stage 3.

| When | Settings stay off | Turned on during stage 3 |
|---|---|---|
| Stages 1–2 | Saved to main | Same, already done |
| Moment of the switch | — | Code, agent files and tokens appear at once. Banner: "Review starts after meal suggestions" |
| Stage 3 finishes | Saved to main, stage 4 starts | Saved to main (it started under the old rule) |
| Stage 4 | Built on main, stage 5 starts | Built on a copy, then pauses: "Stage 4 (inventory) is ready. All 5 checks passed. **Continue** · See what changed" |
| Stage 5 | Built on main. Done | Built on a copy, pauses, then merged. Done |
| Press Stop in stage 5 | Work saved as a version, one click back | Main untouched. Copy: "Continue later" / "Throw away" |

**Rules:**
- **Review changes switches only between stages.** A stage is the smallest finished unit (code → tests → version). Switching in the middle of one would leave half on main and half on a copy.
- **The editor is read-only while a stage runs**, but shows the files changing live. To edit, press Stop: the editor shows what was done so far. Stopped work is marked **"Stopped · not tested"**, never "ready" (today a stopped build was marked ready and my app broke). "Continue" → the AI carries on from my edits and the tests run.
- **Turning review off with changes waiting:** "2 changes are waiting for review. Approve, throw away, or keep them waiting."
- **Own repo with a locked main on GitHub:** review can't be turned off. GitHub requires a pull request for every change. On the free plan, Architect works on a copy in its own GitHub and the user's repo isn't touched. Sending pull requests back is the paid two-way sync.
- **Teams:** the owner and the people they pick can approve (picking approvers is part of the Team plan). Others' changes go for review: "Sent for review to Rahul." An approver in the default view sees the change report and **Continue**, not code.
  - **Two people working at once:** with review on, each person works on their own copy, so they never see or overwrite each other's work. The copies meet only when approved; if both changed the same lines, the same choice as for GitHub appears (see both, keep one, or let AI suggest). With review off, changes go one at a time: "Rahul's change is being built. Yours starts next."
- **Terminal (Developer add-on):** any command that changes the code (e.g. installing a package) is saved as a version, so it can be undone. Commands that only look (listing files, running checks) don't create versions.
- **Where code lives** doesn't change with these settings. "Move to my GitHub" is always its own step.

## Writing on screen

- Plain words. No technical terms in the default view.
- Screens say what the user can do or what just happened, not the rules behind it. For example, "Plan saved. Step 3 changed, step 6 Favourites added, 3 new checks", not "Steps and checks follow the plan".
- Facts, not promises. For example, "anyone with access to the repo may have seen it", not "your key is exposed".
- Every button that isn't obvious has a hover tip (Select, Try as a user, Review, the page picker, Automations).

## The project workspace (layout)

Today's Architect, Lovable, v0 and Bolt all use chat on one side and the app on the other, with equal weight. The brief asks not to copy that, so I started from what a person needs in a project, most important first: (1) where am I and what's happening, (2) is anything waiting for me, (3) see my app, (4) tell it what I want, (5) sometimes go deeper.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Abhi Kya Banega          Plan ✓ ── Build ● ── Test ── Live [ Deploy ]│
│ Version 12 · saved 2 min ago ▾                     Review: off       │
├──────────┬─────────────────────────────────────────┬─────────────────┤
│ App      │ Building step 3 of 5 · Used 3% … [Stop] │ ⚑ NEEDS YOU (1) │
│ Plan     │                                         │ Step 4 is ready │
│ Agents   │   MAIN AREA = what matters now          │ [Continue]      │
│ Tests    │                                         ├─────────────────┤
│ Database │                                         │ CHAT            │
│ Code     │                                         │ Ask·Plan·Build  │
│          │                                         │ [ Ask for… ↑ ]  │
│ Credits  │                                         │                 │
│ Project  │                                         │                 │
│ settings │                                         │                 │
│ IG  ☾    │                                         │                 │
└──────────┴─────────────────────────────────────────┴─────────────────┘
```

- **Journey bar:** Plan → Build → Test → Live, always visible. Test = the whole-app checks at the end. After going live, a new change shows as "Live ✓ · Changing: Build ●", so it's clear the live app is safe. Each stage opens its view.
- **Left rail** (replaces the main sidebar inside a project): ← Projects, then App, Plan, Agents, Tests, Database, Code. At the bottom: Credits ("On track · 12% used", opens the usage page), Project settings, and your name with the ☾ / ☀ theme button (and the "Developer view" chip when it's on). It shrinks to icons.
- **Same bottom-left corner on every screen,** at home and inside a project: Credits, Settings, your name, the theme button.
- **Versions** sit under the project name in the top bar. Clicking "Version 12 · saved 2 min ago ▾" opens the recent versions, with "See all versions" at the bottom.
- **Main area follows the journey:** planning → the plan, building → the app filling in, after a step → checks and changes, before going live → the deploy check. It only switches by itself if I haven't clicked elsewhere; otherwise a small note says "Step 3 done · See result".
- **Right panel:** "Needs you" on top (most urgent first: something broke, a step to approve, a plan or test change, a key needed, new changes on GitHub, credits running low; at most 2 shown; hidden when empty), chat below. About 380 px, can be widened, expanded or closed (the count then shows on the journey bar).
- **Keeping the chat light:** finished steps fold into one line ("Step 1–2 done ✓ · 14 messages ›"), work in progress is one line that opens, "Jump to latest" when scrolled up, the typing box grows to about 6 lines, and a long paste becomes an attached file ("pasted-text.md · 3,200 words").
- **Developer view:** the same layout, with editable code in the main area and a terminal drawer at its bottom.

## Home and onboarding

- **Sign up:** Google, GitHub or email. Signing up with GitHub is one of the signals for developer defaults.
- **Onboarding:** name and "What do you do?" (optional). No "are you a developer?" question; the role only sets defaults.
- **Sidebar:** the workspace menu, then Home, Projects, Agents, Explore, Help & Learn. At the bottom: Credits, Settings, your name and the theme button.
- **Workspace menu:** your workspaces (personal, team) with the plan, people, number of projects and credits for each, then Workspace settings, Invite people, Create a workspace. Each workspace has its own projects, agents, credits, people and GitHub connection.
- **Projects:** search, filters (All / Live / Building / Not built yet / Setting up), and a card per project with its status, last edit, version and credits used. Import from GitHub and New project at the top.
- **Agents (home):** every agent in the workspace, with its framework, the project it's in, how this week went and credits, plus the list of Automations.
- **Credits in calm words:** "On track · 12% used" or "Running low · 74% used". Never a raw number.
- **Builder model picker:** Auto (recommended) / Standard / Max, with "Max uses more credits per stage". "Pick an exact model" is shown locked with a "Developer add-on" label.

## New project: Refine

- **Refine:** the planner shows what it understood from the prompt (name, what it does, target user, app type, the app's AI, theme) and asks only what's missing. Nothing is built yet.
- **App type:** Website or Phone app.
- **Developer view:** the same screen, with two dropdowns added to the app's AI card: **Framework** (Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, Vercel AI SDK) and **Model**.

## The plan

- **Two views, one switch:** Summary (what the app does, the steps, the app's AI, the mockup) and Full plan (the whole document).
- **The full plan always has the same 10 sections:** What it does, Who uses it, What people can do, Screens, The app's AI, What it saves, Keys it needs, Build steps and checks, Not in this version, Open questions. A list on the left jumps between them, and the page scrolls. It's stored as plan.md and shown as a formatted page, the way GitHub shows a README. Developers can open the raw plan.md in the Code tab.
- **The plan and the steps always match. The plan is the final word, and the build uses only what's in it.**
  - Editing it yourself: Edit → type → Save. The steps and checks update straight away, with no confirmation. A line says what changed: "Plan saved. Step 3 changed, step 6 Favourites added, 3 new checks."
  - A change suggested in chat shows in green in the plan and in a "Suggested plan change" card in Needs you (Accept / Reject). It isn't in the plan, and isn't built, until accepted.
  - Nobody reorders or skips steps separately; to do that, you edit the plan.
- **Steps are clickable.** A side panel shows what the step builds, where you'll see it, and its checks ("Not run yet"). In Developer view the same panel adds the files it will create or change, the models, and what it uses from earlier steps. The summary also shows one extra line per step in Developer view (files and builder model).
- **Each step shows a cost range, in both views:** "usually 1.5–4% of this month's credits", and the whole plan too ("usually 6–15%"). The range comes from what similar steps cost in past builds on Architect (the AI gateway records tokens per step). The top of the range allows for a few fix attempts; it can still be more if fixes are needed. After each step, the real cost is shown. Replit, for comparison, shows no estimate and charges per checkpoint after the work is done.
- **Open questions have a default answer** ("If you don't answer, the plan uses 'Only today'"), so the build never waits on them.
- **Confirm plan and build** is at the top and at the end of the plan ("I'll build what's in this plan: 5 steps and 12 checks. It usually uses 6–15% of this month's credits."). Going through each step first is optional. If a suggested change is still waiting, a pop-up says so and points to Needs you: **Show me in Needs you** / **Build without it**.
- **Download:** PDF (to read or share), Word (to edit) or Markdown (the same text as plan.md). It downloads the plan as it is now, without suggestions you haven't accepted. Today it downloads in one format only, not as PDF.
- **The mockup stays in the Plan tab.** Preview only ever shows the real, running app, so the two are never confused. Before the first build, Preview says "Nothing built yet. See the mockup in Plan."

## Chat and modes

- A change request in Ask mode gets "This would change your app. Plan it first, or build it now?" instead of an error. A big request in Build mode gets "This is a bigger change. Want to see the plan first?"
- **The + in the chat box:** Add files (docs, spreadsheets, PDFs the app should use), Add a photo (e.g. your fridge or a sketch), Design reference (a screenshot, website link or Figma file), Connect an app (Gmail, Slack, Google Sheets and more), Notes for the AI (how it should build, e.g. AGENTS.md).
- **Builder model chip** next to the modes: Auto / Standard / Max. A change applies from the next step.
- Cost is shown on step cards ("Step 3 done ✓ · used 1% of this month's credits"), not on every reply, so the chat stays calm.
- After 3 failed fixes, the chat says "I couldn't fix this in 3 tries" with **Try another way**, **Show me the problem** (plain words, e.g. "the app isn't reading yesterday's meals") and **Change the check** (a test change you must accept).

## Tests

- Checks are written with the plan, a few per step, and live in their own Tests tab. Inside the plan they would get lost.
- They're grouped by step, plus "Whole app" checks that run at the end and again before going live. A check for a step that isn't built yet says "Not run yet", never "Failed".
- The AI can't quietly change a check. It asks: "The AI wants to change a check · 'Shows exactly 3 meals' → 'Shows up to 3 meals' · Reason: …" with Accept / Reject.

## While it builds

- **The top line says where it is and what it has used:** "Building step 3 of 5: meal suggestions · Used 3% of this month's credits so far · Stop".
- **While it builds, Preview shows the result of every step, not a spinner** (today it says "Cooking up your results"):
  - Database → "Your app can now save: households, kitchen items, meals", with one example row each.
  - Login → a login box you can try.
  - The app's AI → a live test: "Rice, dal, aloo, tomato. Dinner for 4?" and its 3 meals.
  - Inventory → "Try it: type '2 kg atta aaya'".
  - Screens → the real screen fills in piece by piece: finished parts, "Writing this now", then grey "Coming next" outlines.
  - Why: I see what it's doing, and I can press Stop early if it's going the wrong way.
- **Waiting and leaving:** "Starting your build…" (after 20 seconds: "Lots of builds right now, yours starts in about a minute"), "Waking up your app…" with no Resume button. The build keeps going if I close the tab, and a browser notification (or email, if chosen) says when it's ready.

## Preview

- **Preview toolbar:** **Page: Today ▾** (which page of your app you're looking at), Desktop / Phone, **Select** (click any part → "Change this…", double-click text to edit in place; today's Select button is disabled), See before (review on), Open in new tab, and Restart app in a small menu (replaces the big "Refresh Sandbox"). Each button has a hover tip.
  - **Try as a user:** opens the app already signed in as a test user with sample data (a family, kitchen items, past meals). Today the app seeded data behind the scenes (`/api/seed`) and I still had to sign up to my own app.
  - **Errors in plain words:** a non-developer sees "This page had a problem loading the meals. [Fix it]" instead of a console with warning counts. Developers keep the console and logs in the terminal drawer.

## Versions

- **Where:** under the project name in the top bar ("Version 12 · saved 2 min ago ▾" opens the recent versions and "See all versions"), and a version card in the chat after each step. Today, saved versions are hidden in a menu and need a linked GitHub.
- **The list:** names from the change (renamable), badges **Live**, **Stopped · not tested**, **★ Pinned** (pin a milestone, like Rocket's labels), and **See what changed** / **Go back** on each.
- **Going back makes a new version** (v13 = a copy of v11), so nothing is lost and it can be undone. It says: "The plan, the code and the app's AI go back. Your app's data stays."
- **Change report:** what changed in plain words, which parts (plan / code / app's AI), checks before → after (a check that used to pass and now fails shows in red: that's the "This may have broken X" warning), any test change to accept, and the cost.
- **Developer view** adds a **Changed files** tab. Clicking a file, or "Open in Code", opens it in the Code editor at the change.

## Cost and usage

- One unit everywhere: **% of this month's credits** (today I saw 3 different numbers).
- Everyone: cost after each step in simple words ("used 4% of this month's credits"), alert at 80%.
- Everyone, in calm words: the sidebar says "On track · 12% used" or "Running low · 74% used". The usage page adds a forecast: "You may run out before your credits refresh on Oct 24." (Claude's own usage page opens with a line like this: "On track. You should reach today's reset with room to spare.") With my credits (74% gone in 4 days), a forecast would have warned me around day 2, not at 80%.
- Paid plans: where the credits went, as causes in plain words with a tip (like Claude Code's `/usage`, which flags causes such as "long context" with a tip, instead of raw token counts), and a spending limit.
- Developer add-on: steps, tokens and cost per step, limit per project.
- **One usage page, in Architect** (today the numbers are scattered: Architect's usage page, the builder's top bar, Lyzr billing, and Lyzr Studio's monitoring, which I only found late). Free for everyone: the forecast line, the % bar, **usage by project**, and **building vs your live apps** ("Building: 50% · Your apps' AI, when people use them: 24%"). My app's scheduled runs used credits even when I wasn't building, and nothing in Architect showed it.
- **Before a build: a range, not a number.** Each step and the whole plan show "usually X–Y%", from similar steps in past builds. A single number up front would only be a guess, because the cost depends on how many fixes the AI needs.

## Agents

- **Designing agents by prompting:** the plan has a section on the app's AI in plain words (what it does, what it can't do, when it runs). Developer view adds the framework and model in Refine.
- **The Agents tab.** Architect's founder describes Architect as custom GPTs + n8n-style workflows + Lovable in one. Today the workflow part is invisible, so 2.0 makes it first-class.
  - **Left list:** the app's agents, and **Automations** (things that run on their own on a schedule), each with a dot showing whether the last run worked.
  - **Agent:** an editable diagram, like today's Agents tab: When → Agent → Can use → Reply. Click any box to change it in a side panel: what it does, what it must never do, what it can use, and quality (Faster & cheaper / Best quality). Can also be changed by chat.
  - **Agent tests are optional:** a "Run agent tests" button with its rough cost ("5 questions · ~0.2% of this month's credits") and an ⓘ that explains them: 5 sample questions, 3 everyday ones, 1 tricky one and 1 the agent must refuse. They're separate from the app's checks in the Tests tab. Saving never runs them by itself.
  - **Developer view:** the same diagram and panel, plus a Files tab, which file each field is saved in (SOUL.md, RULES.md), the tool actions, the exact model and a backup model, Try it and traces.
  - **Automation:** a top-to-bottom flow (Trigger → steps → agent → action). Each step shows its last-run status, the last 7 runs show as dots, and the cost per run is shown. Click a step to fix it, e.g. "Notify family failed on the last 4 runs: notifications aren't allowed on the family's devices" → send by email too. Run now and Pause.
- **Add an agent:**
  1. **Make a new one:** describe what it should do.
  2. **Use one of my agents:** from this workspace or Lyzr Studio.
  3. **Bring in an agent I already have:** paste its link and key. If Architect can read it (instructions, model, tools), it copies it into your code, so it can be changed here like any other agent. If it can't, it connects to it instead: the agent still works in the app, but can only be changed where it lives.
  4. **Developer view adds "Build it in code":** pick a framework (Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, Vercel AI SDK, or your own code).
- **Any framework, shown the same way:** a LangGraph agent found in an imported project, or a CrewAI crew of three agents, use the same diagram and panel, with the framework's own parts in plain words (e.g. a CrewAI agent's role, goal and task).

## Database

- **Two sets of data per app.** Test data is used by the preview and by the AI while it builds. Live data is used only by the live app. The AI can never change live data (Replit has the same rule: "Agent is not able to modify the production database").
- **A switch at the top: Test data | Live data.**
  - Test data can be changed. Before the app goes live it's sample data. After it's live, "Refresh with live data" makes a copy with names, emails and phone numbers replaced by made-up ones.
  - Live data is view only. Asked to change it, the AI says it can't and offers a way that works (e.g. adding a button to the app).
- New tables or columns reach live data when you deploy.
- Not confirmed: replacing personal details in a copy is proven for Postgres (Neon). Architect stores data in MongoDB today; I haven't checked it there.

## Keys & passwords

- The screen is a list: name, a note on what it's for, Preview / Live, added by, added on, last used, and **Replace** / **Delete** (no "show"). Hover text: "For security, saved keys can't be shown again. To change one, replace it." Deepgram's API keys screen works the same way ("secrets are not recoverable").
- A key found in an imported repo: "We found an OpenAI key in `.env` in your repo. It's saved in your GitHub history, so anyone with access to the repo may have seen it. Replace it with a new key." **[Replace it]** · Not now. Then: create a new key at the provider (link), paste it here, delete the old one there.

## Import

- **The flow:** pick the repo from Home, then everything happens inside the new project: add its keys, then check the plan.
- **"Here's what we think your app does" uses the same design as the plan:** the same 10 sections, written from the code (screens found, agents found, what it saves, keys, what works today, notes for AI tools, open questions). **The user must confirm it before building**, because every build and every check depends on it. It's quick: **Looks right** in one click, or **Fix it by chat**. Until then, Ask mode works (questions about the code change nothing).
- **Developer view turns on** after an import: "Developer view is on because you imported a project · Turn off".
- **Coming back later:** if you leave before finishing, Home says what's left: "OrderBook is imported. 2 things left before you can build" with a checklist and **Continue setup**.

## GitHub

- **Connecting:** through the GitHub App, and you pick the repos. "Only these repos" is the default, so Architect can't see or change anything else. Today it asks for all repos.
- **Move to my GitHub:** connect → name the new repo (private) → move the code with its full history. Nothing changes in how you build. Free on every plan.
- **Edits made outside Architect come in when the developer says so, never automatically.** GitHub tells Architect about new changes, and they show where the work happens: a card in Needs you ("3 new changes on GitHub"), a badge on the Code tab, and a bar at the top of Code with **Get latest**. Before a build or a pull request, it reminds: "Your copy is 3 changes behind GitHub. Get latest first?"
  - Clicking **Get latest**: changes in different places are combined by git. Changes to the same lines ask the developer: **See both · Keep GitHub's · Keep Architect's · Let AI suggest a combined version** (the suggestion is shown as a change to approve, never applied on its own).

## Deploy

- **If the live check fails, the previous version stays live automatically.** "The new version didn't load, so we kept the previous one live. See why · Try again." People using the app never see a broken version.
- **The button says what it will do:** "Deploy" (first time) → "Deploying…" → "Live ✓" (nothing new; opens the link, share and go back) → "Deploy latest changes" (changes made since the last deploy). Today nothing tells you whether your latest changes are live.
- **Deploy panel:** app info from the plan (editable), optional "Check the live version first?", optional agent checks with cost shown, then live progress: checks → live keys → data → publish → live link check → Live ✓. Kept from today: custom web address, share buttons, marketplace listing, take offline.

## Settings

- **Project settings:** General, Passwords and keys, GitHub, Your app's AI, Team and review, Danger zone.
- **Your app's AI, who pays:** Architect's AI (uses your credits, nothing to set up) or your own key (billed by the provider). Your live app never holds your key; its AI goes through Architect. Limits: a monthly budget for this app (when it's reached, the AI pauses and the app stays live), a limit per person ("20 meal ideas a day"), and an alert at 80%. It also shows this month's use: how many people, % of credits, and the top user.
- **Team and review:** turn review on or off, what's waiting for review, the people on the project and who can approve, and how two people working at once is handled.
- **Account settings:** Appearance, Developer view, profile, GitHub, build-finished alerts (browser or email), and your plan with the Developer add-on.

## Dark mode

- A ☾ / ☀ button next to your name, bottom-left, on every screen. Also Light / Dark / Match my computer in Account settings.
- Dark is warm charcoal, not black.
- It changes Architect's screens. The preview shows the app as its users would see it on a device with the same setting: dark if the app has a dark mode, light if it doesn't. The preview's ⋯ menu has Light / Dark, to check both.
- The code editor has its own theme setting (Developer view). It follows the app theme by default.
