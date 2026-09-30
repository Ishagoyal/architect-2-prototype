/* The six problems from Isha's notes. The landing page and the scene cards both use this text. */

export type Problem = {
  n: number;
  label: string;
  quote: string;
  extra?: string;
  /** Set for problem 6: the extra line is a sequence, shown in monospace. */
  extraMono?: boolean;
  answer: string;
  button: string;
  image: string;
  /** The picture's size in pixels. */
  size: [number, number];
  alt: string;
};

export const problems: Problem[] = [
  {
    n: 1,
    label: "Tests",
    quote: "Test cases are written by AI, and they always pass.",
    extra: "The checks said yes. The app still didn’t work the way I wanted when I used it myself.",
    answer: "Checks are written from your words, with the plan, before any code: “Shows exactly 3 meals”. The AI can’t quietly change a check. It asks you first.",
    button: "Tests",
    image: "/landing/tests.jpg",
    size: [856, 700],
    alt: "The Tests screen: the AI asks to change the check “Shows exactly 3 meals” to “Shows up to 3 meals”, with Accept and Reject.",
  },
  {
    n: 2,
    label: "Versions",
    quote: "Fixing one problem created another.",
    answer: "After every change you see which checks passed before and after. If a fix breaks something else, it says so right away, with Fix it or Undo.",
    button: "Versions",
    image: "/landing/versions.jpg",
    size: [852, 505],
    alt: "Version 12: two checks went from not run to passed, and “Adding a kitchen item” went from passed to failed, with Fix it and Undo.",
  },
  {
    n: 3,
    label: "Changed files",
    quote: "AI edits a lot of files. Reviewing them takes a lot of time.",
    answer: "Every change comes with a plain-words summary, the parts of the app it touched, and its files, each one click from the code.",
    button: "Changed files",
    image: "/landing/files.jpg",
    size: [852, 480],
    alt: "Version 12’s 4 changed files, with the diff of lib/suggest-meals.ts and an Open in Code link.",
  },
  {
    n: 4,
    label: "Step by step",
    quote: "I don’t feel I’m controlling the app. It feels like the AI is doing the work.",
    extra: "Also in my notes: hallucination, overdoing, refactoring.",
    answer: "The plan is split into steps. Each step is built on a copy and waits for you: “Step 4 of 5 ready”. Continue, ask for a change, or stop at any time.",
    button: "Plan",
    image: "/landing/review.jpg",
    size: [864, 440],
    alt: "The app preview: “Step 4 of 5 ready: inventory. Waiting for you, built on a copy, your app is unchanged.”",
  },
  {
    n: 5,
    label: "Database",
    quote: "I had to reset the database again and again to test onboarding.",
    answer: "Test data and live data are separate. You try things on a copy. The AI can never change live data.",
    button: "Database",
    image: "/landing/database.jpg",
    size: [852, 440],
    alt: "The Database screen on Test data: a copy for trying things, with the Members table.",
  },
  {
    n: 6,
    label: "Going live",
    quote: "Real bugs don’t show up when the AI uses the app itself.",
    extra: "Deploy → real users → bug → fix → deploy → a different bug → fix → deploy",
    extraMono: true,
    answer: "Before it says Live, every check runs again and the live link is opened. If it fails, your previous version stays live, so your users never see the broken one.",
    button: "Deploy",
    image: "/landing/livefailed.jpg",
    size: [864, 470],
    alt: "Going live with version 16 failed at “Checking the live link”. Your app is still live on version 14.",
  },
];

export const SCENE_COUNT = problems.length;
