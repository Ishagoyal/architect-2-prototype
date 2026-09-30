"use client";

import { useEffect, useRef, useState } from "react";
import { buildIdea, startDemo } from "@/app/actions";
import { forgetDemo } from "@/lib/tour";

/* The landing page's buttons that start the demo. They work like "Try the demo" on the
   sign-up screen: the demo starts from the beginning each time. */

export const HERO_PROMPT =
  "Build an AI meal assistant for Indian households that have a cook. Every day, the cook asks the household meal decider: “Didi, abhi kya banega?” (What should I cook now?). This app helps the decider answer that quickly.";

export function DemoButton({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <form action={startDemo} onSubmit={() => forgetDemo()} className="contents">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

/** "Describe your app": Isha's real prompt types itself once. Clicking in stops it. */
export function HeroPrompt({ inside }: { inside: boolean }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!typing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(HERO_PROMPT);
      setTyping(false);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i = Math.min(HERO_PROMPT.length, i + 2);
      setText(HERO_PROMPT.slice(0, i));
      if (i < HERO_PROMPT.length) timer = setTimeout(step, 28);
      else setTyping(false);
    };
    timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, [typing]);

  return (
    <form
      ref={form}
      action={buildIdea}
      onSubmit={() => {
        // Someone new starts the demo from the beginning, as "Try the demo" does.
        if (!inside) forgetDemo();
      }}
      className="flex flex-col gap-4 rounded-[18px] border border-white/15 bg-white/[0.04] p-5 md:p-[22px]"
    >
      <label htmlFor="hero-idea" className="text-xs font-medium tracking-[0.08em] text-[#BDB9B0] uppercase">
        Describe your app
      </label>
      <textarea
        id="hero-idea"
        name="idea"
        value={text}
        rows={5}
        onFocus={() => setTyping(false)}
        onPointerDown={() => setTyping(false)}
        onChange={(e) => {
          setTyping(false);
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) form.current?.requestSubmit();
          }
        }}
        placeholder="An app that…"
        className="min-h-[210px] resize-none sm:min-h-[132px] border-0 bg-transparent p-0 text-[17px] leading-[1.55] text-[#F6F4EF] caret-[#F2A36B] outline-none placeholder:text-[#8A877F]"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[#BDB9B0]">It types itself. Write your own, or keep it.</span>
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-11 shrink-0 items-center rounded-[10px] bg-[#F6F4EF] px-4 text-[15px] font-medium text-[#17171B] disabled:opacity-60"
        >
          Build it →
        </button>
      </div>
    </form>
  );
}
