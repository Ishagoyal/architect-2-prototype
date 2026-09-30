"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Modal, btnOutline, btnPrimary } from "./Modal";
import { useAddOn } from "@/lib/addon";

/* The Developer add-on, as a pretend purchase: what it adds, an example price, and a free trial
   that turns it on in this browser. Opened from any lock ("Unlock") and from Settings → Your plan. */

export const addOnFeatures = [
  "Pick the exact AI model that builds your app",
  "A credit limit for each project",
  "Tokens used by each step",
  "Edit the code and use the terminal",
  "Two-way sync with your own GitHub repo",
  "A usage report by person, for teams",
];

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setAddOn } = useAddOn();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Developer add-on"
      actions={
        <>
          <button type="button" onClick={onClose} className={btnOutline}>Not now</button>
          <button
            type="button"
            onClick={() => {
              setAddOn(true);
              onClose();
            }}
            className={btnPrimary}
          >
            Start free trial
          </button>
        </>
      }
    >
      <p>For people who want full control. It adds:</p>
      <ul className="flex flex-col gap-2 text-ink">
        {addOnFeatures.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-good">
              <Icon name="check" size={14} strokeWidth={2.4} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <strong>₹1,500 a month</strong> <span className="text-xs">(example price)</span>, on top of your plan.
      </p>
      <p className="rounded-lg bg-sunken px-3 py-2 text-xs">Prototype: no payment, and it stays in this browser. Turn it off any time in Settings → Your plan.</p>
    </Modal>
  );
}

/** A button that opens the upgrade window. */
export function UnlockButton({ className = "", children = "Unlock" }: { className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <UpgradeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
