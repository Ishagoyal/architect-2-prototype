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
}: {
  children: React.ReactNode;
  as?: "div" | "span" | "section" | "li";
  className?: string;
}) {
  // Hidden unless <html data-dev="on">. `display: contents` keeps the parent's layout.
  return <Tag className={`hidden dev:contents ${className}`}>{children}</Tag>;
}
