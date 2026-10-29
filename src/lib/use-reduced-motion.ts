"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia?.(query);
  media?.addEventListener("change", callback);
  return () => media?.removeEventListener("change", callback);
};
const getSnapshot = () => window.matchMedia?.(query).matches ?? false;
const getServerSnapshot = () => false;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
