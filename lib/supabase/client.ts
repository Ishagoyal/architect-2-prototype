import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Supabase in the browser. Null when it isn't set up. */
export function getBrowserSupabase() {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
