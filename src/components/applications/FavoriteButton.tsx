"use client";

import { BookmarkIcon, BookmarkSlashIcon } from "@heroicons/react/24/outline";
import type { AppSummary } from "@/types/domain";
import { favoritesStore } from "@/stores/collections";
import { MESSAGES } from "@/lib/constants/messages";
import { Button } from "@/components/ui/primitives";

export function FavoriteButton({ app }: { app: AppSummary }) {
  const favorites = favoritesStore.useStore();
  const setFavorites = favoritesStore.useActions();
  const saved = favorites.some((item) => item.packageName === app.packageName);

  function toggle() {
    setFavorites((current) =>
      saved
        ? current.filter((item) => item.packageName !== app.packageName)
        : [app, ...current.filter((item) => item.packageName !== app.packageName)],
    );
  }

  return (
    <Button variant={saved ? "secondary" : "primary"} onClick={toggle} aria-pressed={saved}>
      {saved ? (
        <BookmarkSlashIcon aria-hidden="true" className="h-4 w-4" />
      ) : (
        <BookmarkIcon aria-hidden="true" className="h-4 w-4" />
      )}
      {saved ? MESSAGES.favorites.remove : MESSAGES.favorites.add}
    </Button>
  );
}
