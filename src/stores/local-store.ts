"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Minimal persistent client store built on useSyncExternalStore.
 * No external state library is needed for a handful of local collections.
 */
export function createLocalStore<T>(
  key: string,
  initial: T,
  isValid?: (value: unknown) => boolean,
) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function parse(raw: string | null): T {
    if (!raw) return initial;
    try {
      const parsed: unknown = JSON.parse(raw);
      return !isValid || isValid(parsed) ? (parsed as T) : initial;
    } catch {
      return initial;
    }
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== key) return;
    loaded = true;
    value = parse(event.newValue);
    listeners.forEach((listener) => listener());
  }

  function read(): T {
    if (typeof window === "undefined") return initial;
    if (!loaded) {
      loaded = true;
      try {
        value = parse(window.localStorage.getItem(key));
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
    if (listeners.size === 1 && typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, read, () => initial);
  }

  function useActions() {
    const update = useCallback((next: T | ((current: T) => T)) => set(next), []);
    return update;
  }

  return { useStore, useActions, set, get: read, subscribe };
}
