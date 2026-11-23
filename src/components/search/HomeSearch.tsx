"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { MESSAGES } from "@/lib/constants/messages";
import { isValidPackageName, PACKAGE_NAME_PATTERN } from "@/lib/validation/input";
import { appDetailHref } from "@/lib/utils/links";

export function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (/^[a-z0-9_.-]+$/i.test(trimmed) && PACKAGE_NAME_PATTERN.test(trimmed)) {
      if (isValidPackageName(trimmed)) {
        router.push(appDetailHref(trimmed));
        return;
      }
    }

    router.push(`/search/?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="w-full">
      <label htmlFor="home-search" className="sr-only">{MESSAGES.search.label}</label>
      <div className="relative">
        <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          id="home-search"
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && value) {
              setValue("");
              setError(null);
            }
          }}
          placeholder={MESSAGES.search.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "home-search-error" : undefined}
          className={`h-14 w-full rounded-xl border border-line-strong bg-bg/70 pl-12 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none ${value ? "pr-14" : "pr-4"}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setError(null);
            }}
            aria-label={MESSAGES.search.clear}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-fg"
          >
            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && (
        <p id="home-search-error" role="alert" className="mt-2 text-sm text-error">{error}</p>
      )}
      <p className="mt-2 text-xs text-muted">
        Enter an application name or an Android package identifier for direct lookup.
      </p>
    </form>
  );
}
