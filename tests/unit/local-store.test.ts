import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalStore } from "@/stores/local-store";

describe("createLocalStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ignores corrupted localStorage values", () => {
    const storage = new Map<string, string>([["items", JSON.stringify({ not: "an array" })]]);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const store = createLocalStore<string[]>("items", [], Array.isArray);
    expect(store.get()).toEqual([]);
    store.set(["next"]);
    expect(store.get()).toEqual(["next"]);
  });

  it("refreshes from another tab's storage event", () => {
    const storage = new Map<string, string>();
    const listeners = new Map<string, EventListener>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
      removeEventListener: (type: string) => listeners.delete(type),
    });

    const store = createLocalStore<string[]>("items", [], Array.isArray);
    const unsubscribe = store.subscribe(vi.fn());
    listeners.get("storage")?.({
      key: "items",
      newValue: JSON.stringify(["from other tab"]),
    } as StorageEvent);
    expect(store.get()).toEqual(["from other tab"]);
    unsubscribe();
    expect(listeners.has("storage")).toBe(false);
  });
});
