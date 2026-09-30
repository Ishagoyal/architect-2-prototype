import { PromptBox } from "@/components/PromptBox";

const ideas = [
  "A feedback agent that tags and summarises user interviews",
  "A PRD assistant that drafts specs from Slack threads",
  "An agent that answers customer questions from our docs",
  "A weekly metrics digest that emails the team",
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col px-4 pt-10 pb-10 md:px-6 md:pt-[160px]">
      <h1 className="text-center font-serif text-[44px] leading-[1.05] md:text-[64px]">What should it do?</h1>
      <p className="mt-3 text-center text-[15px] text-ink-2 md:mt-5 md:text-lg">
        Every step gets checked against what you asked for.
      </p>
      <PromptBox ideas={ideas} />
    </div>
  );
}
