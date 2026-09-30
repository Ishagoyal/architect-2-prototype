import "server-only";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase/server";

/* Who is looking at the page: someone trying the demo, or a signed-in account. */

export const DEMO_COOKIE = "architect_demo";

export type Viewer = {
  kind: "demo" | "account";
  /** Supabase user id, or "demo". Keeps each person's browser copy separate. */
  id: string;
  name: string;
  firstName: string;
  initials: string;
  workspace: string;
  role: string | null;
  onboarded: boolean;
  /** Signed up with GitHub: one of the signals for developer defaults. */
  viaGithub: boolean;
  /** False when the name is only a guess from the email address. */
  hasName: boolean;
};

export function makeViewer(kind: Viewer["kind"], name: string, extra: Partial<Viewer> = {}): Viewer {
  const clean = name.trim() || "You";
  const parts = clean.split(/\s+/);
  const firstName = parts[0];
  const initials = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : clean.slice(0, 2)).toUpperCase();
  return {
    kind,
    id: kind === "demo" ? "demo" : "",
    name: clean,
    firstName,
    initials,
    workspace: `${firstName}’s workspace`,
    role: null,
    onboarded: true,
    viaGithub: false,
    hasName: true,
    ...extra,
  };
}

// The demo uses a neutral name, with the design file’s projects.
export const demoViewer = makeViewer("demo", "Alex Morgan", { role: "Product Management" });

export async function getViewer(): Promise<Viewer | null> {
  const store = await cookies();
  if (store.get(DEMO_COOKIE)?.value === "1") return demoViewer;

  const supabase = await getSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const given: string = meta.name || meta.full_name || meta.user_name || "";
  const name = given || (user.email ?? "").split("@")[0];
  return makeViewer("account", name, {
    id: user.id,
    role: meta.role ?? null,
    onboarded: meta.onboarded === true,
    viaGithub: user.app_metadata?.provider === "github",
    hasName: given !== "",
  });
}
