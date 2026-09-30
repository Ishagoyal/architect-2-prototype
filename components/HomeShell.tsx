"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { YouCorner, ThemeButton, NameMenu, DevChip, CreditsLink } from "./YouCorner";
import { BottomTabs, SheetRow } from "./BottomTabs";
import { Sheet } from "./Sheet";
import { demoUser } from "@/lib/demo";

/* Home, Projects, Agents and the account pages share this sidebar.
   Phone: the sidebar becomes a bottom tab bar, with the rest under "More". */

const nav: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "/home", icon: "home" },
  { label: "Projects", href: "/projects", icon: "folder" },
  { label: "Agents", href: "/agents", icon: "agent" },
  { label: "Explore", href: "/explore", icon: "explore" },
  { label: "Help & Learn", href: "/help", icon: "help" },
];

const CREDITS_USED = 0;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-[9px] bg-primary text-on-primary">
        <Icon name="logo" size={16} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-px leading-tight">
        <span className="text-[15px] font-semibold">Architect</span>
        <span className="text-[11px] text-ink-2">by Lyzr</span>
      </div>
    </div>
  );
}

function WorkspaceButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      className={`flex items-center justify-between rounded-[10px] border border-line bg-raised text-[13px] ${
        compact ? "h-9 gap-1.5 px-2" : "h-11 w-full px-3"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-white dark:text-on-primary">
          {demoUser.firstName[0]}
        </span>
        <span className="truncate">{demoUser.workspace}</span>
      </span>
      <Icon name="chevronDown" size={14} strokeWidth={2} />
    </button>
  );
}

export function HomeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const closeMore = useCallback(() => setMore(false), []);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = ["/help", "/usage", "/settings"].some(isActive);

  return (
    <div className="flex min-h-dvh md:h-dvh">
      {/* Desktop and tablet sidebar */}
      <nav
        aria-label="Main"
        className="hidden w-[248px] shrink-0 flex-col gap-0.5 border-r border-line bg-rail px-3.5 pt-5 pb-4 md:flex"
      >
        <div className="px-2 pt-1 pb-4">
          <Logo />
        </div>
        <div className="mb-3.5">
          <WorkspaceButton />
        </div>
        {nav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-ink ${
                active ? "bg-raised font-medium" : "hover:bg-hover"
              }`}
            >
              <Icon name={n.icon} />
              {n.label}
            </Link>
          );
        })}
        <div className="flex-1" />
        <YouCorner settingsHref="/settings" settingsLabel="Settings" creditsUsed={CREDITS_USED} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phone top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-rail px-4 md:hidden">
          <WorkspaceButton compact />
          <div className="flex items-center gap-1">
            <DevChip />
            <ThemeButton />
            <NameMenu compact placement="down" />
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-20 md:overflow-y-auto md:pb-0">{children}</main>
      </div>

      <BottomTabs
        label="Main"
        tabs={[
          ...nav.slice(0, 4).map((n) => ({ ...n, active: isActive(n.href) })),
          { label: "More", icon: "more" as const, onClick: () => setMore(true), active: moreActive },
        ]}
      />
      <Sheet open={more} onClose={closeMore} label="More">
        <div className="flex flex-col gap-0.5 px-2 pb-4">
          <SheetRow href="/help" icon="help" onClick={closeMore}>
            Help & Learn
          </SheetRow>
          <div onClick={closeMore}>
            <CreditsLink used={CREDITS_USED} inSheet />
          </div>
          <SheetRow href="/settings" icon="settings" onClick={closeMore}>
            Settings
          </SheetRow>
        </div>
      </Sheet>
    </div>
  );
}
