"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/* Two settings that belong to the person and are remembered on this device:
   the theme (light / dark / match my computer) and Developer view.
   They live on <html> as data-theme and data-dev, set before the first paint
   by the script below, so the page never flashes the wrong colours. */

export type ThemeChoice = "light" | "dark" | "system";

const THEME_KEY = "architect.theme";
const DEV_KEY = "architect.devView";

export const prefsScript = `(function(){try{
var t=localStorage.getItem("${THEME_KEY}")||"system";
var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.dataset.theme=d?"dark":"light";
document.documentElement.dataset.dev=localStorage.getItem("${DEV_KEY}")==="on"?"on":"off";
}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.dev="off";}})();`;

type Prefs = {
  theme: ThemeChoice;
  /** What is showing right now, after "match my computer" is worked out. */
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeChoice) => void;
  toggleTheme: () => void;
  devView: boolean;
  setDevView: (on: boolean) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private window or storage blocked: the setting just isn't remembered */
  }
}

function systemIsDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [resolvedTheme, setResolved] = useState<"light" | "dark">("light");
  const [devView, setDevState] = useState(false);

  // Pick up what the pre-paint script already applied.
  useEffect(() => {
    const t = read(THEME_KEY);
    setThemeState(t === "light" || t === "dark" ? t : "system");
    setResolved(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    setDevState(document.documentElement.dataset.dev === "on");
  }, []);

  // Follow the computer when the choice is "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const r = mq.matches ? "dark" : "light";
      document.documentElement.dataset.theme = r;
      setResolved(r);
    };
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: ThemeChoice) => {
    const r = t === "system" ? (systemIsDark() ? "dark" : "light") : t;
    document.documentElement.dataset.theme = r;
    write(THEME_KEY, t);
    setThemeState(t);
    setResolved(r);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  }, [setTheme]);

  const setDevView = useCallback((on: boolean) => {
    document.documentElement.dataset.dev = on ? "on" : "off";
    write(DEV_KEY, on ? "on" : "off");
    setDevState(on);
  }, []);

  return (
    <PrefsContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, devView, setDevView }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}
