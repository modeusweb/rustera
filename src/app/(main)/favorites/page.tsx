import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Applications bookmarked in your browser.",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Favorites</h1>
        <p className="mt-1 text-sm text-muted">Bookmarks are stored locally in this browser.</p>
      </div>
      <FavoritesView />
    </div>
  );
}
