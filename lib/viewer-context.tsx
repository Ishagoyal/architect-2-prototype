"use client";

import { createContext, useContext } from "react";
import type { Viewer } from "./viewer";

const ViewerContext = createContext<Viewer | null>(null);

export function ViewerProvider({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const v = useContext(ViewerContext);
  if (!v) throw new Error("useViewer must be used inside ViewerProvider");
  return v;
}
