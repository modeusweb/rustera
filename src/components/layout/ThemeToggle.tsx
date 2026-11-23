"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { MESSAGES } from "@/lib/constants/messages";

const listeners = new Set<() => void>();
const STORAGE_KEY = "rustera:theme";

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function resolveTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const node = document.documentElement;
  if (node.classList.contains("theme-light")) return "light";
  if (node.classList.contains("theme-dark")) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  // The stored preference is applied in an effect so no inline bootstrap script
  // is needed (and the CSP can stay strict). CSS media queries cover the flash
  // before hydration for first-time visitors.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage may be disabled.
    }
    const node = document.documentElement;
    node.classList.toggle("theme-light", stored === "light");
    node.classList.toggle("theme-dark", stored === "dark");
    listeners.forEach((listener) => listener());
  }, []);

  const theme = useSyncExternalStore(subscribe, resolveTheme, () => "dark" as const);

  function toggle() {
    const next = resolveTheme() === "dark" ? "light" : "dark";
    const node = document.documentElement;
    node.classList.toggle("theme-light", next === "light");
    node.classList.toggle("theme-dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors.
    }
    listeners.forEach((listener) => listener());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={MESSAGES.theme.toggle}
      title={`${MESSAGES.theme.toggle}: ${theme === "dark" ? MESSAGES.theme.light : MESSAGES.theme.dark}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-hover hover:text-fg"
    >
      {theme === "dark" ? (
        <SunIcon aria-hidden="true" className="h-5 w-5" />
      ) : (
        <MoonIcon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
