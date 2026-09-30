# Design screens

Every screen from Isha's design file (https://claude.ai/artifact/WiCUUTWd68faqafhexsANj), exported 30 Sep.

- `screens/`: a picture of each screen (1440 px wide, desktop). Fonts in the pictures are stand-ins; the real ones are Geist (text), Instrument Serif (headings) and Geist Mono (code).
- `source/`: each screen's HTML source (`.dc.html`) and `canvas.json` (titles and order). `FORMAT.md` explains the file format. Tooltips shown open in some pictures are hover tips in the real app.
- `theme-preview/`: the calmer dark theme agreed on 30 Sep (the design file's dark screens S3–S5 are replaced by it).

The design file is the source of truth for layout and wording. `docs/PRODUCT.md` says how each screen behaves and why.

## A · Build by prompting

| Screen | Picture | Source |
|---|---|---|
| A1 · Sign up | [png](screens/A1-Main.png) | [html](source/Main.dc.html) |
| A2 · Onboarding | [png](screens/A2-Onboarding.png) | [html](source/Onboarding.dc.html) |
| A3 · Home | [png](screens/A3-Home.png) | [html](source/Home.dc.html) |
| A4 · Home · builder model | [png](screens/A4-HomeModel.png) | [html](source/HomeModel.dc.html) |
| A5 · Refine | [png](screens/A5-Refine.png) | [html](source/Refine.dc.html) |
| A6 · Refine · Developer view | [png](screens/A6-RefineDev.png) | [html](source/RefineDev.dc.html) |
| A7 · Plan · summary (a plan change waiting) | [png](screens/A7-WorkPlan.png) | [html](source/WorkPlan.dc.html) |
| A7.1 · Plan · full plan (read the whole plan) | [png](screens/A7.1-WorkPlanFull.png) | [html](source/WorkPlanFull.dc.html) |
| A7.2 · Plan · editing | [png](screens/A7.2-WorkPlanEdit.png) | [html](source/WorkPlanEdit.dc.html) |
| A7.3 · Plan · saved, steps and checks updated | [png](screens/A7.3-WorkPlanSaved.png) | [html](source/WorkPlanSaved.dc.html) |
| A7.4 · Plan · download (PDF, Word, Markdown) | [png](screens/A7.4-WorkPlanDownload.png) | [html](source/WorkPlanDownload.dc.html) |
| A7.5 · Plan · a step’s details | [png](screens/A7.5-WorkPlanStep.png) | [html](source/WorkPlanStep.dc.html) |
| A7.6 · Plan · a step’s details · Developer view | [png](screens/A7.6-WorkPlanStepDev.png) | [html](source/WorkPlanStepDev.dc.html) |
| A7.7 · Confirm while a suggestion waits | [png](screens/A7.7-WorkPlanConfirm.png) | [html](source/WorkPlanConfirm.dc.html) |
| A8 · Plan · Developer view (same screen, more detail) | [png](screens/A8-WorkPlanDev.png) | [html](source/WorkPlanDev.dc.html) |
| A9 · Chat · + menu | [png](screens/A9-WorkChatPlus.png) | [html](source/WorkChatPlus.dc.html) |
| A10 · Chat · builder model | [png](screens/A10-WorkModel.png) | [html](source/WorkModel.dc.html) |
| A11 · Building (step 3 result) | [png](screens/A11-WorkBuilding.png) | [html](source/WorkBuilding.dc.html) |
| A12 · Ask mode catches a change | [png](screens/A12-WorkAskCatch.png) | [html](source/WorkAskCatch.dc.html) |
| A13 · Select to change · phone | [png](screens/A13-WorkSelect.png) | [html](source/WorkSelect.dc.html) |
| A14 · Developer view on mid-build | [png](screens/A14-WorkDevSwitch.png) | [html](source/WorkDevSwitch.dc.html) |
| A15 · Step waiting · Developer view | [png](screens/A15-WorkReview.png) | [html](source/WorkReview.dc.html) |
| A16 · Code read-only while a step runs | [png](screens/A16-WorkCodeLocked.png) | [html](source/WorkCodeLocked.dc.html) |
| A17 · Code · Developer view | [png](screens/A17-WorkCode.png) | [html](source/WorkCode.dc.html) |
| A18 · Stop | [png](screens/A18-WorkStop.png) | [html](source/WorkStop.dc.html) |
| A19 · Stopped · Developer view | [png](screens/A19-WorkStopDev.png) | [html](source/WorkStopDev.dc.html) |
| A20 · Couldn't fix in 3 tries | [png](screens/A20-WorkStuck.png) | [html](source/WorkStuck.dc.html) |
| A21 · Tests | [png](screens/A21-WorkTests.png) | [html](source/WorkTests.dc.html) |
| A22.1 · Recent versions (from the top bar) | [png](screens/A22.1-WorkVersionsMenu.png) | [html](source/WorkVersionsMenu.dc.html) |
| A22 · Versions | [png](screens/A22-WorkVersions.png) | [html](source/WorkVersions.dc.html) |
| A23 · Versions · Developer view | [png](screens/A23-WorkVersionsDev.png) | [html](source/WorkVersionsDev.dc.html) |
| A24 · Database · test data (a copy you can change) | [png](screens/A24-WorkDatabase.png) | [html](source/WorkDatabase.dc.html) |
| A24.1 · Database · live data (view only) | [png](screens/A24.1-WorkDatabaseLive.png) | [html](source/WorkDatabaseLive.dc.html) |
| A25 · Home · returning user | [png](screens/A25-HomeReturning.png) | [html](source/HomeReturning.dc.html) |
| A26 · Home · workspace menu | [png](screens/A26-HomeWorkspace.png) | [html](source/HomeWorkspace.dc.html) |
| A27 · Projects | [png](screens/A27-Projects.png) | [html](source/Projects.dc.html) |
| A28 · Agents (all projects) | [png](screens/A28-HomeAgents.png) | [html](source/HomeAgents.dc.html) |

## B · Import a project

| Screen | Picture | Source |
|---|---|---|
| B1 · Home · + menu | [png](screens/B1-HomePlus.png) | [html](source/HomePlus.dc.html) |
| B2 · Connect GitHub | [png](screens/B2-ImportConnect.png) | [html](source/ImportConnect.dc.html) |
| B3 · Pick the repo | [png](screens/B3-Import.png) | [html](source/Import.dc.html) |
| B4 · Passwords and keys | [png](screens/B4-ImportKeys.png) | [html](source/ImportKeys.dc.html) |
| B5 · Here’s what we think your app does (same design as the plan) | [png](screens/B5-ImportPlan.png) | [html](source/ImportPlan.dc.html) |
| B6 · Later: back on Home, setup not finished | [png](screens/B6-HomeImported.png) | [html](source/HomeImported.dc.html) |

## C · Agents in any framework

| Screen | Picture | Source |
|---|---|---|
| C1 · Agent (plain words) | [png](screens/C1-WorkAgents.png) | [html](source/WorkAgents.dc.html) |
| C2 · Agent · Developer view (same screen, more detail) | [png](screens/C2-WorkAgentsDev.png) | [html](source/WorkAgentsDev.dc.html) |
| C3 · Agent as files · Try it · traces | [png](screens/C3-WorkAgentFiles.png) | [html](source/WorkAgentFiles.dc.html) |
| C4 · Workflow · 9 PM automation (a step failed) | [png](screens/C4-WorkWorkflow.png) | [html](source/WorkWorkflow.dc.html) |
| C5 · Imported LangGraph agent (CookBridge) | [png](screens/C5-WorkAgentImported.png) | [html](source/WorkAgentImported.dc.html) |
| C6 · Your app's AI · who pays and limits | [png](screens/C6-WorkSettingsAI.png) | [html](source/WorkSettingsAI.dc.html) |
| C7 · Add an agent (bring in one you already have) | [png](screens/C7-WorkAgentAdd.png) | [html](source/WorkAgentAdd.dc.html) |
| C7.1 · Add an agent · Developer view (build it in code) | [png](screens/C7.1-WorkAgentNew.png) | [html](source/WorkAgentNew.dc.html) |
| C8 · A CrewAI crew (Leave Request Bot) | [png](screens/C8-WorkAgentCrew.png) | [html](source/WorkAgentCrew.dc.html) |

## D · Connect GitHub

| Screen | Picture | Source |
|---|---|---|
| D1 · Connect GitHub · choose repos | [png](screens/D1-GitConnect.png) | [html](source/GitConnect.dc.html) |
| D2 · Move to my GitHub | [png](screens/D2-GitMove.png) | [html](source/GitMove.dc.html) |
| D3 · Changes on GitHub · Get latest | [png](screens/D3-WorkSettings.png) | [html](source/WorkSettings.dc.html) |
| D4 · Same lines changed in both places | [png](screens/D4-GitClash.png) | [html](source/GitClash.dc.html) |
| D5 · New changes on GitHub while you work | [png](screens/D5-WorkGitChanges.png) | [html](source/WorkGitChanges.dc.html) |

## E · Deploy

| Screen | Picture | Source |
|---|---|---|
| E1 · Going live | [png](screens/E1-WorkDeploy.png) | [html](source/WorkDeploy.dc.html) |
| E2 · Live ✓ | [png](screens/E2-WorkLive.png) | [html](source/WorkLive.dc.html) |
| E3 · Live check failed · previous version kept | [png](screens/E3-WorkLiveFailed.png) | [html](source/WorkLiveFailed.dc.html) |
| E4 · Deploy latest changes | [png](screens/E4-WorkDeployLatest.png) | [html](source/WorkDeployLatest.dc.html) |

## Settings, usage and dark mode

| Screen | Picture | Source |
|---|---|---|
| S1 · Credits and usage | [png](screens/S1-Usage.png) | [html](source/Usage.dc.html) |
| S2 · Account settings | [png](screens/S2-Account.png) | [html](source/Account.dc.html) |
| S3 · Dark · Home | [png](screens/S3-HomeDark.png) | [html](source/HomeDark.dc.html) |
| S4 · Dark · Building (the app keeps its own colours) | [png](screens/S4-WorkBuildingDark.png) | [html](source/WorkBuildingDark.dc.html) |
| S5 · Dark · Code | [png](screens/S5-WorkCodeDark.png) | [html](source/WorkCodeDark.dc.html) |
| S6 · Project settings · Team and review | [png](screens/S6-WorkSettingsTeam.png) | [html](source/WorkSettingsTeam.dc.html) |
