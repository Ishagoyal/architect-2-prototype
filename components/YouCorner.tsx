"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon } from "./Icon";
import { usePrefs } from "@/lib/prefs";
import { useDismiss } from "./useDismiss";
import { useViewer } from "@/lib/viewer-context";
import { signOut } from "@/app/actions";
import { forgetDemo } from "@/lib/tour";

/* The same bottom-left corner on every screen, at home and inside a project:
   Credits, Settings, your name, the ☾ / ☀ button, and the Developer view chip when it's on. */

export function ThemeButton({ className = "hover:bg-hover" }: { className?: string }) {
  const { toggleTheme } = usePrefs();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${className}`}
    >
      {/* Both icons are rendered; the theme on <html> picks one, so there's no flash. */}
      <span className="dark:hidden" title="Switch to dark mode">
        <Icon name="moon" />
        <span className="sr-only">Switch to dark mode</span>
      </span>
      <span className="hidden dark:inline" title="Switch to light mode">
        <Icon name="sun" />
        <span className="sr-only">Switch to light mode</span>
      </span>
    </button>
  );
}

export function DevChip() {
  const { setDevView } = usePrefs();
  return (
    <button
      type="button"
      onClick={() => setDevView(false)}
      title="You’re seeing code, agent files and cost per step. Click to turn it off."
      className="hidden items-center gap-1 rounded-full bg-primary px-[7px] py-0.5 text-[11px] font-medium whitespace-nowrap text-on-primary dev:inline-flex"
    >
      Developer view <Icon name="close" size={10} strokeWidth={2.4} />
      <span className="sr-only">(turn off)</span>
    </button>
  );
}

export function Avatar({ size = 32 }: { size?: number }) {
  const viewer = useViewer();
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary"
    >
      {viewer.initials}
    </span>
  );
}

/** Your name. Clicking it opens a small menu with Developer view and Account settings. */
export function NameMenu({ placement = "up", compact = false }: { placement?: "up" | "down"; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const { devView, setDevView } = usePrefs();
  const viewer = useViewer();

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-w-0 items-center gap-2.5 rounded-[10px] py-0.5 text-left ${compact ? "" : "pr-2"}`}
      >
        <Avatar />
        <span className={compact ? "sr-only" : "truncate text-[13px]"}>{viewer.name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-64 max-w-[calc(100vw-32px)] rounded-xl border border-line bg-panel p-1.5 shadow-pop ${
            placement === "up" ? "bottom-full left-0 mb-2" : "top-full right-0 mt-2"
          }`}
        >
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={devView}
            onClick={() => {
              setDevView(!devView);
              close();
            }}
            className="flex w-full items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-hover"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium">Developer view</span>
              <span className="text-xs text-ink-2">See code, agent files and cost per step.</span>
            </span>
            <Switch on={devView} />
          </button>
          {viewer.kind === "scene" ? (
            // Scenes aren't signed in: the only way out is back to the landing page.
            <Link href="/" role="menuitem" onClick={close} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] hover:bg-hover">
              <Icon name="back" size={15} />
              Back to the story
            </Link>
          ) : (
            <>
              <Link
                href="/settings"
                role="menuitem"
                onClick={close}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] hover:bg-hover"
              >
                <Icon name="settings" size={15} />
                Account settings
              </Link>
              <form
                action={signOut}
                onSubmit={() => {
                  if (viewer.kind !== "demo") return;
                  forgetDemo();
                }}
              >
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-hover"
                >
                  <Icon name="back" size={15} />
                  {viewer.kind === "demo" ? "Leave the demo" : "Sign out"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-line-strong"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-panel shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </span>
  );
}

export function CreditsLink({ used, compact = false, inSheet = false }: { used: number; compact?: boolean; inSheet?: boolean }) {
  const low = used >= 70;
  return (
    <Link
      href="/usage"
      title="Your credits this month. Click to see where they went."
      className={`flex min-h-11 items-center gap-[9px] rounded-[10px] py-1 text-sm text-ink hover:bg-hover ${compact ? "justify-center" : inSheet ? "min-h-12 gap-3 px-3" : "pr-2 pl-2.5"}`}
    >
      <Icon name="credits" />
      <span className={`flex min-w-0 flex-col gap-px ${compact ? "sr-only" : ""}`}>
        Credits
        <span className={`text-[11.5px] font-medium whitespace-nowrap ${low ? "text-accent" : "text-good"}`}>
          {low ? "Running low" : "On track"} · {used}% used
        </span>
      </span>
    </Link>
  );
}

export function YouCorner({
  settingsHref,
  settingsLabel,
  creditsUsed,
  compact = false,
}: {
  settingsHref: string;
  settingsLabel: string;
  creditsUsed: number;
  /** Icons only (the left rail on narrower screens). */
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <CreditsLink used={creditsUsed} compact={compact} />
      <Link
        href={settingsHref}
        title={compact ? settingsLabel : undefined}
        className={`flex min-h-11 items-center gap-2.5 rounded-[10px] text-sm text-ink hover:bg-hover ${compact ? "justify-center" : "px-2.5"}`}
      >
        <Icon name="settings" />
        <span className={compact ? "sr-only" : ""}>{settingsLabel}</span>
      </Link>
      {compact ? (
        <div className="mt-1.5 flex flex-col items-center gap-1 border-t border-line pt-3">
          <NameMenu compact />
          <ThemeButton />
          <span className="hidden dev:block" title="Developer view is on">
            <span className="block size-2 rounded-full bg-dev" />
          </span>
        </div>
      ) : (
        <>
          <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-line pt-3 pl-2">
            <NameMenu />
            <ThemeButton />
          </div>
          <div className="pl-[50px]">
            <DevChip />
          </div>
        </>
      )}
    </div>
  );
}
