import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/* Runs before each page: keeps the Supabase sign-in fresh, sends people who
   aren't signed in (and aren't trying the demo) to the sign-up screen, and
   sends people who are signed in past it. */

const openPaths = ["/", "/sign-in", "/auth/callback", "/privacy"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const demo = request.cookies.get("architect_demo")?.value === "1";
  let signedIn = false;

  if (supabaseConfigured && !demo) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = user !== null;
  }

  const path = request.nextUrl.pathname;
  const isOpen = openPaths.includes(path);

  if (!demo && !signedIn && !isOpen) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if ((demo || signedIn) && (path === "/" || path === "/sign-in")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  return response;
}

export const config = {
  // Everything except Next's own files and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
