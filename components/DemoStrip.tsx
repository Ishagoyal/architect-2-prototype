"use client";

import { signOut } from "@/app/actions";
import { useViewer } from "@/lib/viewer-context";

/* A thin strip on every page in the demo, so people know where they are and how to leave. */
export function DemoStrip() {
  const viewer = useViewer();
  if (viewer.kind !== "demo") return null;
  return (
    <div className="flex min-h-8 shrink-0 items-center justify-center gap-2 bg-accent-soft px-3 py-1 text-center text-xs text-accent-strong">
      <span>
        You’re trying the demo. <span className="hidden sm:inline">The data is made up and stays in this browser.</span>
      </span>
      <form
        action={signOut}
        onSubmit={() => {
          try {
            localStorage.removeItem("architect.projects.demo");
            localStorage.removeItem("architect.projects.demo2");
            localStorage.removeItem("architect.tour");
            localStorage.removeItem("architect.tour.active");
                localStorage.setItem("architect.devView", "off");
          } catch {
            /* nothing to clear */
          }
        }}
      >
        <button type="submit" className="font-semibold underline underline-offset-2">
          Leave the demo
        </button>
      </form>
    </div>
  );
}
