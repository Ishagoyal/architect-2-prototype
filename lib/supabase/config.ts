/* Supabase is optional: without these two settings the prototype runs in demo-only mode.
   They go in Vercel's settings and a local .env.local, never in the repo. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = supabaseUrl !== "" && supabaseKey !== "";
