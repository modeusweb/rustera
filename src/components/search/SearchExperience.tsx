"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { SearchResultPage } from "@/types/domain";
import { appDetailHref } from "@/lib/utils/links";
import { enrichSearchPageClient, searchCatalogClient } from "@/lib/rustore/client-api";
import { toPublicError } from "@/lib/rustore/errors";
import { MESSAGES } from "@/lib/constants/messages";
import { addRecentSearch, clearRecentSearches, useRecentSearches } from "@/stores/collections";
import { AppCard, AppCardSkeleton } from "@/components/applications/AppCard";
import { Button, EmptyState, Spinner } from "@/components/ui/primitives";

export function SearchExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState("");
  const [data, setData] = useState<SearchResultPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);
  const recent = useRecentSearches();
  const requestRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The query the last finished/started search was for, and the query currently
  // reflected in the URL. URL-driven re-searches must differ from both, which
  // makes router.replace-induced reruns converge instead of looping.
  const lastSearchedRef = useRef<string | null>(null);
  const urlQueryRef = useRef<string>("");

  const cancelPending = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    lastSearchedRef.current = null;
    setLoading(false);
    setLoadingMore(false);
  }, []);

  const runSearch = useCallback(
    async (q: string, pageNumber: number, append: boolean) => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      lastSearchedRef.current = q;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await searchCatalogClient({
          query: q,
          page: pageNumber,
          pageSize: 12,
          signal: controller.signal,
        });
        const enriched = await enrichSearchPageClient(result, controller.signal);
        setData((current) =>
          append && current
            ? { ...enriched, items: [...current.items, ...enriched.items] }
            : enriched,
        );
        setActiveQuery(q);
        setPage(pageNumber);
        if (!append) {
          addRecentSearch(q);
          // Mirror the query into the URL only when it is not already there;
          // a redundant replace re-enters navigation for nothing.
          if (urlQueryRef.current !== q) {
            urlQueryRef.current = q;
            router.replace(`/search/?q=${encodeURIComponent(q)}`, { scroll: false });
          }
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(toPublicError(caught).message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    urlQueryRef.current = initialQuery;
    // Start through a macrotask so no state is set synchronously in the effect body.
    if (initialQuery) {
      if (lastSearchedRef.current !== initialQuery) {
        debounceRef.current = setTimeout(() => {
          setQuery(initialQuery);
          void runSearch(initialQuery, 0, false);
        }, 0);
      }
    } else {
      lastSearchedRef.current = null;
    }
    return () => {
      requestRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [initialQuery, runSearch]);

  function onChange(value: string) {
    setQuery(value);
    setSuggestionsOpen(Boolean(value));
    setActiveSuggestion(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      cancelPending();
      setData(null);
      setActiveQuery("");
      setError(null);
      setSuggestionsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(value.trim(), 0, false);
    }, 450);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) return;
    setSuggestionsOpen(false);
    setActiveSuggestion(null);
    void runSearch(trimmed, 0, false);
  }

  function clear() {
    cancelPending();
    urlQueryRef.current = "";
    setQuery("");
    setData(null);
    setActiveQuery("");
    setError(null);
    setSuggestionsOpen(false);
    setActiveSuggestion(null);
    router.replace("/search/", { scroll: false });
  }

  function selectSuggestion(value: string) {
    setQuery(value);
    setSuggestionsOpen(false);
    setActiveSuggestion(null);
    void runSearch(value, 0, false);
  }

  const matchingSuggestions = recent
    .filter(
      (item) =>
        item.toLowerCase().includes(query.toLowerCase()) &&
        item.toLowerCase() !== query.toLowerCase(),
    )
    .slice(0, 5);
  const suggestionsVisible = suggestionsOpen && matchingSuggestions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <form onSubmit={onSubmit} role="search" className="relative">
          <label htmlFor="hero-search" className="sr-only">
            {MESSAGES.search.label}
          </label>
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            id="hero-search"
            type="search"
            role="combobox"
            autoComplete="off"
            value={query}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setSuggestionsOpen(Boolean(query))}
            aria-expanded={suggestionsVisible}
            aria-controls={suggestionsVisible ? "search-suggestions" : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeSuggestion !== null ? `search-suggestion-${activeSuggestion}` : undefined
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                if (suggestionsVisible) {
                  setSuggestionsOpen(false);
                  setActiveSuggestion(null);
                } else if (query) {
                  clear();
                }
                return;
              }
              if (!suggestionsVisible) return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                setActiveSuggestion((current) =>
                  current === null
                    ? step === 1
                      ? 0
                      : matchingSuggestions.length - 1
                    : (current + step + matchingSuggestions.length) % matchingSuggestions.length,
                );
              } else if (event.key === "Enter" && activeSuggestion !== null) {
                event.preventDefault();
                selectSuggestion(matchingSuggestions[activeSuggestion]!);
              }
            }}
            placeholder={MESSAGES.search.placeholder}
            className="h-14 w-full rounded-xl border border-line-strong bg-surface pl-12 pr-24 text-base text-fg shadow-[var(--shadow)] placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {loading && <Spinner label="" />}
            {query && (
              <button
                type="button"
                onClick={clear}
                aria-label={MESSAGES.search.clear}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-fg"
              >
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              {MESSAGES.search.button}
            </button>
          </div>
        </form>

        {suggestionsVisible && (
          <div
            id="search-suggestions"
            role="listbox"
            aria-label={MESSAGES.search.suggestions}
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-raised shadow-[var(--shadow)]"
          >
            <p className="border-b border-line px-4 py-2 text-xs uppercase tracking-wide text-muted">
              {MESSAGES.search.suggestions}
            </p>
            {matchingSuggestions.map((item, index) => (
              <button
                key={item}
                id={`search-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={activeSuggestion === index}
                onClick={() => selectSuggestion(item)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-fg hover:bg-hover ${
                  activeSuggestion === index ? "bg-hover" : ""
                }`}
              >
                <ClockIcon aria-hidden="true" className="h-4 w-4 text-muted" />
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {!activeQuery && recent.length > 0 && (
        <section aria-labelledby="recent-searches">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-searches" className="text-sm font-semibold text-muted-strong">
              {MESSAGES.search.recent}
            </h2>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs text-muted hover:text-accent"
            >
              {MESSAGES.search.clearRecent}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectSuggestion(item)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-muted-strong hover:border-accent hover:text-fg"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      <div aria-live="polite" aria-busy={loading}>
        {error && (
          <EmptyState
            title={MESSAGES.search.errorTitle}
            body={error}
            icon="warning"
            action={
              <Button onClick={() => void runSearch(activeQuery || query.trim(), 0, false)}>
                {MESSAGES.errors.tryAgain}
              </Button>
            }
          />
        )}

        {!error && loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <AppCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !loading && data && (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-fg">
                {MESSAGES.search.resultsFor(data.query)}
              </h2>
              <p className="text-sm text-muted">
                {MESSAGES.search.resultCount(data.totalElements)}
              </p>
            </div>
            {data.items.length === 0 ? (
              <EmptyState title={MESSAGES.search.emptyTitle} body={MESSAGES.search.emptyBody} />
            ) : (
              <div className="flex flex-col gap-3">
                {data.items.map((app) => (
                  <AppCard key={`${app.packageName}-${app.appId}`} app={app} />
                ))}
              </div>
            )}
            {page + 1 < data.totalPages && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => void runSearch(activeQuery, page + 1, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? <Spinner label="" /> : null}
                  {MESSAGES.search.loadMore}
                </Button>
              </div>
            )}
          </>
        )}

        {!error && !loading && !data && !activeQuery && (
          <EmptyState title={MESSAGES.search.emptyTitle} body={MESSAGES.search.emptyBody} />
        )}
      </div>

      <p className="text-xs text-muted">
        <Link
          href={appDetailHref("org.telegram.messenger.web")}
          className="underline decoration-dotted hover:text-accent"
        >
          Try an example app
        </Link>
      </p>
    </div>
  );
}
