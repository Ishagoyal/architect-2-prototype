import Link from "next/link";
import { PromptBox } from "@/components/PromptBox";
import { demoCards, ideasFor, type ProjectCard } from "@/lib/demo";
import { requireViewer } from "@/lib/require-viewer";

/* A3 for someone new, A25 for someone with projects (the demo). */
export default async function Home() {
  const viewer = await requireViewer();
  const { heading, ideas } = ideasFor(viewer.role);
  const returning = viewer.kind === "demo";

  return (
    <div
      className={`mx-auto flex w-full max-w-[760px] flex-col px-4 pt-10 pb-24 md:px-6 md:pb-10 ${
        returning ? "md:pt-11" : "md:pt-[160px]"
      }`}
    >
      <h1 className={`text-center font-serif text-[40px] leading-[1.05] ${returning ? "md:text-[56px]" : "md:text-[64px]"}`}>
        {returning ? `Welcome back, ${viewer.firstName}. What are we building next?` : "What should it do?"}
      </h1>
      <p className="mt-3 text-center text-[15px] text-ink-2 md:mt-4 md:text-lg">
        {returning ? "Describe a new idea, or pick up a project below." : "Every step gets checked against what you asked for."}
      </p>
      <PromptBox heading={heading} ideas={ideas} />

      {returning && (
        <section className="mt-9">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Continue where you left off</h2>
            <Link href="/projects" className="text-[13px] font-medium text-accent hover:text-accent-strong">
              View all →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {demoCards.map((c) => (
              <Card key={c.id} card={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const cover = {
  clay: "bg-[#F4E3CC] text-[#7A3A12] dark:bg-accent-soft dark:text-accent",
  blue: "bg-info-soft text-info",
  stone: "bg-[#EEEBE3] text-ink dark:bg-sunken",
};

const status = {
  Live: "bg-good-soft text-good",
  Building: "bg-info-soft text-info",
  "Not built yet": "bg-sunken text-ink-2",
};

function Card({ card }: { card: ProjectCard }) {
  return (
    <Link
      href={`/p/${card.id}/app`}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-3 hover:border-line-strong"
    >
      <span className={`flex h-[60px] items-end rounded-[10px] px-3 pb-2 font-serif text-[22px] ${cover[card.tone]}`}>
        {card.cover}
      </span>
      <span className="text-sm">{card.name}</span>
      <span className="flex items-center justify-between gap-2 text-xs text-ink-2">
        {card.edited}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status[card.status]}`}>{card.status}</span>
      </span>
    </Link>
  );
}
