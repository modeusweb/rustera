"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Minimal persistent client store built on useSyncExternalStore.
 * No external state library is needed for a handful of local collections.
 */
export function createLocalStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function read(): T {
    if (typeof window === "undefined") return initial;
    if (!loaded) {
      loaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) value = JSON.parse(raw) as T;
      } catch {
        value = initial;
      }
    }
    return value;
  }

  function set(next: T | ((current: T) => T)): void {
    const current = read();
    value = typeof next === "function" ? (next as (current: T) => T)(current) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or disabled; keep in-memory state working.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, read, () => initial);
  }

  function useActions() {
    const update = useCallback((next: T | ((current: T) => T)) => set(next), []);
    return update;
  }

  return { useStore, useActions, set, get: read };
}
