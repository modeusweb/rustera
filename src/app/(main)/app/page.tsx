import type { Metadata } from "next";
import { Suspense } from "react";
import { AppPageClient } from "@/components/applications/AppPageClient";
import { Spinner } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Application details",
  description: "Inspect verified RuStore application metadata and Android compatibility information.",
  robots: { index: false, follow: true },
};

export default function AppPage() {
  return (
    <Suspense fallback={<Spinner label="Loading application…" />}>
      <AppPageClient />
    </Suspense>
  );
}
