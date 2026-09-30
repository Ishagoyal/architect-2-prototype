import { Icon, type IconName } from "@/components/Icon";
import { Placeholder } from "@/components/Placeholder";
import { demoProject } from "@/lib/demo";

/* App view, mid-build (design A11). Journey 1 makes this move through real states. */

const meals = [
  { name: "Rajma chawal", sides: "Rajma, rice, onion salad", time: "45 min" },
  { name: "Aloo gobi meal", sides: "Aloo gobi, phulka, raita", time: "30 min" },
  { name: "Dal tadka meal", sides: "Dal, jeera rice, salad", time: "35 min" },
];

const tools: { label: string; icon: IconName; tip: string; on?: boolean }[] = [
  { label: "Desktop", icon: "desktop", tip: "See your app at computer size", on: true },
  { label: "Phone", icon: "phone", tip: "See your app at phone size" },
  { label: "Select", icon: "select", tip: "Click any part of your app to change it" },
  { label: "Try as a user", icon: "user", tip: "Open your app signed in as a test user, with sample data" },
];

export default async function AppView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Only the demo meal app has a preview so far.
  if (id !== demoProject.id) return <Placeholder title="App" />;
  return (
    <>
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2 text-[13px] md:px-5">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <strong className="font-semibold">Building step 3 of 5: meal suggestions</strong>
          <span className="flex gap-1" aria-label="Step 3 of 5">
            {["bg-good", "bg-good", "bg-progress", "bg-todo", "bg-todo"].map((c, i) => (
              <span key={i} className={`h-1.5 w-[22px] rounded-[3px] ${c}`} />
            ))}
          </span>
          <span title="Credits this build has used so far" className="text-ink-2 max-sm:text-xs">
            Used 3% of this month’s credits so far
          </span>
        </span>
        <button
          type="button"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-line-strong px-3 text-[13px]"
        >
          <Icon name="stop" size={14} strokeWidth={2} />
          Stop
        </button>
      </div>

      <div className="hidden shrink-0 items-center gap-2.5 border-b border-line bg-info-soft px-5 py-2.5 text-[13px] text-info dev:flex">
        <Icon name="code" size={15} strokeWidth={2} />
        <span>
          <strong className="font-semibold">Developer view is on.</strong> Code and agent files are visible. Editing
          unlocks after the current step.
        </span>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4 text-[13px] text-ink-2 md:px-5">
        <button
          type="button"
          title="Which page of your app you’re looking at. Pick another page to see it."
          className="flex h-[30px] items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 text-ink"
        >
          Page: <strong className="font-semibold">Today</strong>
          <Icon name="chevronDown" size={12} strokeWidth={2} />
        </button>
        <span className="flex items-center gap-1 md:gap-3">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.tip}
              aria-pressed={t.on ?? false}
              className={`flex h-[30px] items-center gap-[5px] rounded-lg px-2 whitespace-nowrap md:px-2.5 ${
                t.on ? "border border-ink font-medium text-ink" : "hover:text-ink"
              }`}
            >
              <Icon name={t.icon} size={15} />
              <span className="sr-only lg:not-sr-only">{t.label}</span>
            </button>
          ))}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4 md:p-5">
        <div className="flex flex-col gap-1 rounded-xl bg-info-soft px-4 py-3.5 text-[13px] text-info">
          <span className="font-semibold">Step 3 result: your app&apos;s AI is answering</span>
          <span>We asked it: &quot;Rice, dal, aloo, tomato, gobi. Dinner for 4, vegetarian?&quot;</span>
        </div>

        {/* The user's app keeps its own colours. */}
        <div className="flex flex-1 flex-col gap-3.5 rounded-[14px] border border-line bg-[#FFF6EA] p-5 text-[#17171B] md:p-[22px]">
          <span className="text-xs font-semibold tracking-[0.08em] text-[#B4470F]">TONIGHT · FOR 4 PEOPLE</span>
          <span className="font-serif text-[40px] leading-none text-[#2A1A10]">Dinner ke liye?</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {meals.map((m) => (
              <div key={m.name} className="flex flex-col gap-1 rounded-[10px] border border-[#F0DDD0] bg-white p-3">
                <span className="text-sm font-semibold">{m.name}</span>
                <span className="text-xs text-[#55555E]">{m.sides}</span>
                <span className="text-[11px] font-medium text-[#1F6F4A]">{m.time} · uses what you have</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-[#F2A36B] bg-[#FFFBF6] p-3.5">
            <span className="text-[13px] font-medium text-[#8A3409]">Writing this now: &quot;Send to Didi&quot; button</span>
            <span className="rounded-full bg-[#FBEDE4] px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap text-[#8A3409]">
              in progress
            </span>
          </div>
          <div className="rounded-xl border border-dashed border-[#DAD6CC] p-3.5 text-[13px] text-[#55555E]">
            Coming next: Inventory (step 4)
          </div>
        </div>
      </div>
    </>
  );
}
