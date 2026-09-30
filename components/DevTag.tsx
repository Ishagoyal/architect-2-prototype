/* The small blue tag on everything that only Developer view adds.
   Wrap extra details in <DevOnly> so they appear and disappear with the setting. */

export function DevTag({ className = "" }: { className?: string }) {
  return (
    <span
      title="Only in Developer view"
      className={`inline-flex shrink-0 items-center rounded-full bg-dev-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-dev ${className}`}
    >
      Developer view
    </span>
  );
}

export function DevOnly({
  children,
  as: Tag = "div",
  className = "",
  alsoWhen = false,
}: {
  children: React.ReactNode;
  as?: "div" | "span" | "section" | "li";
  className?: string;
  /** Show it even with Developer view off (e.g. the Developer add-on is on). */
  alsoWhen?: boolean;
}) {
  // Hidden unless <html data-dev="on">. `display: contents` keeps the parent's layout.
  return <Tag className={`${alsoWhen ? "contents" : "hidden dev:contents"} ${className}`}>{children}</Tag>;
}

/** The tag for things the Developer add-on unlocks, shown instead of the Developer view tag once it's on. */
export function AddOnTag({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-ink-2 normal-case tracking-normal ${className}`}>
      Developer add-on
    </span>
  );
}
