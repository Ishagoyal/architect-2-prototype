import Link from "next/link";
import { Icon } from "../Icon";
import type { Stage } from "@/lib/demo";

/* Plan → Build → Test → Live, always visible. Each stage opens its view.
   Phone: only the current stage. */

const stages: { key: Stage; label: string; path: string }[] = [
  { key: "plan", label: "Plan", path: "plan" },
  { key: "build", label: "Build", path: "app" },
  { key: "test", label: "Test", path: "tests" },
  { key: "live", label: "Live", path: "deploy" },
];

function CurrentPill({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-[7px] rounded-full bg-primary px-3 py-1.5 font-medium whitespace-nowrap text-on-primary">
      <span className="size-[7px] rounded-full bg-progress" />
      {label}
    </span>
  );
}

export function JourneyBar({ projectId, current }: { projectId: string; current: Stage }) {
  const at = stages.findIndex((s) => s.key === current);
  return (
    <ol aria-label="Project journey" className="flex items-center gap-2.5 text-[13px]">
      {stages.map((s, i) => {
        const href = `/p/${projectId}/${s.path}`;
        const state = i < at ? "done" : i === at ? "current" : "todo";
        return (
          <li key={s.key} className="contents">
            {i > 0 && <span aria-hidden="true" className="h-px w-7 bg-line-strong" />}
            <Link
              href={href}
              aria-current={state === "current" ? "step" : undefined}
              className="rounded-full hover:opacity-80"
            >
              {state === "current" ? (
                <CurrentPill label={s.label} />
              ) : state === "done" ? (
                <span className="flex items-center gap-1.5 font-medium text-good">
                  <Icon name="check" size={14} strokeWidth={2.4} />
                  {s.label}
                  <span className="sr-only">(done)</span>
                </span>
              ) : (
                <span className="text-ink-2">{s.label}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function CurrentStage({ projectId, current }: { projectId: string; current: Stage }) {
  const s = stages.find((x) => x.key === current)!;
  return (
    <Link href={`/p/${projectId}/${s.path}`} aria-label={`Now: ${s.label}`} className="text-[13px]">
      <CurrentPill label={s.label} />
    </Link>
  );
}
