"use client";

import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export type Tab = { label: string; icon: IconName; href?: string; onClick?: () => void; active?: boolean };

/* Phone only: the sidebar or left rail becomes this bar. */
export function BottomTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel md:hidden"
    >
      <ul className="flex">
        {tabs.map((t) => {
          const inner = (
            <>
              <Icon name={t.icon} size={20} />
              <span className="text-[11px]">{t.label}</span>
            </>
          );
          const cls = `flex h-14 w-full flex-col items-center justify-center gap-0.5 ${
            t.active ? "font-medium text-ink" : "text-ink-3"
          }`;
          return (
            <li key={t.label} className="flex-1">
              {t.href ? (
                <Link href={t.href} aria-current={t.active ? "page" : undefined} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={t.onClick} className={cls}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A plain row in a phone "More" sheet. */
export function SheetRow({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: IconName;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex min-h-12 items-center gap-3 rounded-[10px] px-3 text-sm hover:bg-hover">
      <Icon name={icon} />
      <span className="flex min-w-0 flex-1 flex-col">{children}</span>
    </Link>
  );
}
