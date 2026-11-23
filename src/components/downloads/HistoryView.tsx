"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { HistoryEntry } from "@/stores/collections";
import { historyStore } from "@/stores/collections";
import { MESSAGES } from "@/lib/constants/messages";
import { formatDate } from "@/lib/formatting/format";
import { appDetailHref } from "@/lib/utils/links";
import { Badge, Button, EmptyState, Panel } from "@/components/ui/primitives";

export function HistoryView() {
  const history = historyStore.useStore();
  const setHistory = historyStore.useActions();
  const [filter, setFilter] = useState("");

  const filtered = history.filter((item) =>
    `${item.appName} ${item.packageName} ${item.fileName}`.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full max-w-sm">
          <span className="sr-only">Search history</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter history…"
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted"
          />
        </label>
        {history.length > 0 && (
          <Button variant="danger" onClick={() => setHistory([])}>
            <TrashIcon aria-hidden="true" className="h-4 w-4" />
            {MESSAGES.download.clearHistory}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={MESSAGES.download.historyEmpty} body={MESSAGES.download.historyBody} />
      ) : (
        <Panel as="div" className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Source host</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => <HistoryRow key={entry.id} entry={entry} onRemove={() => setHistory((current) => current.filter((item) => item.id !== entry.id))} />)}
            </tbody>
          </table>
        </Panel>
      )}

      <p className="text-xs text-muted">
        History is stored in this browser only. Signed URLs are never saved. You can clear it at any time.
      </p>
    </div>
  );
}

function HistoryRow({ entry, onRemove }: { entry: HistoryEntry; onRemove: () => void }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <Link href={appDetailHref(entry.packageName)} className="font-medium text-fg hover:text-accent">
          {entry.appName}
        </Link>
        <p className="max-w-[220px] truncate font-mono text-xs text-muted" title={entry.packageName}>{entry.packageName}</p>
      </td>
      <td className="px-4 py-3 text-muted">{entry.versionName ?? entry.versionCode ?? "—"}</td>
      <td className="px-4 py-3 text-muted"><span className="block max-w-[200px] truncate" title={entry.fileName}>{entry.fileName}</span></td>
      <td className="px-4 py-3 text-muted">{entry.sourceHost}</td>
      <td className="px-4 py-3 text-muted">{formatDate(entry.timestamp)}</td>
      <td className="px-4 py-3">
        <Badge tone={entry.status === "resolved" ? "success" : "error"}>
          {entry.status === "resolved" ? "Resolved" : "Failed"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link
            href={appDetailHref(entry.packageName, "download")}
            aria-label={`${MESSAGES.download.reopen}: ${entry.appName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-fg"
          >
            <ArrowTopRightOnSquareIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${MESSAGES.download.remove}: ${entry.appName}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-error"
          >
            <TrashIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
