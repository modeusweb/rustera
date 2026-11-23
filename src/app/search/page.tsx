import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/components/search/SearchExperience";
import { Spinner } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Search applications",
  description: "Search the RuStore catalog for Android applications and inspect verified metadata.",
  alternates: { canonical: "/search/" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner label="Loading search…" />}>
      <SearchExperience />
    </Suspense>
  );
}
