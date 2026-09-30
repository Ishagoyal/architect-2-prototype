"use client";

import { useCallback, useEffect, useState } from "react";

/* Workspaces, invites and the current workspace, kept in this browser (prototype).
   "main" is the workspace everyone starts with; its projects are the ones saved to Supabase.
   Workspaces you create keep their projects in this browser only. */

export type Invite = { email: string; role: "Member" | "Admin" };
export type MadeWorkspace = { id: string; name: string };
type State = { current: string; made: MadeWorkspace[]; names: Record<string, string>; invites: Record<string, Invite[]> };

const EVENT = "architect-workspaces";
const empty: State = { current: "main", made: [], names: {}, invites: {} };
const keyFor = (owner: string) => `architect.workspaces.${owner}`;

function read(owner: string): State {
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(keyFor(owner)) ?? "{}") };
  } catch {
    return empty;
  }
}

function write(owner: string, s: State) {
  try {
    localStorage.setItem(keyFor(owner), JSON.stringify(s));
  } catch {
    /* not remembered; this page still works */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Where a workspace's projects are kept: the person's own key for "main", a separate one otherwise. */
export function projectsOwner(owner: string, workspace: string) {
  return workspace === "main" ? owner : `${owner}.ws.${workspace}`;
}

/** The current workspace id, without the rest (for the projects store). */
export function useCurrentWorkspace(owner: string) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setCurrent(owner === "scene" ? "main" : read(owner).current);
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [owner]);
  return current;
}

export function useWorkspaces(owner: string) {
  const [state, setState] = useState<State>(empty);
  useEffect(() => {
    const sync = () => setState(read(owner));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [owner]);

  const change = useCallback((fn: (s: State) => State) => write(owner, fn(read(owner))), [owner]);
  const switchTo = useCallback((id: string) => change((s) => ({ ...s, current: id })), [change]);
  const create = useCallback(
    (name: string) => {
      const id = Math.random().toString(36).slice(2, 8);
      change((s) => ({ ...s, made: [...s.made, { id, name }], current: id }));
      return id;
    },
    [change],
  );
  const rename = useCallback((id: string, name: string) => change((s) => ({ ...s, names: { ...s.names, [id]: name } })), [change]);
  const invite = useCallback(
    (id: string, inv: Invite) =>
      change((s) => ({ ...s, invites: { ...s.invites, [id]: [...(s.invites[id] ?? []).filter((x) => x.email !== inv.email), inv] } })),
    [change],
  );
  const uninvite = useCallback(
    (id: string, email: string) => change((s) => ({ ...s, invites: { ...s.invites, [id]: (s.invites[id] ?? []).filter((x) => x.email !== email) } })),
    [change],
  );
  return { ...state, switchTo, create, rename, invite, uninvite };
}

/** Starting or leaving the demo forgets its workspaces too. */
export function forgetWorkspaces(owner: string) {
  try {
    localStorage.removeItem(keyFor(owner));
  } catch {
    /* nothing to clear */
  }
}
