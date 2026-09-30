/* Stand-in for screens built in later steps of the build plan. */
export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6 md:p-10">
      <h1 className="font-serif text-4xl leading-tight">{title}</h1>
      <p className="max-w-md text-sm text-ink-2">{note ?? "This screen comes in a later step of the prototype."}</p>
    </div>
  );
}
