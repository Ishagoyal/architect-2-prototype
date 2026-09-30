"use client";

import { useCallback, useEffect, useState } from "react";

/* The Developer add-on, as a pretend switch (no payment) so reviewers can see what it unlocks:
   an exact model, a limit per project, and tokens per step. Kept in this browser. */

const KEY = "architect.addon";
const EVENT = "architect-addon";

function read() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function useAddOn() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const set = useCallback((next: boolean) => {
    try {
      if (next) localStorage.setItem(KEY, "on");
      else localStorage.removeItem(KEY);
    } catch {
      /* not remembered; this page still works */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { addOn: on, setAddOn: set };
}

/* The exact builder model (with the add-on). Shared, so the Builder button shows it. */
export const LET_AUTO_PICK = "Let Auto pick";
const MODEL_KEY = "architect.model";
const MODEL_EVENT = "architect-model";

function readModel() {
  try {
    return localStorage.getItem(MODEL_KEY) ?? LET_AUTO_PICK;
  } catch {
    return LET_AUTO_PICK;
  }
}

export function useExactModel() {
  const [model, setModelState] = useState(LET_AUTO_PICK);
  useEffect(() => {
    const sync = () => setModelState(readModel());
    sync();
    window.addEventListener(MODEL_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MODEL_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const setModel = useCallback((m: string) => {
    try {
      localStorage.setItem(MODEL_KEY, m);
    } catch {
      /* not remembered; this page still works */
    }
    window.dispatchEvent(new Event(MODEL_EVENT));
  }, []);
  return [model, setModel] as const;
}
