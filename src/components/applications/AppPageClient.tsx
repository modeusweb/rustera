"use client";

import { useSearchParams } from "next/navigation";
import { AppDetailClient } from "./AppDetailClient";

export function AppPageClient() {
  const params = useSearchParams();
  return <AppDetailClient packageName={params.get("p")?.trim() ?? ""} />;
}
