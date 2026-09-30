"use client";

import { useEffect } from "react";

/* A small centred pop-up (Stop building?, A suggested change is waiting). */
export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-scrim" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative flex w-full max-w-[440px] flex-col gap-3 rounded-2xl bg-panel p-6 shadow-pop">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-col gap-3 text-[15px] leading-normal text-ink-2 [&_strong]:font-semibold [&_strong]:text-ink">{children}</div>
        <div className="mt-2 flex flex-wrap justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
}

export const btnPrimary = "flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-[13px] font-medium whitespace-nowrap text-on-primary disabled:opacity-60";
export const btnOutline = "flex h-10 items-center justify-center rounded-[10px] border border-line-strong bg-panel px-4 text-[13px] whitespace-nowrap hover:bg-hover";
