import { NextResponse, type NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

/* Google, GitHub and email-confirmation links come back here. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const supabase = await getSupabase();
  if (!code || !supabase) return NextResponse.redirect(new URL("/sign-up", request.url));

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/sign-up?error=link", request.url));

  const onboarded = data.user.user_metadata?.onboarded === true;
  return NextResponse.redirect(new URL(onboarded ? "/home" : "/onboarding", request.url));
}
