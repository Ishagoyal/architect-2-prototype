"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { advance, type Project } from "./model";
import { demoSeeds } from "./seeds";
import { getBrowserSupabase } from "./supabase/client";

/* Where projects live while you use the app.
   Demo: in this browser only (made-up data, reset by leaving the demo).
   Account: in this browser, and saved to Supabase so they're there on any device. */

type Ctx = {
  loaded: boolean;
  projects: Project[];
  /** Ticks every second so "2 min ago" and running builds stay current. */
  now: number;
  update: (id: string, fn: (p: Project) => Project) => void;
  add: (p: Project) => void;
  remove: (id: string) => void;
};

const ProjectsContext = createContext<Ctx | null>(null);

/** One browser copy per person: "demo", or the signed-in account's id. */
// "demo3": the demo now starts with nothing built (the tour builds the meal app), so older browser copies are left behind.
export const DEMO_STORAGE_KEY = "architect.projects.demo3";
const keyFor = (owner: string) => (owner === "demo" ? DEMO_STORAGE_KEY : `architect.projects.account.${owner}`);

function readLocal(owner: string): Project[] | null {
  try {
    const raw = localStorage.getItem(keyFor(owner));
    return raw ? (JSON.parse(raw) as Project[]) : null;
  } catch {
    return null;
  }
}

function writeLocal(owner: string, list: Project[]) {
  try {
    localStorage.setItem(keyFor(owner), JSON.stringify(list));
  } catch {
    /* storage full or blocked: this visit still works */
  }
}

export function ProjectsProvider({ kind, owner, children }: { kind: "demo" | "account"; owner: string; children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const dirty = useRef(new Set<string>());

  // Load
  useEffect(() => {
    let cancelled = false;
    const local = readLocal(owner);
    const start = local ?? (kind === "demo" ? demoSeeds() : []);
    setProjects(start.map((p) => advance(p)));
    setLoaded(true);

    const supabase = kind === "account" ? getBrowserSupabase() : null;
    if (supabase) {
      supabase
        .from("projects")
        .select("data")
        .then(({ data, error }: { data: { data: Project }[] | null; error: unknown }) => {
          if (cancelled) return;
          if (error || !data) {
            console.warn("Couldn't load projects from Supabase; using this browser's copy.", error);
            return;
          }
          setProjects((mine) => {
            const byId = new Map(mine.map((p) => [p.id, p]));
            for (const row of data) {
              const theirs = row.data;
              const ours = byId.get(theirs.id);
              if (!ours || theirs.updatedAt > ours.updatedAt) byId.set(theirs.id, advance(theirs));
            }
            return [...byId.values()];
          });
        });
    }
    return () => {
      cancelled = true;
    };
  }, [kind, owner]);

  // Save
  useEffect(() => {
    if (!loaded) return;
    writeLocal(owner, projects);
    const supabase = kind === "account" ? getBrowserSupabase() : null;
    if (!supabase || dirty.current.size === 0) return;
    const ids = [...dirty.current];
    const t = setTimeout(() => {
      dirty.current.clear();
      const rows = projects.filter((p) => ids.includes(p.id)).map((p) => ({ id: p.id, name: p.name, data: p, updated_at: new Date(p.updatedAt).toISOString() }));
      if (rows.length)
        supabase
          .from("projects")
          .upsert(rows)
          .then(({ error }: { error: unknown }) => error && console.warn("Couldn't save to Supabase; kept in this browser.", error));
    }, 800);
    return () => clearTimeout(t);
  }, [projects, loaded, kind, owner]);

  // Tick: keep time labels fresh and move running builds forward.
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setProjects((list) => {
        let changed = false;
        const next = list.map((p) => {
          if (p.build.status !== "running" && p.build.status !== "checking" && p.deploy?.status !== "deploying") return p;
          const q = advance(p, t);
          if (q !== p) {
            changed = true;
            dirty.current.add(p.id);
          }
          return q;
        });
        return changed ? next : list;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const update = useCallback((id: string, fn: (p: Project) => Project) => {
    dirty.current.add(id);
    setProjects((list) => list.map((p) => (p.id === id ? { ...fn(p), updatedAt: Date.now() } : p)));
  }, []);

  const add = useCallback(
    (p: Project) => {
      setProjects((list) => [p, ...list.filter((x) => x.id !== p.id)]);
      // Save straight away: the next page has its own provider, so nothing may be left pending here.
      writeLocal(owner, [p, ...(readLocal(owner) ?? []).filter((x) => x.id !== p.id)]);
      const supabase = kind === "account" ? getBrowserSupabase() : null;
      supabase
        ?.from("projects")
        .upsert({ id: p.id, name: p.name, data: p, updated_at: new Date(p.updatedAt).toISOString() })
        .then(({ error }: { error: unknown }) => error && console.warn("Couldn't save to Supabase; kept in this browser.", error));
    },
    [kind, owner],
  );

  const remove = useCallback(
    (id: string) => {
      setProjects((list) => list.filter((p) => p.id !== id));
      writeLocal(owner, (readLocal(owner) ?? []).filter((p) => p.id !== id));
      const supabase = kind === "account" ? getBrowserSupabase() : null;
      supabase?.from("projects").delete().eq("id", id).then(() => {});
    },
    [kind, owner],
  );

  const value = useMemo(() => ({ loaded, projects, now, update, add, remove }), [loaded, projects, now, update, add, remove]);
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
}

export function useProject(id: string) {
  const { projects, loaded, update, now } = useProjects();
  const project = projects.find((p) => p.id === id);
  const set = useCallback((fn: (p: Project) => Project) => update(id, fn), [id, update]);
  return { project, loaded, update: set, now };
}
