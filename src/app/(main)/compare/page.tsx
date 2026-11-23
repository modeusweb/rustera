import type { Metadata } from "next";
import { CompareView } from "@/components/technical/CompareView";

export const metadata: Metadata = {
  title: "Compare applications",
  description: "Compare verified Android application metadata side by side.",
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Compare applications</h1>
        <p className="mt-1 text-sm text-muted">
          {`Add up to three applications from their detail pages to compare verified metadata side by side.`}
        </p>
      </div>
      <CompareView />
    </div>
  );
}
