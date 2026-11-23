"use client";

import { createLocalStore } from "./local-store";
import type { AppSummary } from "@/types/domain";

export interface HistoryEntry {
  id: string;
  packageName: string;
  appName: string;
  versionName: string | null;
  versionCode: number | null;
  fileName: string;
  sourceHost: string;
  status: "resolved" | "failed";
  timestamp: string;
}

const MAX_HISTORY = 50;
const MAX_RECENT = 8;

export const favoritesStore = createLocalStore<AppSummary[]>("rustera:favorites:v1", []);
export const historyStore = createLocalStore<HistoryEntry[]>("rustera:history:v1", []);
export const recentSearchesStore = createLocalStore<string[]>("rustera:recent-searches:v1", []);
export const comparisonStore = createLocalStore<AppSummary[]>("rustera:comparison:v1", []);

export function useRecentSearches() {
  return recentSearchesStore.useStore();
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  recentSearchesStore.set((current) => [trimmed, ...current.filter((q) => q !== trimmed)].slice(0, MAX_RECENT));
}

export function clearRecentSearches(): void {
  recentSearchesStore.set([]);
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  historyStore.set((current) =>
    [
      { ...entry, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, timestamp: new Date().toISOString() },
      ...current,
    ].slice(0, MAX_HISTORY),
  );
}
