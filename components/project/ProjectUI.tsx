"use client";

import { createContext, useContext } from "react";

/* Small bits of screen state shared inside a project: the Needs you + chat sheet
   on narrow screens, and pointing at a Needs you card. */
export type ProjectUI = {
  openPanel: () => void;
  highlightNeeds: boolean;
  pointAtNeeds: () => void;
};

export const ProjectUIContext = createContext<ProjectUI>({ openPanel: () => {}, highlightNeeds: false, pointAtNeeds: () => {} });

export function useProjectUI() {
  return useContext(ProjectUIContext);
}
