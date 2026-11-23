"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AppDetails } from "@/types/domain";
import { getAppDetailsClient } from "@/lib/rustore/client-api";
import { appDetailHref } from "@/lib/utils/links";
import { comparisonStore } from "@/stores/collections";
import { mapAndroidSdk } from "@/lib/android/sdk";
import { formatBytes, formatDate } from "@/lib/formatting/format";
import { MESSAGES } from "@/lib/constants/messages";
import { Button, EmptyState, Panel, Spinner } from "@/components/ui/primitives";
import { AppIcon } from "@/components/applications/AppCard";

interface Column {
  label: string;
  value: (app: AppDetails) => string;
}

const columns: Column[] = [
  { label: "Package identifier", value: (app) => app.packageName },
  { label: "Version", value: (app) => app.versionName ?? "Not available" },
  { label: "Version code", value: (app) => app.versionCode?.toString() ?? "Not available" },
  { label: "Minimum SDK", value: (app) => mapAndroidSdk(app.minSdkVersion).label },
  { label: "Target SDK", value: (app) => mapAndroidSdk(app.targetSdkVersion).label },
  { label: "File size", value: (app) => formatBytes(app.fileSizeBytes) },
  { label: "Last update", value: (app) => formatDate(app.updatedAt) },
  { label: "Developer", value: (app) => app.developer ?? "Not available" },
  { label: "Age rating", value: (app) => app.ageRating ?? "Not available" },
];

export function CompareView() {
  const comparison = comparisonStore.useStore();
  const setComparison = comparisonStore.useActions();
  const [data, setData] = useState<Record<string, AppDetails | null>>({});

  useEffect(() => {
    let cancelled = false;
    const missing = comparison.filter((app) => data[app.packageName] === undefined);
    if (missing.length === 0) return;

    void Promise.all(
      missing.map(async (app) => {
        try {
          const value = await getAppDetailsClient(app.packageName);
          return { packageName: app.packageName, value };
        } catch {
          return { packageName: app.packageName, value: null };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setData((current) => {
        const next = { ...current };
        for (const result of results) next[result.packageName] = result.value;
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [comparison, data]);

  const loading = comparison.some((app) => data[app.packageName] === undefined);
  const details = comparison
    .map((app) => data[app.packageName])
    .filter((item): item is AppDetails => Boolean(item));

  if (comparison.length === 0) {
    return <EmptyState title="Nothing to compare" body={MESSAGES.compare.empty} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {comparison.map((app) => (
          <Button
            key={app.packageName}
            variant="ghost"
            onClick={() => setComparison((current) => current.filter((item) => item.packageName !== app.packageName))}
          >
            {app.name} <span aria-hidden="true">×</span>
          </Button>
        ))}
        <Button variant="danger" onClick={() => setComparison([])}>Clear all</Button>
      </div>

      {loading ? <Spinner label="Loading technical metadata…" /> : null}

      {!loading && details.length === 0 ? (
        <EmptyState title="Details unavailable" body="None of the selected applications could be loaded. Try again later." icon="warning" />
      ) : null}

      {!loading && details.length > 0 && (
        <Panel as="div" className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-48 border-b border-line px-4 py-4 text-left text-xs uppercase tracking-wide text-muted">
                  Property
                </th>
                {details.map((app) => (
                  <th key={app.packageName} className="border-b border-l border-line px-4 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <AppIcon src={app.iconUrl} alt={app.name} size={40} />
                      <div className="min-w-0">
                        <Link href={appDetailHref(app.packageName)} className="block truncate font-semibold text-fg hover:text-accent">
                          {app.name}
                        </Link>
                        <span className="block truncate font-mono text-xs text-muted">{app.packageName}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((column) => {
                const values = details.map(column.value);
                const differs = new Set(values).size > 1;
                return (
                  <tr key={column.label} className={differs ? "bg-accent/[0.04]" : undefined}>
                    <th scope="row" className="border-b border-line px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      {column.label}
                    </th>
                    {values.map((value, index) => (
                      <td
                        key={`${column.label}-${details[index]?.packageName ?? index}`}
                        className={`border-b border-l border-line px-4 py-3 text-fg ${differs ? "font-medium" : ""}`}
                      >
                        <span className="break-words">{value}</span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
      <p className="text-xs text-muted">Rows highlighted in violet differ between the selected applications. Unavailable values are never inferred.</p>
    </div>
  );
}
