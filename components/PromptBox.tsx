"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { BuilderMenu } from "./project/Panel";

/* The big "Describe your app" box on Home. Sending it opens Refine (step 3 of the build plan). */
export function PromptBox({ heading, ideas, initial = "" }: { heading: string; ideas: string[]; initial?: string }) {
  const [text, setText] = useState(initial);
  const router = useRouter();
  const go = () => {
    if (text.trim()) router.push(`/new?idea=${encodeURIComponent(text.trim())}`);
  };
  const empty = text.trim() === "";
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="mt-7 flex flex-col gap-4 rounded-[18px] border border-line-strong bg-panel p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:mt-9 md:p-[22px]"
      >
        <textarea
          aria-label="Describe your app"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              go();
            }
          }}
          placeholder="Describe your app — e.g. an agent that answers customer questions from our help docs"
          rows={3}
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-base leading-normal outline-none placeholder:text-ink-3 md:text-[17px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add files, import from GitHub or bring an agent"
              className="flex size-10 items-center justify-center rounded-[10px] border border-line-strong bg-panel"
            >
              <Icon name="plus" size={16} strokeWidth={2} />
            </button>
            <BuilderMenu size="md" placement="down" />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Speak instead of typing"
              className="flex size-10 items-center justify-center rounded-[10px] border border-line-strong bg-panel"
            >
              <Icon name="mic" size={16} />
            </button>
            <button
              type="submit"
              aria-label="Send"
              disabled={empty}
              className="flex size-10 items-center justify-center rounded-[10px] bg-primary text-on-primary disabled:cursor-default disabled:bg-line-strong disabled:text-panel"
            >
              <Icon name="send" size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-between text-[13px]">
        <span className="text-ink-2">{heading}</span>
        <Link href="/explore" className="font-medium text-accent hover:text-accent-strong">
          Browse templates →
        </Link>
      </div>
      <div className="mt-3 flex flex-col items-start gap-2">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => setText(idea)}
            className="rounded-full border border-line-strong bg-panel px-4 py-[11px] text-left text-sm hover:border-ink-3"
          >
            {idea}
          </button>
        ))}
      </div>
    </>
  );
}
