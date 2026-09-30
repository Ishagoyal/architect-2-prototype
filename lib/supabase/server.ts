import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./config";

/** Supabase for server components, server actions and route handlers. Null when not set up. */
export async function getSupabase() {
  if (!supabaseConfigured) return null;
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component, where cookies can't be written. The proxy refreshes them.
        }
      },
    },
  });
}
