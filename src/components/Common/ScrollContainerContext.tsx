"use client";
import { createContext, useContext, RefObject } from "react";

export const ScrollContainerContext = createContext<any | null>(null);

export function useScrollContainer(): RefObject<HTMLElement> | undefined {
  const ctx = useContext(ScrollContainerContext);
  return ctx ?? undefined;
}
