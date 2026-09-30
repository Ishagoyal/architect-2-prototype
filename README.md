# Architect 2.0 prototype

**Isha Goyal** · Technical PM assignment, Lyzr

Architect 2.0 is a vibe-coding platform for people who don't code and for developers. You describe an app, check the plan, and watch it get built step by step, with every step checked against what you asked for. Then you connect GitHub and go live.

**Live:** https://architect-2-prototype-steel.vercel.app

## Try it

- **Try the demo** (no sign-up): press **Try the demo**. A guide walks you through 5 journeys. Press **Show me** at each step and it does the clicks for you.
- **Six problems:** the landing page lists six problems I hit building my own app with AI. Each has a **See it** button that opens the screen that answers it.
- **Your own account:** sign up with Google, GitHub or email. Your projects are saved.

## The 5 journeys

1. **Build from a prompt:** describe a meal planner in one sentence, check the details, read the plan, and watch it build step by step.
2. **Agents:** the app's AI in plain words, and a 9 PM automation that keeps failing, with a suggested fix.
3. **GitHub:** move the code to your own GitHub, get a teammate's changes, and sort out a clash.
4. **Deploy:** go live, and see what happens when the live check fails.
5. **Import a project:** bring in an app you already have from GitHub.

Journeys 1–4 use one app, Abhi Kya Banega. Journey 5 imports a second app, OrderBook.

Every screen also has a **Developer view** (the chip under your name) that adds technical details, and a **dark mode** (☾ at the bottom left).

## What's real and what's a dummy flow

| Real | Dummy flow |
|---|---|
| Sign-in with Google, GitHub or email (Supabase) | Building: no AI is called. The plan and build are ready-made, using your app's name |
| Saving your projects (Supabase database) | Tests, versions, agents, GitHub and deploy screens |
| | Credits and costs are example numbers, not real data |

It works on desktop and phone, in light and dark.

## Architecture

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how architect.new works today, and how I'd build Architect 2.0
- Diagrams: [Architect 2.0 services](docs/architect-2.0-diagram.png) · [From prompt to live app](docs/architect-2.0-flow.png) · [architect.new today](docs/architect-today.png)
- [`docs/PRODUCT.md`](docs/PRODUCT.md): how each screen behaves, and why
- [`design/`](design/README.md): every screen from the design file

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase keys it runs in demo-only mode.

To turn on sign-in and saving:
1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key.

Built with Next.js, Tailwind CSS and Supabase, hosted on Vercel.
