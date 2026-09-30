/* Made-up data for the clickable prototype. Nothing here is real usage. */

export const demoUser = {
  name: "Isha Goyal",
  firstName: "Isha",
  initials: "IG",
  workspace: "Isha’s workspace",
};

export type Stage = "plan" | "build" | "test" | "live";

export type Project = {
  id: string;
  name: string;
  initial: string;
  version: number;
  savedAgo: string;
  stage: Stage;
  creditsUsed: number;
  reviewOn: boolean;
};

export const demoProject: Project = {
  id: "abhi-kya-banega",
  name: "Abhi Kya Banega",
  initial: "A",
  version: 12,
  savedAgo: "saved 2 min ago",
  stage: "build",
  creditsUsed: 12,
  reviewOn: false,
};

export function getProject(id: string): Project {
  // Step 2 adds saved projects from Supabase; until then every project id opens the demo.
  return { ...demoProject, id };
}
