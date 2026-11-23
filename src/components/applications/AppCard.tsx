import Link from "next/link";
import { ArrowDownTrayIcon, StarIcon } from "@heroicons/react/24/outline";
import type { AppSummary } from "@/types/domain";
import { mapAndroidSdk } from "@/lib/android/sdk";
import { formatBytes, formatCount, truncate } from "@/lib/formatting/format";
import { MESSAGES } from "@/lib/constants/messages";
import { Badge } from "@/components/ui/primitives";
import { AppAvatar } from "@/components/ui/RemoteImage";
import { appDetailHref } from "@/lib/utils/links";

export function AppIcon({
  src,
  alt,
  size = 64,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  return <AppAvatar src={src} name={alt} size={size} />;
}

export function AppCard({ app }: { app: AppSummary }) {
  const android = mapAndroidSdk(app.minSdkVersion);
  const detailHref = appDetailHref(app.packageName);

  return (
    <article className="panel flex flex-col gap-4 p-4 transition-colors hover:border-line-strong sm:flex-row">
      <Link href={detailHref} className="shrink-0" aria-label={`${MESSAGES.app.openDetails}: ${app.name}`}>
        <AppIcon src={app.iconUrl} alt={app.name} size={72} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-fg">
              <Link href={detailHref} className="hover:text-accent">{app.name}</Link>
            </h3>
            <p className="truncate text-xs text-muted" title={app.packageName}>{app.packageName}</p>
          </div>
          {app.price !== null && app.price > 0 && <Badge tone="warning">Paid</Badge>}
        </div>

        {app.shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-strong">
            {truncate(app.shortDescription, 220)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {app.developer && <span>{app.developer}</span>}
          {app.versionName && <span>v{app.versionName}</span>}
          {app.fileSizeBytes !== null && <span>{formatBytes(app.fileSizeBytes)}</span>}
          {app.minSdkVersion !== null && <span>{android.label}</span>}
          {app.rating !== null && (
            <span className="inline-flex items-center gap-1">
              <StarIcon aria-hidden="true" className="h-3.5 w-3.5 text-warning" />
              {app.rating.toFixed(1)}
              {app.ratingVotes !== null && ` (${formatCount(app.ratingVotes)})`}
            </span>
          )}
          {app.downloadsText && (
            <span title="Approximate count reported by RuStore">≈ {app.downloadsText}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-end sm:flex-col sm:items-stretch sm:justify-center">
        <Link
          href={`${detailHref}#download`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
          {MESSAGES.app.download}
        </Link>
      </div>
    </article>
  );
}

export function AppCardSkeleton() {
  return (
    <div aria-hidden="true" className="panel flex gap-4 p-4">
      <div className="skeleton h-[72px] w-[72px] shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
      <div className="skeleton hidden h-10 w-32 rounded-lg sm:block" />
    </div>
  );
}
