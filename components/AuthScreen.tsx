"use client";

import Link from "next/link";
import { useActionState } from "react";
import { continueWith, signInWithEmail, signUpWithEmail, startDemo, type AuthState } from "@/app/actions";
import { Icon } from "./Icon";
import { ThemeButton } from "./YouCorner";
import { forgetDemo } from "@/lib/tour";

/* Design A1. Sign up and sign in share it; "Try the demo" is the reviewer path. */

const points: React.ReactNode[] = [
  "Built step by step, with every step and fix checked against your words",
  "Agents built in: Lyzr or the framework you use, saved as files you own",
  "Bring what you've built: GitHub, a ZIP, Lovable, Bolt or v0",
  <>
    <strong className="font-semibold">You’ll know when something breaks. Your users won’t.</strong> A broken
    update never reaches them, and a failed daily run shows you the exact step
  </>,
  "Know the cost: what each step usually takes before you build, and what it really used after",
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-[#F6F4EF] text-[#17171B]">
        <Icon name="logo" size={17} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-px leading-tight">
        <span className="text-base font-semibold">Architect</span>
        <span className="text-xs text-[#BDB9B0]">by Lyzr</span>
      </div>
    </div>
  );
}

const field =
  "h-12 rounded-xl border border-line-strong bg-raised px-3.5 text-[15px] outline-none placeholder:text-ink-3 focus:border-ink-3";
const outlineButton =
  "flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-raised text-[15px] font-medium";

function Message({ state }: { state: AuthState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-[10px] bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
        {state.error}
      </p>
    );
  if (state?.notice)
    return (
      <p role="status" className="rounded-[10px] bg-good-soft px-3 py-2.5 text-[13px] text-good">
        {state.notice}
      </p>
    );
  return null;
}

export function AuthScreen({ mode, linkError = false }: { mode: "sign-up" | "sign-in"; linkError?: boolean }) {
  const signUp = mode === "sign-up";
  const [emailState, emailAction, emailPending] = useActionState(signUp ? signUpWithEmail : signInWithEmail, undefined);
  const [oauthState, oauthAction, oauthPending] = useActionState(continueWith, undefined);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <section className="flex shrink-0 flex-col gap-6 bg-[#17171B] px-5 py-6 text-[#F6F4EF] md:w-[44%] md:max-w-[620px] md:gap-10 md:p-14 dark:bg-[#121211]">
        <div className="flex items-center justify-between">
          <Brand />
          <ThemeButton className="text-[#F6F4EF] hover:bg-white/10 md:hidden" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <h1 className="font-serif text-[34px] leading-[1.04] tracking-[-0.01em] md:text-[50px]">
            AI writes the code. You decide what “working” means.
          </h1>
          <p className="hidden max-w-[460px] text-[17px] leading-[1.55] text-[#CFCBC2] md:block">
            Anyone can build an app with AI. Getting it to real users is the hard part. Architect is built to get yours
            there.
          </p>
          <ul className="mt-1 hidden flex-col gap-3 md:flex">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-[1.45]">
                <span className="mt-0.5 text-[#F2A36B]">
                  <Icon name="check" size={16} strokeWidth={2} />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 hidden text-[15px] text-[#CFCBC2] italic md:block">
            On Auto if you don’t code. Full control if you do.
          </p>
        </div>
        <div className="-mb-2 -ml-2 hidden md:block">
          <ThemeButton className="text-[#F6F4EF] hover:bg-white/10" />
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-8 md:px-10">
        <div className="flex w-full max-w-[400px] flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[36px] leading-[1.05] md:text-[42px]">
              {signUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-[15px] text-ink-2">Use Google, GitHub or your email.</p>
          </div>

          {linkError && <Message state={{ error: "That sign-in link didn’t work. It may have expired or been used already. Try again below." }} />}

          <form action={oauthAction} className="flex flex-col gap-5">
            <button type="submit" name="provider" value="google" disabled={oauthPending} className={outlineButton}>
              <span className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-current text-[11px] font-semibold">
                G
              </span>
              Continue with Google
            </button>
            <button type="submit" name="provider" value="github" disabled={oauthPending} className={outlineButton}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="8" r="2" />
                <path d="M6 8 V16" />
                <path d="M18 10 C18 14 12 13 6.5 16.5" />
              </svg>
              Continue with GitHub
            </button>
            <Message state={oauthState} />
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[13px] text-ink-2">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form action={emailAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" className={field} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={signUp ? "new-password" : "current-password"}
                placeholder={signUp ? "At least 8 characters" : "Your password"}
                className={field}
              />
            </div>
            <button
              type="submit"
              disabled={emailPending}
              className="h-12 rounded-xl bg-primary text-[15px] font-medium text-on-primary disabled:opacity-70"
            >
              {signUp ? "Create account" : "Sign in"}
            </button>
            <Message state={emailState} />
          </form>

          <p className="text-center text-sm text-ink-2">
            {signUp ? (
              <>
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-accent hover:text-accent-strong">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/" className="font-medium text-accent hover:text-accent-strong">
                  Create an account
                </Link>
              </>
            )}
          </p>

          <form
            action={startDemo}
            onSubmit={() => {
              // Every visit starts from the beginning, in the default view.
              forgetDemo();
            }}
            className="flex items-center justify-between gap-3 rounded-xl border border-accent-line bg-needs px-4 py-3"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Just looking?</span>
              <span className="text-xs text-ink-2">Watch an app get built. No sign-up.</span>
            </span>
            <button
              type="submit"
              className="flex h-10 shrink-0 items-center rounded-[10px] bg-primary px-4 text-[13px] font-medium text-on-primary"
            >
              Try the demo
            </button>
          </form>

          {signUp && (
            <p className="text-center text-xs text-ink-2">
              By continuing you agree to the{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
