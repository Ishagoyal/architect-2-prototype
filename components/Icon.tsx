/* Line icons, drawn exactly as in the design file (24×24, round caps). */

const paths = {
  home: <><path d="M3 11 L12 4 L21 11" /><path d="M5 10 V20 H19 V10" /></>,
  folder: <path d="M3 7 H9 L11 9 H21 V19 H3 Z" />,
  agent: <><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4 V8" /><path d="M9.5 13 H9.6" /><path d="M14.5 13 H14.6" /></>,
  explore: <><circle cx="12" cy="12" r="9" /><path d="M15 9 L13 13 L9 15 L11 11 Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5 C9.5 8 10.6 7 12 7 C13.4 7 14.5 8 14.5 9.3 C14.5 11 12 11.2 12 13" /><path d="M12 16.5 H12.01" /></>,
  credits: <><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7 V17 C5 18.7 8.1 20 12 20 C15.9 20 19 18.7 19 17 V7" /><path d="M5 12 C5 13.7 8.1 15 12 15 C15.9 15 19 13.7 19 12" /></>,
  settings: <><path d="M4 7 H20" /><path d="M4 17 H20" /><circle cx="9" cy="7" r="2.2" fill="currentColor" /><circle cx="15" cy="17" r="2.2" fill="currentColor" /></>,
  moon: <path d="M20 14.5 A8 8 0 1 1 9.5 4 A6.5 6.5 0 0 0 20 14.5 Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5 V4.5" /><path d="M12 19.5 V21.5" /><path d="M2.5 12 H4.5" /><path d="M19.5 12 H21.5" /><path d="M5.3 5.3 L6.7 6.7" /><path d="M17.3 17.3 L18.7 18.7" /><path d="M5.3 18.7 L6.7 17.3" /><path d="M17.3 6.7 L18.7 5.3" /></>,
  chevronDown: <path d="M6 9 L12 15 L18 9" />,
  chevronRight: <path d="M9 6 L15 12 L9 18" />,
  back: <><path d="M19 12 H5" /><path d="M11 6 L5 12 L11 18" /></>,
  app: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9 H21" /></>,
  plan: <><path d="M9 6 H20" /><path d="M9 12 H20" /><path d="M9 18 H20" /><path d="M4.5 6 H5" /><path d="M4.5 12 H5" /><path d="M4.5 18 H5" /></>,
  tests: <><circle cx="12" cy="12" r="9" /><path d="M8 12 L11 15 L16 9" /></>,
  database: <><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7 V12 C5 13.7 8 15 12 15 C16 15 19 13.7 19 12 V7" /><path d="M5 12 V17 C5 18.7 8 20 12 20 C16 20 19 18.7 19 17 V12" /></>,
  code: <><path d="M9 8 L5 12 L9 16" /><path d="M15 8 L19 12 L15 16" /></>,
  eye: <><path d="M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z" /><circle cx="12" cy="12" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L15 14" /></>,
  check: <path d="M5 12 L10 17 L19 7" />,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.3 11 L15.7 7" /><path d="M8.3 13 L15.7 17" /></>,
  stop: <rect x="7" y="7" width="10" height="10" rx="1.5" />,
  plus: <><path d="M12 5 V19" /><path d="M5 12 H19" /></>,
  sparkle: <path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z" />,
  send: <><path d="M12 19 V5" /><path d="M6 11 L12 5 L18 11" /></>,
  flag: <><path d="M5 21 V4" /><path d="M5 4 H17 L15 8 L17 12 H5" /></>,
  close: <><path d="M6 6 L18 18" /><path d="M18 6 L6 18" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11 C5.5 14.6 8.4 17.5 12 17.5 C15.6 17.5 18.5 14.6 18.5 11" /><path d="M12 17.5 V21" /></>,
  chat: <path d="M4 5 H20 V16 H10 L6 19.5 V16 H4 Z" />,
  more: <><circle cx="5.5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="18.5" cy="12" r="1.3" fill="currentColor" /></>,
  desktop: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20 H15" /><path d="M12 16 V20" /></>,
  phone: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 17.5 H13" /></>,
  select: <path d="M5 3 L19 12 L12 13.5 L9 20 Z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20 C5 16 8.5 14.5 12 14.5 C15.5 14.5 19 16 20 20" /></>,
  map: <><path d="M9 4 L3 6 V20 L9 18 L15 20 L21 18 V4 L15 6 Z" /><path d="M9 4 V18" /><path d="M15 6 V20" /></>,
  people: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20 C3.3 16.5 5.9 15 9 15 C12.1 15 14.7 16.5 15.5 20" /><path d="M15.5 4.8 A3.5 3.5 0 0 1 15.5 11.2" /><path d="M18 15.3 C20 16 21.2 17.6 21.5 20" /></>,
  logo: <><path d="M4 20 L12 4 L20 20" /><path d="M8 13 H16" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 17,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
