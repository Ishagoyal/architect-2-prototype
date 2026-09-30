"use client";

import { useState, useTransition } from "react";
import { saveOnboarding } from "@/app/actions";
import { developerRoles, roles } from "@/lib/demo";
import { usePrefs } from "@/lib/prefs";
import { Icon } from "./Icon";
import { ThemeButton } from "./YouCorner";

/* Design A2. The role only sets starting defaults: ideas on Home, and
   Developer view for developers, solutions architects and GitHub sign-ups. */
export function Onboarding({ suggestedName, viaGithub }: { suggestedName: string; viaGithub: boolean }) {
  const [name, setName] = useState(suggestedName);
  const [picked, setPicked] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { setDevView } = usePrefs();

  const submit = (skip: boolean) => {
    const role = skip ? "" : custom.trim() || picked || "";
    if (viaGithub || developerRoles.includes(role)) setDevView(true);
    const form = new FormData();
    form.set("name", name);
    form.set("role", role);
    setError(null);
    start(async () => {
      const result = await saveOnboarding(form);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="flex w-full max-w-[620px] flex-col gap-7 rounded-3xl border border-line bg-panel p-6 shadow-[0_10px_30px_rgba(23,23,27,0.06)] md:p-11"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-primary text-on-primary">
            <Icon name="logo" size={17} strokeWidth={2.2} />
          </div>
          <h1 className="font-serif text-[36px] leading-[1.05] md:text-[42px]">Welcome to Architect</h1>
          <p className="text-[15px] text-ink-2">Two quick things so we can suggest ideas that fit you.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ob-name" className="text-sm font-medium">
            Your name
          </label>
          <input
            id="ob-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="h-12 rounded-xl border border-line-strong bg-raised px-3.5 text-[15px] outline-none focus:border-ink-3"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium" id="role-label">
              What do you do?
            </span>
            <span className="text-[13px] text-ink-2">Optional</span>
          </div>
          <div role="group" aria-labelledby="role-label" className="flex flex-wrap gap-2.5">
            {roles.map((r) => {
              const on = picked === r && !custom.trim();
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setPicked(on ? null : r);
                    setCustom("");
                  }}
                  className={`h-11 rounded-full border px-4 text-sm ${
                    on ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-raised hover:border-ink-3"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <label htmlFor="ob-role" className="text-[13px] text-ink-2">
            Or describe your role
          </label>
          <input
            id="ob-role"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Operations lead at a clinic"
            className="-mt-1 h-12 rounded-xl border border-line-strong bg-raised px-3.5 text-[15px] outline-none placeholder:text-ink-3 focus:border-ink-3"
          />
          <p className="text-[13px] text-ink-2">
            We use this to tailor your starter ideas. You can change it anytime in Settings.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-[10px] bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => submit(true)} disabled={pending} className="text-sm text-ink-2 hover:text-ink">
            Skip for now
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-12 rounded-xl bg-primary px-7 text-[15px] font-medium text-on-primary disabled:opacity-70"
          >
            Continue
          </button>
        </div>
      </form>
      <div className="fixed bottom-4 left-4">
        <ThemeButton />
      </div>
    </div>
  );
}
