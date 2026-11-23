"use client";

import { useEffect } from "react";

/** Marks the document once React has hydrated; useful for deterministic E2E waits. */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
