"use client";

import { useState } from "react";
import { favoritesStore } from "@/stores/collections";
import { AppCard } from "@/components/applications/AppCard";
import { EmptyState } from "@/components/ui/primitives";
import { MESSAGES } from "@/lib/constants/messages";

export function FavoritesView() {
  const favorites = favoritesStore.useStore();
  const [filter, setFilter] = useState("");
  const filtered = favorites.filter((app) =>
    `${app.name} ${app.packageName}`.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter favorites…"
        aria-label="Filter favorites"
        className="h-10 w-full max-w-sm rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted"
      />
      {filtered.length === 0 ? (
        <EmptyState title={MESSAGES.favorites.empty} body={MESSAGES.favorites.emptyBody} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => <AppCard key={app.packageName} app={app} />)}
        </div>
      )}
    </div>
  );
}
