"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { DownloadResolution } from "@/types/domain";
import { resolveDownloadClient, validatedDownloadUrl } from "@/lib/rustore/client-api";
import { toPublicError } from "@/lib/rustore/errors";
import { MESSAGES } from "@/lib/constants/messages";
import { formatBytes } from "@/lib/formatting/format";
import { addHistoryEntry } from "@/stores/collections";
import { Button, Spinner, StatusMessage } from "@/components/ui/primitives";

interface Props {
  packageName: string;
  appName: string;
  versionName: string | null;
  versionCode: number | null;
  disabled?: string | null;
}

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; data: DownloadResolution; href: string }
  | { phase: "error"; message: string };

export function DownloadPanel({ packageName, appName, versionName, versionCode, disabled }: Props) {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function resolve() {
    setState({ phase: "loading" });
    try {
      const data = await resolveDownloadClient(packageName);
      if (!data.urls.length) throw new Error(MESSAGES.errors.noDownload);
      const href = validatedDownloadUrl(data);
      setState({ phase: "ready", data, href });
      const primary = data.urls[0];
      if (primary) {
        addHistoryEntry({
          packageName,
          appName,
          versionName,
          versionCode: versionCode ?? data.versionCode,
          fileName: primary.fileName,
          sourceHost: new URL(primary.url).hostname,
          status: "resolved",
        });
      }
    } catch (error) {
      setState({ phase: "error", message: toPublicError(error).message });
      addHistoryEntry({
        packageName,
        appName,
        versionName,
        versionCode,
        fileName: "-",
        sourceHost: "-",
        status: "failed",
      });
    }
  }

  if (disabled) {
    return <StatusMessage tone="warning">{disabled}</StatusMessage>;
  }

  return (
    <section id="download" aria-labelledby="download-heading" className="flex flex-col gap-4">
      <h2 id="download-heading" className="text-base font-semibold text-fg">{MESSAGES.download.title}</h2>

      {state.phase === "idle" && (
        <>
          <Button variant="primary" onClick={() => void resolve()} className="w-full sm:w-auto">
            <ArrowDownTrayIcon aria-hidden="true" className="h-5 w-5" />
            {MESSAGES.app.download}
          </Button>
          <p className="text-xs leading-relaxed text-muted">
            A fresh, signed URL is resolved each time. RUSTERA redirects you to the original RuStore file; it does not
            proxy or modify APK bytes.
          </p>
        </>
      )}

      {state.phase === "loading" && (
        <div className="panel flex items-center gap-3 p-4">
          <Spinner label={MESSAGES.download.resolving} />
        </div>
      )}

      {state.phase === "error" && (
        <div className="flex flex-col gap-3">
          <StatusMessage tone="error">{state.message}</StatusMessage>
          <Button onClick={() => void resolve()}><ArrowPathIcon aria-hidden="true" className="h-4 w-4" />{MESSAGES.download.retry}</Button>
        </div>
      )}

      {state.phase === "ready" && (
        <div className="flex flex-col gap-4">
          <StatusMessage tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircleIcon aria-hidden="true" className="h-4 w-4" />
              {MESSAGES.download.ready}
            </span>
          </StatusMessage>

          <ul className="flex flex-col gap-3">
            {state.data.urls.map((item) => (
              <li key={item.url} className="panel-raised flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1 text-sm">
                  <span className="truncate font-medium text-fg" title={item.fileName}>{item.fileName}</span>
                  <span className="text-xs text-muted">
                    {formatBytes(item.sizeBytes)} · {item.contentType} · {new URL(item.url).hostname}
                  </span>
                  {item.upstreamDigest && (
                    <span className="text-xs text-muted">{MESSAGES.download.digest}: {item.upstreamDigest}</span>
                  )}
                </div>
                <a
                  href={state.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                >
                  <ArrowTopRightOnSquareIcon aria-hidden="true" className="h-4 w-4" />
                  {MESSAGES.download.openFile}
                </a>
              </li>
            ))}
          </ul>

          <StatusMessage tone="warning">
            <ExclamationTriangleIcon aria-hidden="true" className="mr-1 inline h-4 w-4" />
            {MESSAGES.download.splitNotice}
          </StatusMessage>

          <div className="flex flex-wrap gap-4 text-xs text-muted">
            <Button variant="ghost" onClick={() => void resolve()}>
              <ArrowPathIcon aria-hidden="true" className="h-4 w-4" />
              {MESSAGES.download.retry}
            </Button>
            <Link href="/downloads" className="inline-flex items-center text-accent hover:underline">
              {MESSAGES.download.history}
            </Link>
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted">{MESSAGES.download.warning}</p>
    </section>
  );
}
