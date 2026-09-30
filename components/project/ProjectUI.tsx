"use client";

import { createContext, useContext } from "react";

/* Small bits of screen state shared inside a project: the Needs you + chat sheet
   on narrow screens, and pointing at a Needs you card. */
export type ProjectUI = {
  openPanel: () => void;
  highlightNeeds: boolean;
  pointAtNeeds: () => void;
  /** Some tabs (Agents) need the room: the panel shrinks to a thin "Chat" strip. */
  collapsePanel: (on: boolean) => void;
};

export const ProjectUIContext = createContext<ProjectUI>({ openPanel: () => {}, highlightNeeds: false, pointAtNeeds: () => {}, collapsePanel: () => {} });

export function useProjectUI() {
  return useContext(ProjectUIContext);
}
