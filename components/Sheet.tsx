"use client";

import { useEffect } from "react";
import { Icon } from "./Icon";

/* A panel that slides up from the bottom (phones and narrow screens). */
export function Sheet({
  open,
  onClose,
  label,
  children,
  tall = false,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** Nearly full height, for the Needs you + chat sheet. */
  tall?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-scrim" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`pb-safe relative flex flex-col overflow-hidden rounded-t-2xl border-t border-line bg-panel shadow-pop ${
          tall ? "h-[88dvh]" : "max-h-[80dvh]"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-2.5 pb-1">
          <span className="absolute top-2 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="pt-2 text-[13px] font-semibold">{label}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-1 flex size-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-hover"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
