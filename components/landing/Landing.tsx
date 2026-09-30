import Image from "next/image";
import Link from "next/link";
import { Icon } from "../Icon";
import { ThemeButton } from "../YouCorner";
import { DemoButton, HeroPrompt } from "./LandingActions";
import { problems, type Problem } from "@/lib/story";

/* The public landing page: Isha's story as a developer, six problems from her notes,
   and a "See it" button for each that opens a scene of the real app. */

const REPO = "https://github.com/Ishagoyal/architect-2-prototype";

const dark = "bg-[#17171B] text-[#F6F4EF] dark:bg-[#121211]";
const wrap = "mx-auto w-full max-w-[1200px] px-4 md:px-8 xl:px-0";
const eyebrow = "text-xs font-semibold tracking-[0.1em] text-ink-2 uppercase";
const lightButton = "flex h-10 shrink-0 items-center rounded-[10px] bg-[#F6F4EF] px-3 text-sm md:h-11 md:px-4 md:text-[15px] font-medium whitespace-nowrap text-[#17171B] hover:bg-white";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-[#F6F4EF] text-[#17171B]">
        <Icon name="logo" size={17} strokeWidth={2.2} />
      </span>
      <span className="flex flex-col gap-px leading-tight">
        <span className="text-base font-semibold whitespace-nowrap">Architect 2.0</span>
        <span className="text-xs text-[#BDB9B0]">by Lyzr</span>
      </span>
    </Link>
  );
}

function TopBar({ inside }: { inside: boolean }) {
  return (
    <header className={`${wrap} flex items-center justify-between gap-3 py-5 md:py-6`}>
      <Brand />
      <nav aria-label="Account" className="flex items-center gap-1.5 md:gap-3">
        <ThemeButton className="text-[#F6F4EF] hover:bg-white/10" />
        {inside ? (
          <Link href="/home" className={lightButton}>
            Open Architect
          </Link>
        ) : (
          <>
            <Link href="/sign-in" className="flex h-10 items-center rounded-[10px] px-2 text-sm whitespace-nowrap hover:bg-white/10 md:h-11 md:px-3 md:text-[15px]">
              Sign in
            </Link>
            <DemoButton className={lightButton}>Try the demo</DemoButton>
          </>
        )}
      </nav>
    </header>
  );
}

function Hero({ inside }: { inside: boolean }) {
  return (
    <section className={`${wrap} grid grid-cols-1 items-center gap-10 pt-8 pb-16 md:pt-14 md:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16`}>
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-[46px] leading-[1.02] tracking-[-0.01em] sm:text-[60px] lg:text-[76px]">AI writes the code. You decide what “working” means.</h1>
        <p className="max-w-[560px] text-lg leading-normal md:text-xl">Writing code with AI is easy. Getting the correct result is hard.</p>
        <p className="max-w-[440px] text-base leading-normal text-[#CFCBC2] md:text-[17px]">I learned that building my own app, so I designed Architect 2.0 around it.</p>
      </div>
      <div className="flex flex-col gap-3">
        <HeroPrompt inside={inside} />
        <div className="text-[13px] leading-normal text-[#CFCBC2]">
          <DemoButton className="inline font-medium text-[#F6F4EF] underline underline-offset-4 hover:text-white">Or open a ready project</DemoButton>
          <span aria-hidden="true"> · </span>
          No sign-up. This is a demo, so the answers are ready-made.
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className={`${wrap} grid grid-cols-1 items-center gap-12 py-16 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-20`}>
      <div className="flex max-w-[560px] flex-col gap-5">
        <span className={eyebrow}>Why I built this</span>
        <h2 className="font-serif text-[40px] leading-[1.05] md:text-[56px]">I’m the user, the product person and the engineer.</h2>
        <p className="text-[17px] leading-relaxed text-ink-2">
          I’m building <strong className="font-semibold text-ink">CookBridge</strong>, a meal helper for Indian homes with a cook. It runs on WhatsApp, because that’s where families already talk to their cook.
        </p>
        <p className="text-[17px] leading-relaxed text-ink-2">I built it with Codex and Claude Code, OpenAI for the agent, Render and MongoDB Atlas.</p>
        <p className="text-xl leading-normal">The code came fast. It still doesn’t work the way I want.</p>
        <p className="text-[17px] leading-relaxed text-ink-2">So I wrote down every problem. Architect 2.0 answers them, one by one.</p>
        <p className="font-serif text-[28px] italic">Isha Goyal</p>
      </div>
      <figure className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-3 lg:max-w-none">
        <Image
          src="/landing/notebook.jpg"
          width={900}
          height={1190}
          sizes="(min-width: 1024px) 460px, 90vw"
          alt="A handwritten notebook page. My biggest problem: writing code with AI is easy, but getting the correct result is hard. Why? Test cases are written by AI, which always pass. Deploy, used by real users, bug, fix it, deploy, different bug, use it, fix it, deploy."
          className="w-full rotate-[2deg] rounded-sm shadow-[0_18px_40px_rgba(23,23,27,0.18)] dark:brightness-90"
        />
        <figcaption className="text-[13px] text-ink-2">From my notebook</figcaption>
      </figure>
    </section>
  );
}

function ProblemRow({ p }: { p: Problem }) {
  const pictureLeft = p.n % 2 === 0;
  return (
    <article id={`problem-${p.n}`} className="grid scroll-mt-6 grid-cols-1 items-center gap-8 border-t border-line py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
      <div className={`flex flex-col gap-4 ${pictureLeft ? "lg:order-2" : ""}`}>
        <span className="font-mono text-[13px] text-ink-2">
          {String(p.n).padStart(2, "0")} · {p.label}
        </span>
        <h3 className="font-serif text-[32px] leading-[1.1] md:text-[40px]">“{p.quote}”</h3>
        {p.extra && <p className={p.extraMono ? "font-mono text-[13px] leading-relaxed text-ink-2" : "text-base leading-relaxed text-ink-2 md:text-[17px]"}>{p.extra}</p>}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-[0.1em] text-good uppercase">In 2.0</span>
          <p className="text-base leading-relaxed md:text-[17px]">{p.answer}</p>
        </div>
        <Link href={`/scene/${p.n}`} className="mt-2 flex h-11 items-center self-start rounded-[10px] border border-line-strong bg-panel px-4 text-[15px] hover:bg-hover">
          See it in the demo: {p.button} →
        </Link>
      </div>
      <div className={pictureLeft ? "lg:order-1" : ""}>
        <Image
          src={p.image}
          width={p.size[0]}
          height={p.size[1]}
          sizes="(min-width: 1024px) 600px, 92vw"
          alt={p.alt}
          className="h-auto w-full rounded-2xl border border-line shadow-[0_18px_40px_rgba(23,23,27,0.10)] dark:brightness-90"
        />
      </div>
    </article>
  );
}

function Problems() {
  return (
    <section className={`${wrap} pb-8`}>
      <div className="flex max-w-[640px] flex-col gap-5 border-t border-line pt-16 pb-12 md:pt-28 md:pb-16">
        <span className={eyebrow}>Six problems from my notes</span>
        <h2 className="font-serif text-[40px] leading-[1.05] md:text-[64px]">Built isn’t the same as working.</h2>
        <p className="text-[17px] leading-relaxed text-ink-2 md:text-lg">
          Each problem is in my own words. Next to it is the screen in Architect 2.0 that answers it, and a link that opens that screen in the demo.
        </p>
      </div>
      {problems.map((p) => (
        <ProblemRow key={p.n} p={p} />
      ))}
    </section>
  );
}

const lyzrPoints = [
  "Two views, one app: on Auto if you don’t code, full control if you do",
  "Agents in Lyzr or the framework you use, saved as files you own",
  "Bring what you’ve built: GitHub, a ZIP, Lovable, Bolt or v0",
  "Works on your phone",
];

function Lyzr() {
  return (
    <section className={`${wrap} grid grid-cols-1 gap-10 border-t border-line py-16 md:py-28 lg:grid-cols-2 lg:gap-16`}>
      <div className="flex flex-col gap-5">
        <span className={eyebrow}>Built on Lyzr</span>
        <h2 className="font-serif text-[40px] leading-[1.05] md:text-[56px]">Built on Lyzr, not next to it.</h2>
        <p className="text-[17px] leading-relaxed text-ink-2 md:text-lg">
          Your app’s AI uses Lyzr Studio’s models, tools and scheduler. You see them, and fix them, inside your project, without opening a second product.
        </p>
      </div>
      <ul className="flex flex-col self-center">
        {lyzrPoints.map((t) => (
          <li key={t} className="flex items-start gap-3 border-b border-line py-4 text-base last:border-0 md:text-[17px]">
            <span className="mt-1 text-accent">
              <Icon name="check" size={16} strokeWidth={2.2} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

const journeys = ["Build from a prompt", "Import a project", "Agents", "GitHub", "Deploy"];

function TryIt() {
  return (
    <section className={wrap}>
      <div className={`${dark} flex flex-col items-center gap-6 rounded-[28px] px-5 py-14 text-center md:py-20`}>
        <h2 className="font-serif text-[44px] leading-none md:text-[72px]">Try it in 5 minutes.</h2>
        <ol className="flex flex-wrap justify-center gap-2">
          {journeys.map((j, i) => (
            <li key={j} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm text-[#E3E1DB]">
              {i + 1}. {j}
            </li>
          ))}
        </ol>
        <DemoButton className={`${lightButton} mt-2 h-12! px-6! text-base!`}>Try the demo</DemoButton>
        <p className="text-sm text-[#CFCBC2]">
          No sign-up. Or{" "}
          <Link href="/sign-up" className="text-[#F6F4EF] underline underline-offset-4 hover:text-white">
            create an account
          </Link>{" "}
          to save your own projects.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={`${wrap} flex flex-col gap-4 py-12 text-sm text-ink-2 md:flex-row md:items-center md:justify-between`}>
      <p className="max-w-[660px] leading-normal">
        A prototype by Isha Goyal for Lyzr’s Technical PM role. Sign-in and saved projects are real; the rest is a demo with ready-made answers.
      </p>
      <nav aria-label="About this prototype" className="flex gap-6">
        <a href={`${REPO}/blob/main/docs/ARCHITECTURE.md`} className="font-medium whitespace-nowrap text-accent hover:text-accent-strong">
          How it’s built →
        </a>
        <a href={REPO} className="font-medium whitespace-nowrap text-accent hover:text-accent-strong">
          GitHub →
        </a>
      </nav>
    </footer>
  );
}

export function Landing({ inside }: { inside: boolean }) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-bg">
      <div className={dark}>
        <TopBar inside={inside} />
      </div>
      <main>
        <div className={dark}>
          <Hero inside={inside} />
        </div>
        <Why />
        <Problems />
        <Lyzr />
        <TryIt />
      </main>
      <Footer />
    </div>
  );
}
