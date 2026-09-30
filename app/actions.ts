"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/viewer";
import { DEMO_PROJECT_ID } from "@/lib/demo";

export type AuthState = { error?: string; notice?: string } | undefined;

const NOT_SET_UP = "Accounts aren’t switched on in this preview yet. Try the demo to look around.";

/** "Try the demo": no sign-up, opens a ready project with the demo tour open. */
export async function startDemo() {
  const store = await cookies();
  store.set(DEMO_COOKIE, "1", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  redirect(`/p/${DEMO_PROJECT_ID}/app?tour=1`);
}

export async function signOut() {
  const store = await cookies();
  if (store.get(DEMO_COOKIE)) {
    store.delete(DEMO_COOKIE);
  } else {
    const supabase = await getSupabase();
    await supabase?.auth.signOut();
  }
  redirect("/");
}

function readCredentials(form: FormData) {
  return {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  };
}

export async function signUpWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await getSupabase();
  if (!supabase) return { error: NOT_SET_UP };
  const { email, password } = readCredentials(form);
  if (!email) return { error: "Type your email." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) return { error: error.message };
  // With email confirmation on, there's no session until they click the link.
  if (!data.session) return { notice: `We sent a link to ${email}. Open it to finish creating your account.` };
  redirect("/onboarding");
}

export async function signInWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await getSupabase();
  if (!supabase) return { error: NOT_SET_UP };
  const { email, password } = readCredentials(form);
  if (!email || !password) return { error: "Type your email and password." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message === "Invalid login credentials" ? "That email and password don’t match." : error.message };
  redirect("/home");
}

export async function continueWith(_: AuthState, form: FormData): Promise<AuthState> {
  const provider = form.get("provider") === "github" ? "github" : "google";
  const supabase = await getSupabase();
  if (!supabase) return { error: NOT_SET_UP };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await origin()}/auth/callback` },
  });
  if (error || !data.url) {
    const name = provider === "google" ? "Google" : "GitHub";
    return { error: `Signing in with ${name} isn’t switched on yet. Use your email instead.` };
  }
  redirect(data.url);
}

export async function saveOnboarding(form: FormData): Promise<AuthState> {
  const supabase = await getSupabase();
  if (!supabase) redirect("/home");
  const name = String(form.get("name") ?? "").trim();
  const role = String(form.get("role") ?? "").trim() || null;
  const { error } = await supabase.auth.updateUser({ data: { ...(name ? { name } : {}), role, onboarded: true } });
  if (error) return { error: "That didn’t save. Check your connection and press Continue again." };
  redirect("/home");
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
