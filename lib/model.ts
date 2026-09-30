/* Everything a project holds, and how a pretend build moves forward.
   Pure functions only, so the same code runs for the demo (saved in the browser)
   and for signed-in accounts (saved in Supabase). Nothing here calls an AI:
   plans are ready-made, filled in with the app's name. */

export type Stage = "plan" | "build" | "test" | "live";
export type StepKind = "data" | "login" | "ai" | "feature" | "screens";

export type Step = {
  title: string;
  sub: string;
  kind: StepKind;
  checks: string[];
  /** "0.5–2" → shown as "usually 0.5–2%". Examples, not real data. */
  cost: [number, number];
  builds: string;
  where: string;
  files: string[];
  uses?: string;
  /** Marked green when it came from a suggestion or an edit. */
  added?: "suggested" | "edited";
  /** Text added to the sub line by an accepted suggestion. */
  extra?: string;
};

export type Plan = {
  tagline: string;
  what: string;
  why: string;
  people: [string, string][];
  can: string[];
  screens: { label: string; title: string; sub: string }[];
  ai: { name: string; does: string; reads: string; cant: string; runs: string; cost: string } | null;
  saves: [string, string][];
  keys: [string, string, string][];
  steps: Step[];
  notIn: string[];
  question: { q: string; options: [string, string]; fallback: string };
  wholeApp: string[];
  /** Only for imported projects: what was found in the code. */
  found?: { stack: string[]; works: [string, boolean, string?][]; notes: string; paths: string[]; repo: string };
};

/** A change the AI suggests in chat. It isn't in the plan until accepted. */
export type Suggestion = {
  lines: string[];
  step: Step;
  changeStep?: { index: number; extra: string };
  can: string[];
  saves: [string, string][];
  check: string;
};

export type Version = {
  n: number;
  title: string;
  at: number;
  summary: string;
  parts: string[];
  checks: [string, string, string][];
  cost: string;
  files: string[];
  badge?: "live" | "stopped";
  pinned?: boolean;
  /** What the project looked like at this version, so "Go back" can restore it. */
  snap?: { plan: Plan; stepsDone: number };
};

export type ChatItem =
  | { id: string; type: "user"; text: string }
  | { id: string; type: "ai"; text: string; actions?: ("plan-first" | "build-now" | "see-plan")[] }
  | { id: string; type: "step"; title: string; detail: string }
  | { id: string; type: "version"; n: number; text: string }
  | { id: string; type: "fold"; text: string };

export type Build = {
  /** "waiting": Review is on, and a finished step waits for approval before the next one. */
  status: "idle" | "running" | "waiting" | "stopped" | "checking" | "done";
  /** Index of the step being built. */
  step: number;
  since: number;
};

export type Template = {
  entity: string;
  items: { title: string; sub: string; meta: string }[];
  aiTest: string;
  heading: string;
  eyebrow: string;
  action: string;
};

export type Project = {
  id: string;
  name: string;
  idea: string;
  kind: "meal" | "generic";
  appType: "Website" | "Phone app";
  target: string;
  instructions: string;
  theme: number;
  plan: Plan;
  planVersion: number;
  suggestion: Suggestion | null;
  suggestionSeen: boolean;
  answer: string | null;
  stage: Stage;
  build: Build;
  stepsDone: number;
  creditsUsed: number;
  versions: Version[];
  chat: ChatItem[];
  template: Template;
  deploy?: Deploy;
  /** Set for projects brought in from GitHub (designs B3–B6). */
  imported?: { repo: string; setup: "keys" | "plan" | "done"; keyReplaced: boolean };
  /** The 9 PM automation's failing step was fixed (design C4). */
  automationFixed?: boolean;
  /** Review changes (design S6). */
  reviewOn?: boolean;
  /** Saved changes to an agent (design C1), by agent key. */
  agentEdits?: Record<string, { does: string; never: string; tools: boolean[] }>;
  /** GitHub (designs D1–D5). */
  github?: { repo: string; own: boolean; behind: number; clash: boolean };
  createdAt: number;
  updatedAt: number;
};

/** Going live (designs E1–E4). */
export type Deploy = {
  status: "deploying" | "live" | "failed" | "offline";
  since: number;
  /** The version being deployed. */
  target: number;
  liveVersion: number | null;
  history: { n: number; title: string; at: number }[];
  liveKey: boolean;
  failedVersion?: number;
};

export const STEP_MS = 5000;
export const DEPLOY_STEP_MS = 1300;
export const DEPLOY_STEPS = 6;
export const CHECK_MS = 4000;

/** "The app’s AI" → "the app’s AI" (lower-cases only the first letter). */
export const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- Understanding a prompt (no AI: simple word rules) ---------- */

const mealWords = /\b(meal|meals|kitchen|cook|cooking|dinner|recipe|recipes|fridge|khana)\b/i;
const aiWords = /\b(agent|assistant|ai|summar\w*|answer\w*|suggest\w*|draft\w*|chat\w*|bot|tag\w*|reads?|writes?)\b/i;
const phoneWords = /\b(phone app|mobile|android|iphone|ios app)\b/i;

export function isMealIdea(idea: string) {
  return mealWords.test(idea);
}

export function needsAI(idea: string) {
  return mealWords.test(idea) || aiWords.test(idea);
}

export function detectAppType(idea: string): Project["appType"] {
  return phoneWords.test(idea) ? "Phone app" : "Website";
}

const small = new Set(["a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "my", "our"]);

/** "A PRD assistant that drafts specs from Slack threads" → "PRD Assistant". */
export function nameFromIdea(idea: string) {
  if (isMealIdea(idea)) return "Abhi Kya Banega";
  let s = idea
    .trim()
    .replace(/^(please\s+)?(build|make|create)\s+(me\s+)?/i, "")
    .replace(/^(an?\s+)?(app|website|tool)\s+(for|that|to)\s+/i, "")
    .replace(/^(an?|the)\s+/i, "");
  s = s.split(/\s+(that|which|who|for|to|from|with|where|so|and)\s+|[.,;:!?]/i)[0] ?? s;
  const words = s.split(/\s+/).filter(Boolean).slice(0, 4);
  if (words.length === 0) return "My App";
  return words
    .map((w, i) => (w === w.toUpperCase() && w.length > 1 ? w : i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function whatFromIdea(idea: string) {
  if (isMealIdea(idea))
    return "Suggests three complete Indian meals from what's in the kitchen right now, using inventory updates the family sends in Hinglish or as photos.";
  const t = idea.trim().replace(/^(an?|the)\s+/i, "");
  return t ? t[0].toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? "" : ".") : "";
}

export function instructionsFromIdea(idea: string) {
  return isMealIdea(idea)
    ? "Don't repeat a dish within three days. Keep meals practical for a home cook. Make the day's plan easy to share on WhatsApp."
    : "";
}

export function suggestTarget(idea: string) {
  if (isMealIdea(idea)) return "Families who cook at home with help from a cook";
  return templateFor(idea).target;
}

/* ---------- Made-up content for apps people describe themselves ---------- */

type TemplateDef = Template & { match: RegExp; target: string; noun: string; aiVerb: string; screens: string[]; saves: [string, string][] };

const templates: TemplateDef[] = [
  {
    match: /feedback|interview/i,
    entity: "Interviews",
    noun: "interview",
    heading: "This week’s interviews",
    eyebrow: "FEEDBACK · 3 NEW",
    items: [
      { title: "Priya, clinic manager", sub: "Tags: onboarding, pricing", meta: "Summary ready" },
      { title: "Arjun, school admin", sub: "Tags: reports, exports", meta: "Summary ready" },
      { title: "Meera, café owner", sub: "Tags: billing", meta: "2 quotes saved" },
    ],
    aiTest: "Here’s a 20-minute interview with a clinic manager. What did she ask for?",
    aiVerb: "tags and summarises each interview",
    action: "Share the summary",
    target: "Product teams who talk to users every week",
    screens: ["Inbox", "Interview", "Themes", "Settings"],
    saves: [["Interviews", "Priya, clinic manager, 20 min"], ["Tags", "Onboarding"], ["Quotes", "“Exports take too long”"]],
  },
  {
    match: /prd|spec|requirement/i,
    entity: "Specs",
    noun: "spec",
    heading: "Drafts from Slack",
    eyebrow: "SPECS · 3 DRAFTS",
    items: [
      { title: "Bulk export for reports", sub: "From #product-feedback, 14 messages", meta: "Draft ready" },
      { title: "Dark mode for the app", sub: "From #design, 9 messages", meta: "Draft ready" },
      { title: "Faster sign-in", sub: "From #support, 22 messages", meta: "Needs review" },
    ],
    aiTest: "Turn this Slack thread about bulk exports into a one-page spec.",
    aiVerb: "drafts a spec from a Slack thread",
    action: "Send for review",
    target: "Product managers who plan features in Slack",
    screens: ["Drafts", "Spec", "Threads", "Settings"],
    saves: [["Specs", "Bulk export, draft 2"], ["Threads", "#product-feedback, 14 messages"], ["Reviewers", "Ravi, engineering lead"]],
  },
  {
    match: /question|support|docs|help|faq|customer/i,
    entity: "Questions",
    noun: "question",
    heading: "Ask about our product",
    eyebrow: "HELP CENTRE",
    items: [
      { title: "How do I reset my password?", sub: "Answered from “Account basics”", meta: "Helpful · 12" },
      { title: "Can I export my data?", sub: "Answered from “Exports”", meta: "Helpful · 8" },
      { title: "Do you have an Android app?", sub: "Not in the docs yet", meta: "Sent to the team" },
    ],
    aiTest: "Can I export my data to a spreadsheet?",
    aiVerb: "answers questions from your help docs",
    action: "Ask a question",
    target: "Customers looking for help",
    screens: ["Ask", "Answers", "Docs", "Settings"],
    saves: [["Questions", "Can I export my data?"], ["Docs", "Exports, 3 pages"], ["Feedback", "Helpful, 12 people"]],
  },
  {
    match: /digest|metric|report|weekly|dashboard/i,
    entity: "Reports",
    noun: "report",
    heading: "This week in numbers",
    eyebrow: "WEEKLY DIGEST",
    items: [
      { title: "Sign-ups: 1,240", sub: "Up 8% on last week", meta: "Example data" },
      { title: "Active teams: 312", sub: "Down 2% on last week", meta: "Example data" },
      { title: "Support tickets: 86", sub: "Most about exports", meta: "Example data" },
    ],
    aiTest: "Write this week’s digest from the numbers sheet.",
    aiVerb: "writes the weekly digest from your numbers",
    action: "Email the team",
    target: "Teams who share numbers every week",
    screens: ["This week", "History", "Recipients", "Settings"],
    saves: [["Reports", "Week 39"], ["Numbers", "Sign-ups, 1,240"], ["Recipients", "team@company.com"]],
  },
  {
    match: /leave|holiday|vacation|hr\b/i,
    entity: "Requests",
    noun: "request",
    heading: "Leave requests",
    eyebrow: "WAITING FOR A MANAGER · 2",
    items: [
      { title: "Rahul, 3 days in October", sub: "Fits the policy", meta: "Waiting for Anita" },
      { title: "Sara, 1 day on Friday", sub: "Fits the policy", meta: "Approved" },
      { title: "Dev, 12 days in December", sub: "More than 10 days in a row", meta: "Needs a reason" },
    ],
    aiTest: "Can Rahul take 3 days off from 14 October?",
    aiVerb: "checks each request against the leave policy",
    action: "Ask for leave",
    target: "Employees and their managers",
    screens: ["Requests", "New request", "Policy", "Settings"],
    saves: [["Requests", "Rahul, 14–16 Oct"], ["People", "Rahul, reports to Anita"], ["Policy", "Up to 10 days in a row"]],
  },
  {
    match: /book|appointment|tutor|session|class/i,
    entity: "Bookings",
    noun: "booking",
    heading: "Book a session",
    eyebrow: "THIS WEEK · 3 SLOTS LEFT",
    items: [
      { title: "Tuesday, 5 PM", sub: "Maths, 1 hour", meta: "Free" },
      { title: "Thursday, 6 PM", sub: "Physics, 1 hour", meta: "Free" },
      { title: "Saturday, 11 AM", sub: "Maths, 1 hour", meta: "Booked" },
    ],
    aiTest: "Remind everyone booked tomorrow, by email.",
    aiVerb: "sends reminders before each booking",
    action: "Book this slot",
    target: "Students and their parents",
    screens: ["Book", "My bookings", "Calendar", "Settings"],
    saves: [["Bookings", "Tuesday 5 PM, Aanya"], ["Slots", "Thursday 6 PM, free"], ["Students", "Aanya, Class 9"]],
  },
  {
    match: /lead|sales|crm|campaign/i,
    entity: "Leads",
    noun: "lead",
    heading: "New leads",
    eyebrow: "TODAY · 3 NEW",
    items: [
      { title: "Kiran, Bright Dental", sub: "From the website form", meta: "Score 82" },
      { title: "Joseph, Metro Gyms", sub: "From a webinar", meta: "Score 64" },
      { title: "Asha, Green Cafés", sub: "From a referral", meta: "Score 91" },
    ],
    aiTest: "Score this lead and draft a first email.",
    aiVerb: "scores each lead and drafts a follow-up",
    action: "Send follow-up",
    target: "Sales teams following up on new leads",
    screens: ["Leads", "Lead", "Emails", "Settings"],
    saves: [["Leads", "Kiran, Bright Dental"], ["Emails", "First follow-up, draft"], ["Scores", "82 of 100"]],
  },
];

const fallbackTemplate: TemplateDef = {
  match: /./,
  entity: "Items",
  noun: "item",
  heading: "Your items",
  eyebrow: "EXAMPLE DATA",
  items: [
    { title: "First example", sub: "Added today", meta: "Example" },
    { title: "Second example", sub: "Added yesterday", meta: "Example" },
    { title: "Third example", sub: "Added this week", meta: "Example" },
  ],
  aiTest: "Show me what’s new this week.",
  aiVerb: "helps with the main task",
  action: "Add an item",
  target: "People who will use it every day",
  screens: ["Home", "Details", "History", "Settings"],
  saves: [["Items", "First example"], ["People", "You, owner"], ["Notes", "Added today"]],
};

function templateFor(idea: string): TemplateDef {
  return templates.find((t) => t.match.test(idea)) ?? fallbackTemplate;
}

export const mealTemplate: Template = {
  entity: "Meals",
  heading: "Dinner ke liye?",
  eyebrow: "TONIGHT · FOR 4 PEOPLE",
  items: [
    { title: "Rajma chawal", sub: "Rajma, rice, onion salad", meta: "45 min · uses what you have" },
    { title: "Aloo gobi meal", sub: "Aloo gobi, phulka, raita", meta: "30 min · uses what you have" },
    { title: "Dal tadka meal", sub: "Dal, jeera rice, salad", meta: "35 min · uses what you have" },
  ],
  aiTest: "Rice, dal, aloo, tomato, gobi. Dinner for 4, vegetarian?",
  action: "Confirm and send to Didi",
};

/* ---------- Plans ---------- */

export function mealPlan(): Plan {
  return {
    tagline: "Meal ideas from what’s in your kitchen",
    what: "Suggests 3 Indian meals from what's in your kitchen. The family confirms one, and the stock goes down. Updates can be typed in Hinglish or sent as a photo.",
    why: "every evening the same question, “abhi kya banega?”, and the answer depends on what’s left in the kitchen.",
    people: [
      ["Owner", "Sets up the kitchen, invites family, changes settings"],
      ["Cook (Didi)", "Sees today’s meal, marks what got used up"],
      ["Family", "Picks one of the 3 meals, adds what was bought"],
    ],
    can: [
      "See 3 meal ideas for breakfast, lunch or dinner, made from what’s in the kitchen",
      "Pick one; the ingredients it uses come off the stock",
      "Update stock by typing in Hinglish or sending a photo",
      "See what the family ate this week",
    ],
    screens: [
      { label: "Dinner ke liye?", title: "Today", sub: "3 ideas, pick one" },
      { label: "Kitchen", title: "Inventory", sub: "type or photo" },
      { label: "This week", title: "History", sub: "what we ate" },
      { label: "Family", title: "Settings", sub: "people, times" },
    ],
    ai: {
      name: "Meal planner",
      does: "Suggests 3 meals from your kitchen. Can read photos. Can't change your inventory.",
      reads: "Kitchen stock, what the family ate this week, photos of the fridge",
      cant: "Change the stock by itself. Only people can.",
      runs: "Every day at 9 PM (breakfast + lunch) and 3 PM (dinner)",
      cost: "About 0.5% of this month’s credits per run",
    },
    saves: [
      ["Households", "The Sharma family, 5 people"],
      ["Kitchen items", "Aloo, 2 kg"],
      ["Meals", "Aloo paratha, eaten Tue 29 Sep"],
      ["Members", "Didi, cook"],
    ],
    keys: [
      ["OpenAI", "The meal planner and reading photos", "Preview ✓ · Live not added"],
      ["Push notifications", "Tell the family when ideas are ready", "Set by Architect"],
    ],
    steps: [
      {
        title: "Kitchen data",
        sub: "Saves households, kitchen items and meals",
        kind: "data",
        checks: ["Saves a kitchen item", "Keeps each family’s data separate"],
        cost: [0.5, 2],
        builds: "The place your app keeps households, kitchen items and meals, with a few examples.",
        where: "Database tab",
        files: ["db/schema.ts", "db/seed.ts"],
      },
      {
        title: "Login",
        sub: "Family members sign in with email",
        kind: "login",
        checks: ["A family member can sign in", "Someone outside the family can’t see the kitchen"],
        cost: [0.5, 1.5],
        builds: "Sign-in by email, and invites for the rest of the family.",
        where: "The sign-in page",
        files: ["app/login/page.tsx", "lib/auth.ts"],
        uses: "Households from step 1",
      },
      {
        title: "Meal suggestions",
        sub: "The app's AI suggests 3 meals from what's in the kitchen",
        kind: "ai",
        checks: ["Shows exactly 3 meals", "Only uses items that are in the kitchen", "Doesn’t repeat a dish from the last 3 days"],
        cost: [1.5, 4],
        builds:
          "The app’s AI suggests 3 Indian meals from what’s in the kitchen right now, for breakfast, lunch or dinner. The family picks one on the Today screen.",
        where: "Today screen",
        files: ["lib/suggest-meals.ts", "agents/meal-planner/"],
        uses: "Kitchen items from step 1, sign-in from step 2",
      },
      {
        title: "Inventory",
        sub: "Update stock in Hinglish or with a photo",
        kind: "feature",
        checks: ["“2 kg atta aaya” adds 2 kg atta", "“tamatar khatam” marks tomatoes as out", "A blurry photo asks before changing stock"],
        cost: [1.5, 3],
        builds: "Typing “2 kg atta aaya” or sending a photo of the fridge updates the kitchen stock.",
        where: "Inventory screen",
        files: ["lib/parse-hinglish.ts", "app/inventory/page.tsx"],
        uses: "Kitchen items from step 1",
      },
      {
        title: "Screens",
        sub: "Today, Inventory, History and Settings",
        kind: "screens",
        checks: ["Every screen opens on a phone", "Confirming a meal is one tap"],
        cost: [2, 4],
        builds: "The four screens, put together and tidied for phones.",
        where: "Every screen",
        files: ["app/today", "app/inventory", "app/history", "app/settings"],
        uses: "Everything from steps 1–4",
      },
    ],
    notIn: ["Paying for groceries in the app", "More than one kitchen per family", "Nutrition and calorie counts"],
    question: { q: "Should the cook see the whole week’s history, or only today?", options: ["Whole week", "Only today"], fallback: "Only today" },
    wholeApp: ["Confirming a meal lowers the stock", "Meal history shows the last 7 days", "9 PM run saves suggestions and notifies the family"],
  };
}

export function mealSuggestion(): Suggestion {
  return {
    lines: ["+ Step 6: Shopping list", "~ Step 3 also skips yesterday’s dishes", "+ 2 checks"],
    step: {
      title: "Shopping list",
      sub: "A weekly list of what's running low",
      kind: "feature",
      checks: ["Lists items that are running low", "Bought items leave the list"],
      cost: [1, 2],
      builds: "A weekly list of what’s running low, from the kitchen stock.",
      where: "A new Shopping screen",
      files: ["app/shopping/page.tsx", "lib/running-low.ts"],
      uses: "Kitchen items from step 1",
      added: "suggested",
    },
    changeStep: { index: 2, extra: ", and not yesterday’s dishes" },
    can: ["Never get yesterday’s dishes suggested again", "Get a weekly shopping list of what’s running low"],
    saves: [["Shopping list", "Paneer, 500 g, running low"]],
    check: "Doesn’t suggest yesterday’s dishes",
  };
}

export function genericSuggestion(): Suggestion {
  return {
    lines: ["+ Step 5: Weekly summary email", "+ 2 checks"],
    step: {
      title: "Weekly summary email",
      sub: "Sends a short summary every Monday",
      kind: "feature",
      checks: ["Sends on Monday morning", "Only goes to people who asked for it"],
      cost: [0.5, 1.5],
      builds: "A short summary by email every Monday morning.",
      where: "Your inbox, and Settings to turn it off",
      files: ["lib/weekly-email.ts", "app/settings/email.tsx"],
      uses: "Everything saved in step 1",
      added: "suggested",
    },
    can: ["Get a short summary by email every Monday"],
    saves: [["Email settings", "Mondays, 9 AM"]],
    check: "Sends on Monday morning",
  };
}

export function genericPlan(name: string, idea: string, what: string, target: string, withAI: boolean): Plan {
  const t = templateFor(idea);
  const [a, b, c] = t.saves.map((s) => s[0].toLowerCase());
  const steps: Step[] = [
    {
      title: `${t.entity} data`,
      sub: `Saves ${a}, ${b} and ${c}`,
      kind: "data",
      checks: [`Saves a new ${t.noun}`, "Keeps each person’s data separate"],
      cost: [0.5, 2],
      builds: `The place your app keeps ${a}, ${b} and ${c}, with a few examples.`,
      where: "Database tab",
      files: ["db/schema.ts", "db/seed.ts"],
    },
    {
      title: "Login",
      sub: "People sign in with email",
      kind: "login",
      checks: ["Someone can sign in", "Someone signed out can’t see the data"],
      cost: [0.5, 1.5],
      builds: "Sign-in by email.",
      where: "The sign-in page",
      files: ["app/login/page.tsx", "lib/auth.ts"],
      uses: `${t.entity} from step 1`,
    },
    withAI
      ? {
          title: "The app’s AI",
          sub: `The app's AI ${t.aiVerb}`,
          kind: "ai",
          checks: [`Answers about a sample ${t.noun}`, "Only uses what’s saved in the app", "Says so when it doesn’t know"],
          cost: [1.5, 4],
          builds: `The app’s AI ${t.aiVerb}.`,
          where: `${t.screens[0]} screen`,
          files: ["lib/ai.ts", "agents/assistant/"],
          uses: `${t.entity} from step 1, sign-in from step 2`,
        }
      : {
          title: `Add and edit ${t.entity.toLowerCase()}`,
          sub: `People add, change and remove ${t.entity.toLowerCase()}`,
          kind: "feature",
          checks: [`Adds a ${t.noun}`, `Changes a ${t.noun}`, `Removes a ${t.noun}`],
          cost: [1, 3],
          builds: `Forms to add, change and remove ${t.entity.toLowerCase()}.`,
          where: `${t.screens[1]} screen`,
          files: [`app/${t.noun}s/page.tsx`, `lib/${t.noun}s.ts`],
          uses: `${t.entity} from step 1`,
        },
    {
      title: "Screens",
      sub: t.screens.join(", ").replace(/, ([^,]*)$/, " and $1"),
      kind: "screens",
      checks: ["Every screen opens on a phone", "The main task takes one tap"],
      cost: [2, 4],
      builds: "The screens, put together and tidied for phones.",
      where: "Every screen",
      files: t.screens.map((s) => `app/${s.toLowerCase().replace(/\s+/g, "-")}`),
      uses: "Everything from steps 1–3",
    },
  ];
  return {
    tagline: what.replace(/\.$/, ""),
    what: what || `${name} does what you described.`,
    why: "you described it in your own words; this plan turns that into steps.",
    people: [
      ["Owner", "Sets it up, invites people, changes settings"],
      ["Users", target || t.target],
    ],
    can: withAI
      ? [`See ${t.entity.toLowerCase()} in one place`, `Use the app’s AI, which ${t.aiVerb}`, "Sign in by email", "Change settings"]
      : [`See ${t.entity.toLowerCase()} in one place`, `Add, change and remove ${t.entity.toLowerCase()}`, "Sign in by email", "Change settings"],
    screens: t.screens.map((s, i) => ({ label: i === 0 ? t.heading : s, title: s, sub: i === 0 ? "the main screen" : i === 3 ? "people, email" : "details" })),
    ai: withAI
      ? {
          name: "Assistant",
          does: `${t.aiVerb[0].toUpperCase()}${t.aiVerb.slice(1)}. Can’t change anything by itself.`,
          reads: `What’s saved in the app: ${a} and ${b}`,
          cant: "Change or delete anything by itself. Only people can.",
          runs: "When someone asks",
          cost: "About 0.2% of this month’s credits per use",
        }
      : null,
    saves: t.saves,
    keys: withAI
      ? [["AI model", "The app’s AI", "Set by Architect"]]
      : [["Email", "Sign-in links", "Set by Architect"]],
    steps,
    notIn: ["Payments", "A phone app from the app stores", "More than one team per account"],
    question: { q: "Should new people need an invite, or can anyone sign up?", options: ["Invite only", "Anyone"], fallback: "Invite only" },
    wholeApp: ["Every screen loads in under 2 seconds", "Signing out hides all data", "Works on a phone"],
  };
}

export function applySuggestion(plan: Plan, s: Suggestion): Plan {
  const steps = plan.steps.map((st, i) => (s.changeStep && i === s.changeStep.index ? { ...st, extra: s.changeStep.extra, checks: [...st.checks, s.check] } : st));
  return {
    ...plan,
    steps: [...steps, s.step],
    can: [...plan.can, ...s.can],
    saves: [...plan.saves, ...s.saves],
    notIn: plan.notIn.filter((n) => !/shopping/i.test(n) || !/shopping/i.test(s.step.title)),
  };
}

/* ---------- Numbers ---------- */

export const range = ([a, b]: [number, number]) => `${fmt(a)}–${fmt(b)}%`;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function planTotals(plan: Plan) {
  const lo = plan.steps.reduce((s, x) => s + x.cost[0], 0);
  const hi = plan.steps.reduce((s, x) => s + x.cost[1], 0);
  const checks = plan.steps.reduce((s, x) => s + x.checks.length, 0) + plan.wholeApp.length;
  return { steps: plan.steps.length, checks, cost: range([lo, hi]) };
}

/** What each step "really used", made up but inside its usual range. */
export const usedFor = (step: Step) => Math.max(1, Math.round((step.cost[0] + step.cost[1]) / 2 - 0.4));

/* ---------- New projects ---------- */

export type RefineInput = {
  idea: string;
  name: string;
  what: string;
  target: string;
  instructions: string;
  appType: Project["appType"];
  theme: number;
  withAI: boolean;
};

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "app";
}

export function createProject(input: RefineInput, now = Date.now()): Project {
  const meal = isMealIdea(input.idea);
  const name = input.name.trim() || nameFromIdea(input.idea);
  const plan = meal ? mealPlan() : genericPlan(name, input.idea, input.what, input.target, input.withAI);
  const totals = planTotals(plan);
  const t = templateFor(input.idea);
  return {
    id: `${slug(name)}-${uid().slice(0, 4)}`,
    name,
    idea: input.idea,
    kind: meal ? "meal" : "generic",
    appType: input.appType,
    target: input.target,
    instructions: input.instructions,
    theme: input.theme,
    plan: meal ? { ...plan, what: input.what || plan.what } : plan,
    planVersion: 1,
    suggestion: null,
    suggestionSeen: false,
    answer: null,
    stage: "plan",
    build: { status: "idle", step: 0, since: now },
    stepsDone: 0,
    creditsUsed: 0,
    versions: [
      {
        n: 1,
        title: "Plan written",
        at: now,
        summary: `The plan for ${name}: ${totals.steps} steps and ${totals.checks} checks. Nothing is built yet.`,
        parts: ["Plan"],
        checks: [],
        cost: "Less than 1% of this month’s credits",
        files: ["plan.md"],
        snap: { plan: meal ? { ...plan, what: input.what || plan.what } : plan, stepsDone: 0 },
      },
    ],
    chat: [
      {
        id: uid(),
        type: "ai",
        text: `Here’s the plan for ${name}: ${totals.steps} steps and ${totals.checks} checks. Nothing is built yet.`,
      },
    ],
    template: meal ? mealTemplate : { entity: t.entity, items: t.items, aiTest: t.aiTest, heading: t.heading, eyebrow: t.eyebrow, action: t.action },
    createdAt: now,
    updatedAt: now,
  };
}

/* ---------- The pretend build ---------- */

export function startBuild(p: Project, now = Date.now()): Project {
  return {
    ...p,
    stage: "build",
    build: { status: "running", step: p.stepsDone, since: now },
    chat: [
      ...p.chat,
      { id: uid(), type: "ai", text: `Building step ${p.stepsDone + 1}: ${lowerFirst(p.plan.steps[p.stepsDone].title)}.` },
    ],
    updatedAt: now,
  };
}

function stepDone(p: Project, at: number): Project {
  const i = p.build.step;
  const step = p.plan.steps[i];
  const used = usedFor(step);
  const n = p.versions[0].n + 1;
  const title = `Step ${i + 1}: ${lowerFirst(step.title)}`;
  const next = p.plan.steps[i + 1];
  const version: Version = {
    n,
    title,
    at,
    summary: `${step.builds}`,
    parts: step.kind === "ai" ? ["Plan", `Code · ${step.files.length} files`, "App’s AI"] : ["Plan", `Code · ${step.files.length} files`],
    checks: step.checks.map((c) => [c, "not run", "passed"]),
    cost: `${used}% of this month’s credits`,
    files: step.files,
    snap: { plan: p.plan, stepsDone: i + 1 },
  };
  const wait = !!next && !!p.reviewOn;
  const chat: ChatItem[] = [
    { id: uid(), type: "step", title: `Step ${i + 1} done: ${step.title}`, detail: `${step.checks.length} of ${step.checks.length} checks passed · used ${used}% of this month’s credits` },
    { id: uid(), type: "version", n, text: `saved · ${step.title} added` },
  ];
  if (next && wait) chat.push({ id: uid(), type: "ai", text: `Step ${i + 1} is ready. Review is on, so I’ll wait for you before step ${i + 2} (${lowerFirst(next.title)}).` });
  else if (next) chat.push({ id: uid(), type: "ai", text: `Now building step ${i + 2}: ${lowerFirst(next.title)}.` });
  return {
    ...p,
    stepsDone: i + 1,
    creditsUsed: p.creditsUsed + used,
    versions: [version, ...p.versions],
    chat: [...p.chat, ...chat],
    build: next ? { status: wait ? "waiting" : "running", step: i + 1, since: at } : { status: "checking", step: i, since: at },
    stage: next ? "build" : "test",
    updatedAt: at,
  };
}

/** Moves a running build forward to `now`. Safe to call as often as you like. */
export function advance(p: Project, now = Date.now()): Project {
  let q = p;
  let guard = 0;
  while (guard++ < 20) {
    if (q.build.status === "running" && now - q.build.since >= STEP_MS) {
      q = stepDone(q, q.build.since + STEP_MS);
    } else if (q.build.status === "checking" && now - q.build.since >= CHECK_MS) {
      const total = planTotals(q.plan).checks;
      q = {
        ...q,
        build: { ...q.build, status: "done", since: q.build.since + CHECK_MS },
        chat: [
          ...q.chat,
          { id: uid(), type: "step", title: `All ${q.plan.steps.length} steps built`, detail: `${total} of ${total} checks passed · used ${q.creditsUsed}% of this month’s credits` },
          { id: uid(), type: "ai", text: "Your app is built and every check passed. It isn’t live yet: go live when you’re ready." },
        ],
        updatedAt: q.build.since + CHECK_MS,
      };
    } else if (q.deploy?.status === "deploying" && now - q.deploy.since >= DEPLOY_STEP_MS * (DEPLOY_STEPS - 1)) {
      q = finishDeploy(q, q.deploy.since + DEPLOY_STEP_MS * (DEPLOY_STEPS - 1));
    } else break;
  }
  return q;
}

/** The meal app's AI needs its own Live key; the demo leaves it out so the failed-deploy screen can be seen. */
export function needsLiveKey(p: Project) {
  return p.kind === "meal" && !!p.plan.ai && !p.deploy?.liveKey;
}

export function startDeploy(p: Project, now = Date.now()): Project {
  const target = p.versions[0].n;
  const deploy: Deploy = {
    status: "deploying",
    since: now,
    target,
    liveVersion: p.deploy?.liveVersion ?? null,
    history: p.deploy?.history ?? [],
    liveKey: p.deploy?.liveKey ?? false,
  };
  return {
    ...p,
    deploy,
    chat: [
      ...p.chat,
      { id: uid(), type: "user", text: p.deploy?.liveVersion ? "Deploy latest changes" : "Deploy it" },
      { id: uid(), type: "ai", text: "Going live now. I’ll check the live link before calling it live." },
    ],
  };
}

function finishDeploy(p: Project, at: number): Project {
  const d = p.deploy!;
  if (needsLiveKey(p)) {
    const kept = d.liveVersion;
    return {
      ...p,
      deploy: { ...d, status: "failed", since: at, failedVersion: d.target },
      chat: [
        ...p.chat,
        {
          id: uid(),
          type: "ai",
          text: kept
            ? `I published version ${d.target} and opened the live link, but the page showed an error. I kept version ${kept} live, so nothing changed for your users.`
            : `I published version ${d.target} and opened the live link, but the page showed an error. Nothing went live, so nobody saw it.`,
        },
      ],
      updatedAt: at,
    };
  }
  const v = p.versions.find((x) => x.n === d.target);
  const checks = planTotals(p.plan).checks;
  return {
    ...p,
    stage: "live",
    deploy: { ...d, status: "live", since: at, liveVersion: d.target, failedVersion: undefined, history: [{ n: d.target, title: v?.title ?? `Version ${d.target}`, at }, ...d.history.filter((h) => h.n !== d.target)] },
    versions: p.versions.map((x) => ({ ...x, badge: x.n === d.target ? "live" : x.badge === "live" ? undefined : x.badge })),
    chat: [
      ...p.chat,
      { id: uid(), type: "step", title: "Live ✓", detail: `All ${checks} checks passed · live link checked · used 1% of this month’s credits` },
      { id: uid(), type: "ai", text: `${p.name} is live. I opened the live link and the ${p.plan.screens[0].title} screen loaded.` },
    ],
    creditsUsed: p.creditsUsed + 1,
    updatedAt: at,
  };
}

export function rollBackLive(p: Project, n: number, now = Date.now()): Project {
  if (!p.deploy) return p;
  return {
    ...p,
    deploy: { ...p.deploy, status: "live", liveVersion: n, since: now },
    versions: p.versions.map((x) => ({ ...x, badge: x.n === n ? "live" : x.badge === "live" ? undefined : x.badge })),
    chat: [...p.chat, { id: uid(), type: "ai", text: `Version ${n} is live again. Nothing else changed.` }],
    updatedAt: now,
  };
}

/** What the top-bar button should say (design: Deploy → Deploying… → Live ✓ → Deploy latest changes). */
export function deployLabel(p: Project) {
  const d = p.deploy;
  if (!d || d.status === "offline") return { label: "Deploy", strong: p.build.status === "done" };
  if (d.status === "deploying") return { label: "Deploying…", strong: true };
  if (d.status === "live" && d.liveVersion === p.versions[0].n) return { label: "Live ✓", strong: false };
  return { label: d.liveVersion ? "Deploy latest changes" : "Deploy", strong: true };
}

export function stopBuild(p: Project, now = Date.now()): Project {
  const i = p.build.step;
  const step = p.plan.steps[i];
  const n = p.versions[0].n + 1;
  return {
    ...p,
    build: { status: "stopped", step: i, since: now },
    versions: [
      {
        n,
        title: `Step ${i + 1} stopped`,
        at: now,
        summary: `Stopped while building ${lowerFirst(step.title)}. What was written so far is kept, but not tested.`,
        parts: ["Code"],
        checks: step.checks.map((c) => [c, "not run", "not run"]),
        cost: "1% of this month’s credits",
        files: step.files.slice(0, 1),
        badge: "stopped",
        snap: { plan: p.plan, stepsDone: p.stepsDone },
      },
      ...p.versions,
    ],
    chat: [...p.chat, { id: uid(), type: "ai", text: `Stopped. Steps 1–${i} are finished and saved. Step ${i + 1} is saved as v${n}, marked “Stopped · not tested”.` }],
    updatedAt: now,
  };
}

export function goBackTo(p: Project, n: number, now = Date.now()): Project {
  const to = p.versions.find((v) => v.n === n);
  if (!to) return p;
  const next = p.versions[0].n + 1;
  // Older saved versions have no snapshot: work out the steps from the title ("Step 2: …").
  const snap = to.snap ?? { plan: p.plan, stepsDone: Number(/^Step (\d+):/.exec(to.title)?.[1] ?? p.stepsDone) };
  const done = Math.min(snap.stepsDone, snap.plan.steps.length);
  const complete = done >= snap.plan.steps.length;
  const build: Build = complete
    ? { status: "done", step: done - 1, since: now }
    : done === 0
      ? { status: "idle", step: 0, since: now }
      : { status: "stopped", step: done, since: now };
  return {
    ...p,
    plan: snap.plan,
    stepsDone: done,
    build,
    stage: complete ? "test" : done === 0 ? "plan" : "build",
    suggestion: null,
    versions: [
      {
        n: next,
        title: `Went back to v${n}`,
        at: now,
        summary: `A copy of v${n} (${lowerFirst(to.title)}). The plan, the code and the app’s AI went back. Your app’s data stayed.`,
        parts: ["Plan", "Code", "App’s AI"],
        checks: [],
        cost: "No credits",
        files: to.files,
        snap: { plan: snap.plan, stepsDone: done },
      },
      ...p.versions,
    ],
    chat: [...p.chat, { id: uid(), type: "version", n: next, text: `saved · went back to v${n}` }],
    updatedAt: now,
  };
}

/** Review is on and a finished step is waiting: carry on with the next one. */
export function continueBuild(p: Project, now = Date.now()): Project {
  if (p.build.status !== "waiting") return p;
  return {
    ...p,
    build: { status: "running", step: p.build.step, since: now },
    chat: [...p.chat, { id: uid(), type: "ai", text: `Approved. Now building step ${p.build.step + 1}: ${lowerFirst(p.plan.steps[p.build.step].title)}.` }],
    updatedAt: now,
  };
}

export function timeAgo(at: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/* ---------- plan.md ---------- */

export function planMarkdown(p: Project) {
  const plan = p.plan;
  const t = planTotals(plan);
  const table = (head: string[], rows: string[][]) =>
    [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return [
    `# ${p.name}`,
    `${plan.tagline}`,
    `## 1. What it does`,
    plan.what,
    `**Why:** ${plan.why}`,
    `## 2. Who uses it`,
    table(["Person", "What they do"], plan.people),
    `## 3. What people can do`,
    plan.can.map((c) => `- ${c}`).join("\n"),
    `## 4. Screens`,
    plan.screens.map((s) => `- **${s.title}**: ${s.sub}`).join("\n"),
    `## 5. The app’s AI`,
    plan.ai ? table(["", ""], [["Name", plan.ai.name], ["Reads", plan.ai.reads], ["Can’t", plan.ai.cant], ["Runs by itself", plan.ai.runs], ["Cost", plan.ai.cost]]) : "This app doesn’t use an AI model.",
    `## 6. What it saves`,
    table(["What", "Example"], plan.saves),
    `## 7. Keys it needs`,
    table(["Key", "Why", "Status"], plan.keys),
    `## 8. Build steps and checks`,
    `Usually uses ${t.cost} of this month’s credits in total (an example range).`,
    plan.steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.sub}${s.extra ?? ""} (usually ${range(s.cost)})\n${s.checks.map((c) => `   - Check: ${c}`).join("\n")}`).join("\n"),
    `Whole app, at the end:\n${plan.wholeApp.map((c) => `- Check: ${c}`).join("\n")}`,
    `## 9. Not in this version`,
    plan.notIn.map((n) => `- ${n}`).join("\n"),
    `## 10. Open questions`,
    `- ${plan.question.q} (${p.answer ? `Answer: ${p.answer}` : `If you don’t answer, the plan uses “${plan.question.fallback}”`})`,
  ].join("\n\n");
}

/* ---------- Importing a project (designs B3–B6) ---------- */

export function importedProject(repo: string, now = Date.now()): Project {
  const base = createProject(
    { idea: "meal assistant for a kitchen", name: "CookBridge", what: "", target: "", instructions: "", appType: "Website", theme: 0, withAI: true },
    now,
  );
  const plan: Plan = {
    ...mealPlan(),
    tagline: "Here’s what we think your app does. Check it before building.",
    what: "A meal assistant for Indian homes with a cook. The family tells it what’s in the kitchen by typing, speaking or sending a photo, and it suggests meals the cook can make today.",
    why: "worked out from your code, your README and AGENTS.md.",
    people: [
      ["Owner", "Sets up the home and invites the family"],
      ["Cook", "Sees today’s meals, marks what got used up"],
      ["Family", "Adds what’s in the kitchen, picks meals"],
    ],
    can: ["Add kitchen items by typing, speaking or sending a photo", "Get meal ideas for today from what’s in the kitchen", "Confirm a meal for the cook", "Sign in and invite family members"],
    screens: [
      { label: "Aaj kya banega?", title: "Today", sub: "app/today" },
      { label: "Kitchen", title: "Kitchen", sub: "app/kitchen" },
      { label: "Welcome", title: "Onboarding", sub: "app/onboarding" },
      { label: "Family", title: "Settings", sub: "app/settings" },
    ],
    ai: { name: "Meal suggester", does: "Suggests meals from the kitchen. Found in agents/graph.py (LangGraph).", reads: "Kitchen items, photos", cant: "Change the stock by itself", runs: "When someone asks", cost: "About 0.3% of this month’s credits per use" },
    saves: [["Households", "The Sharma family"], ["Members", "Didi, cook"], ["Kitchen items", "Aloo, 2 kg"], ["Meals", "Rajma chawal, confirmed Tue"]],
    keys: [["OpenAI", "Meal ideas and reading photos", "Preview ✓ · Live not added"], ["Google sign-in", "Family members sign in", "Preview ✓ · Live ✓"]],
    steps: [
      {
        title: "Fix: confirming a meal lowers the stock",
        sub: "The stock doesn’t change today",
        kind: "feature",
        checks: ["Confirming a meal lowers the stock", "Undo puts the stock back"],
        cost: [0.5, 1.5],
        builds: "Confirming a meal takes its ingredients off the kitchen stock, as the plan says.",
        where: "Today screen",
        files: ["db/schema.ts", "app/today/confirm.ts"],
      },
      {
        title: "Voice updates in the live app",
        sub: "Works in preview, needs the Live key",
        kind: "feature",
        checks: ["A voice note adds kitchen items"],
        cost: [0.5, 1],
        builds: "Voice notes add kitchen items in the live app too.",
        where: "Kitchen screen",
        files: ["lib/voice.ts"],
      },
    ],
    notIn: ["Anything your code doesn’t do yet"],
    question: { q: "Confirming a meal doesn’t lower the stock. Is that a mistake?", options: ["Yes, fix it", "No, it’s on purpose"], fallback: "Yes, fix it" },
    wholeApp: ["Every screen from your code still opens", "Sign in still works"],
    found: {
      repo,
      stack: ["Next.js", "Postgres", "LangGraph agent"],
      works: [
        ["Sign in", true],
        ["Add kitchen items", true],
        ["Suggest meals", true],
        ["Photo upload", true],
        ["Settings", true],
        ["Onboarding", true],
        ["Voice update", false, "the Live OpenAI key is missing"],
        ["Confirming a meal lowers the stock", false, "the stock doesn’t change"],
      ],
      notes: "Found AGENTS.md. I’ll follow it when I build.",
      paths: ["app/today", "app/kitchen", "app/onboarding", "app/settings"],
    },
  };
  return {
    ...base,
    id: `cookbridge-${uid().slice(0, 4)}`,
    name: "CookBridge",
    idea: `Imported from ${repo}`,
    plan,
    template: { ...mealTemplate, heading: "Aaj kya banega?", eyebrow: "TODAY · FOR 5 PEOPLE" },
    imported: { repo, setup: "keys", keyReplaced: false },
    versions: [{ n: 1, title: `Imported from ${repo}`, at: now, summary: `Your code, copied from ${repo} (main). Your GitHub repo isn’t changed.`, parts: ["Code", "Plan"], checks: [], cost: "No credits", files: ["plan.md", "AGENTS.md"] }],
    chat: [
      { id: uid(), type: "ai", text: "CookBridge is running in its own sandbox. It needs 2 more keys to start. Please don’t paste keys here in the chat: use the form, so they stay out of the conversation." },
    ],
  };
}
