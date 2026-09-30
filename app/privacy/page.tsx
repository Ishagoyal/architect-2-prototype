import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy · Architect" };

/* Needed for Google sign-in (its Branding page asks for a privacy policy link).
   Facts about what this prototype stores, not promises. */
export default function Privacy() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-6 px-4 py-12 md:py-20">
      <Link href="/" className="text-sm text-ink-2 hover:text-ink">
        ← Architect
      </Link>
      <h1 className="font-serif text-5xl leading-none">Privacy</h1>
      <p className="text-[15px] leading-relaxed">Architect is a prototype made for a job application. It isn’t a real product.</p>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-[15px] leading-relaxed">
        <li>
          <strong className="font-semibold">If you sign up:</strong> we save your email, the name and role you give, and the projects you make. They’re stored in
          Supabase.
        </li>
        <li>
          <strong className="font-semibold">Google or GitHub sign-in:</strong> we get your name, email and profile picture from them.
        </li>
        <li>
          <strong className="font-semibold">The demo:</strong> everything stays in your browser. Leaving the demo deletes it.
        </li>
        <li>There are no ads or trackers on this site.</li>
        <li>
          To delete your account, open an issue on{" "}
          <a href="https://github.com/Ishagoyal/architect-2-prototype/issues" className="text-accent underline underline-offset-2">
            the project’s GitHub page
          </a>
          .
        </li>
      </ul>
    </main>
  );
}
