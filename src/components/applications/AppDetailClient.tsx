"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { AppDetails, SearchResultPage } from "@/types/domain";
import { getAppDetailsClient, searchCatalogClient } from "@/lib/rustore/client-api";
import { toPublicError } from "@/lib/rustore/errors";
import { AppCard, AppIcon } from "@/components/applications/AppCard";
import { DownloadPanel } from "@/components/applications/DownloadPanel";
import { FavoriteButton } from "@/components/applications/FavoriteButton";
import { CompareButton } from "@/components/applications/CompareButton";
import { Screenshots } from "@/components/applications/Screenshots";
import { CompatibilityPanel, TechnicalPanel } from "@/components/technical/TechnicalPanel";
import { Badge, EmptyState, Field, Panel, Spinner } from "@/components/ui/primitives";
import { MESSAGES } from "@/lib/constants/messages";
import { formatCompactCount, formatDate } from "@/lib/formatting/format";

export function AppDetailClient({ packageName }: { packageName: string }) {
  const [app, setApp] = useState<AppDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<SearchResultPage["items"]>([]);

  useEffect(() => {
    if (!packageName) return;
    const controller = new AbortController();

    void getAppDetailsClient(packageName, controller.signal)
      .then(async (details) => {
        if (controller.signal.aborted) return;
        setApp(details);
        try {
          const query = details.name.split(" ")[0] ?? details.name;
          const page = await searchCatalogClient({ query, pageSize: 7, signal: controller.signal });
          if (!controller.signal.aborted) {
            setRelated(
              page.items.filter((item) => item.packageName !== details.packageName).slice(0, 4),
            );
          }
        } catch {
          // Related apps are optional.
        }
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(toPublicError(caught).message);
      });

    return () => controller.abort();
  }, [packageName]);

  if (error) {
    return (
      <>
        <h1 className="sr-only">{MESSAGES.app.notFoundTitle}</h1>
        <EmptyState
          title={MESSAGES.app.notFoundTitle}
          body={error}
          icon="warning"
          action={
            <Link href="/search" className="text-sm text-accent hover:underline">
              Back to search
            </Link>
          }
        />
      </>
    );
  }

  if (!app) {
    return (
      <>
        <h1 className="sr-only">Loading application</h1>
        <Panel as="div" className="flex items-center justify-center py-20">
          <Spinner label="Loading application metadata…" />
        </Panel>
      </>
    );
  }

  const disabledReason = app.hasExternalSource
    ? MESSAGES.app.externalSource
    : (app.price ?? 0) > 0
      ? MESSAGES.app.paidApp
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/search/"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" /> Back to search
      </Link>

      <section className="panel flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <AppIcon src={app.iconUrl} alt={app.name} size={96} />
          <div className="min-w-0 flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                {app.name}
              </h1>
              {app.ageRating && <Badge>{app.ageRating}</Badge>}
              {app.hasExternalSource && <Badge tone="warning">External source</Badge>}
            </div>
            <p className="break-all font-mono text-xs text-muted">{app.packageName}</p>
            {app.developer && <p className="text-sm text-muted-strong">{app.developer}</p>}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {app.versionName && (
                <span>
                  {MESSAGES.app.version}: {app.versionName}
                </span>
              )}
              {app.fileSizeBytes && (
                <span>
                  {MESSAGES.app.size}: {(app.fileSizeBytes / 1048576).toFixed(1)} MB
                </span>
              )}
              {app.downloads !== null && (
                <span title="Rounded total reported by RuStore">
                  {MESSAGES.app.downloads}: {formatCompactCount(app.downloads)}
                </span>
              )}
              {app.rating !== null && <span>Rating: {app.rating.toFixed(1)}</span>}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <FavoriteButton app={app} />
              <CompareButton app={app} />
              <a
                href={app.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm text-muted-strong hover:bg-hover hover:text-fg"
              >
                View on RuStore ↗
              </a>
            </div>
          </div>
        </div>
        {app.shortDescription && (
          <p className="text-sm leading-relaxed text-muted-strong">{app.shortDescription}</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {app.fullDescription && (
            <Panel as="div">
              <h2 className="mb-3 text-base font-semibold text-fg">{MESSAGES.app.aboutApp}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-strong">
                {app.fullDescription}
              </p>
            </Panel>
          )}

          {app.whatsNew && (
            <Panel as="div">
              <h2 className="mb-3 text-base font-semibold text-fg">{MESSAGES.app.whatsNew}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-strong">
                {app.whatsNew}
              </p>
            </Panel>
          )}

          <Panel as="div">
            <h2 className="mb-4 text-base font-semibold text-fg">{MESSAGES.app.screenshots}</h2>
            <Screenshots items={app.screenshots} appName={app.name} />
          </Panel>

          <CompatibilityPanel app={app} />

          <Panel as="div">
            <h2 className="mb-2 text-base font-semibold text-fg">Release information</h2>
            <dl>
              <Field label={MESSAGES.app.developer} value={app.developer} />
              <Field label={MESSAGES.app.category} value={app.categories.join(", ") || null} />
              <Field label={MESSAGES.app.ageRating} value={app.ageRatingName ?? app.ageRating} />
              <Field label={MESSAGES.app.updated} value={formatDate(app.updatedAt)} />
              <Field label={MESSAGES.app.published} value={formatDate(app.firstPublishedAt)} />
              <Field label="External source" value={app.externalSourceName} />
            </dl>
          </Panel>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <Panel as="div">
            <DownloadPanel
              packageName={app.packageName}
              appName={app.name}
              versionName={app.versionName}
              versionCode={app.versionCode}
              disabled={disabledReason}
            />
          </Panel>
          <TechnicalPanel app={app} />
          <Panel as="div">
            <h2 className="mb-2 text-base font-semibold text-fg">{MESSAGES.app.source}</h2>
            <p className="text-xs leading-relaxed text-muted">
              Metadata and files are provided by RuStore. RUSTERA does not host or modify
              application binaries.
            </p>
          </Panel>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-apps">
          <h2 id="related-apps" className="mb-4 text-lg font-semibold text-fg">
            Related applications
          </h2>
          <div className="flex flex-col gap-3">
            {related.map((item) => (
              <AppCard key={item.packageName} app={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
