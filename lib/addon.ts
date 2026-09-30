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
