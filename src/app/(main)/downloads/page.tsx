import type { Metadata } from "next";
import { HistoryView } from "@/components/downloads/HistoryView";

export const metadata: Metadata = {
  title: "Download history",
  description: "Review locally stored download metadata from RUSTERA.",
  robots: { index: false, follow: false },
};

export default function DownloadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Download history</h1>
        <p className="mt-1 text-sm text-muted">
          Metadata about links resolved in this browser. Signed URLs are intentionally not retained.
        </p>
      </div>
      <HistoryView />
    </div>
  );
}
