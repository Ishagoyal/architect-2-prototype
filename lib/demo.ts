/* Made-up data for the clickable prototype. Nothing here is real usage. */

export const DEMO_PROJECT_ID = "abhi-kya-banega";

/** Workspaces in the demo (design A26). */
export const demoWorkspaces = [
  {
    name: "Alex’s workspace",
    initial: "A",
    color: "bg-accent",
    lines: ["Personal · Pro plan · just you", "3 projects · credits running low, 74% used"],
  },
  {
    name: "Lyzr Product Team",
    initial: "L",
    color: "bg-[#2E4A3B]",
    lines: ["Team plan · 6 people", "8 projects · credits on track, 31% used"],
  },
];

/** Starter ideas, picked by what the person said they do at onboarding. */
const ideasByRole: Record<string, { heading: string; ideas: string[] }> = {
  "Product Management": {
    heading: "Ideas for product managers",
    ideas: [
      "A feedback agent that tags and summarises user interviews",
      "A PRD assistant that drafts specs from Slack threads",
      "An agent that answers customer questions from our docs",
      "A weekly metrics digest that emails the team",
    ],
  },
  Analyst: {
    heading: "Ideas for analysts",
    ideas: [
      "A dashboard that pulls our sales sheet and flags unusual weeks",
      "An agent that answers questions about our data in plain words",
      "A weekly report that writes itself from a spreadsheet",
    ],
  },
  "Sales & Marketing": {
    heading: "Ideas for sales and marketing",
    ideas: [
      "A lead form that scores and routes new leads",
      "An agent that drafts follow-up emails after a call",
      "A campaign tracker the whole team can update",
    ],
  },
  "Student / Entrepreneur": {
    heading: "Ideas to get started",
    ideas: [
      "A booking page for my tutoring sessions",
      "A waitlist page with a referral link",
      "A study planner that makes a timetable from my exam dates",
    ],
  },
  "Solutions Architect": {
    heading: "Ideas for solutions architects",
    ideas: [
      "A proof of concept that answers questions from a client’s docs",
      "An agent that turns meeting notes into a solution outline",
      "An internal tool that checks a deal against our rules",
    ],
  },
  "Developer / Engineering": {
    heading: "Ideas for developers",
    ideas: [
      "An on-call bot that summarises alerts and suggests a fix",
      "A release notes writer from merged pull requests",
      "An internal admin page on top of our database",
    ],
  },
  "HR & Finance": {
    heading: "Ideas for HR and finance",
    ideas: [
      "A leave request bot that checks the policy and asks a manager",
      "An expense form that reads receipts from a photo",
      "An onboarding checklist for new joiners",
    ],
  },
};

const generalIdeas = {
  heading: "Ideas to start with",
  ideas: [
    "An agent that answers customer questions from our docs",
    "A booking page with reminders by email",
    "A weekly digest that emails the team",
  ],
};

export function ideasFor(role: string | null) {
  return (role && ideasByRole[role]) || generalIdeas;
}

/** The chips on onboarding, in the design’s order. */
export const roles = [
  "Analyst",
  "Product Management",
  "Sales & Marketing",
  "Student / Entrepreneur",
  "Solutions Architect",
  "Developer / Engineering",
  "HR & Finance",
];
/** Roles that start with Developer view on. */
export const developerRoles = ["Developer / Engineering", "Solutions Architect"];
