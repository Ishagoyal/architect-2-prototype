import { Icon } from "./Icon";

/** A locked row for something that comes with the paid Developer add-on (PRODUCT.md: "Free users see,
    paid users do"). Hover, tap or focus shows why it's locked, so it doesn't look broken. */
export function AddOnTip({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`group relative flex items-center justify-between gap-3 ${className}`}>
      <button type="button" aria-describedby="add-on-tip" className="flex items-center gap-2 text-left outline-none">
        <Icon name="lock" size={13} />
        {label}
      </button>
      <span className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">Developer add-on</span>
      <span
        id="add-on-tip"
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 bottom-full z-50 mb-2 w-64 rounded-lg bg-ink px-3 py-2 text-xs leading-snug text-bg opacity-0 shadow-pop transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        This comes with the Developer add-on. Developer view shows more; the add-on lets you change it.
      </span>
    </span>
  );
}
