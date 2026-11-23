import type { AppDetails } from "@/types/domain";
import { Field, Panel } from "@/components/ui/primitives";
import { formatBytes, formatCount, formatDate } from "@/lib/formatting/format";
import { mapAndroidSdk } from "@/lib/android/sdk";

export function TechnicalPanel({ app }: { app: AppDetails }) {
  const minSdk = mapAndroidSdk(app.minSdkVersion);
  const targetSdk = mapAndroidSdk(app.targetSdkVersion);

  return (
    <Panel className="flex flex-col gap-1" as="div">
      <h2 className="mb-2 text-base font-semibold text-fg">Technical information</h2>
      <dl>
        <Field label="Package identifier" value={<span className="font-mono text-xs">{app.packageName}</span>} />
        <Field label="Application ID" value={app.appId ? formatCount(app.appId) : null} />
        <Field label="Version" value={app.versionName ? `${app.versionName} (code ${app.versionCode ?? "unknown"})` : null} />
        <Field label="Version ID" value={app.versionId ? formatCount(app.versionId) : null} />
        <Field label="Minimum SDK" value={app.minSdkVersion !== null ? `API ${app.minSdkVersion} — ${minSdk.versionName ?? "unmapped"}` : null} />
        <Field label="Target SDK" value={app.targetSdkVersion !== null ? `API ${app.targetSdkVersion} — ${targetSdk.versionName ?? "unmapped"}` : null} />
        <Field label="Maximum SDK" value={app.maxSdkVersion && app.maxSdkVersion > 0 ? `API ${app.maxSdkVersion}` : null} />
        <Field label="File size" value={formatBytes(app.fileSizeBytes)} />
        <Field label="Device types" value={app.deviceTypes.length ? app.deviceTypes.join(", ") : null} />
        <Field label="Signing certificate" value={app.signatures[0] ? <span className="break-all font-mono text-xs">{app.signatures[0]}</span> : null} />
        <Field label="Last update" value={formatDate(app.updatedAt)} />
        <Field label="Source domain" value="backapi.rustore.ru (catalog) / static-m.rustore.ru (files)" />
      </dl>
    </Panel>
  );
}

export function CompatibilityPanel({ app }: { app: AppDetails }) {
  const minSdk = mapAndroidSdk(app.minSdkVersion);
  const targetSdk = mapAndroidSdk(app.targetSdkVersion);

  return (
    <Panel className="flex flex-col gap-4" as="div">
      <div>
        <h2 className="text-base font-semibold text-fg">Android compatibility</h2>
        <p className="mt-1 text-sm text-muted">
          Derived from metadata supplied by RuStore. Device compatibility cannot be guaranteed.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel-raised p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Minimum supported Android</p>
          <p className="mt-1 text-lg font-semibold text-fg">{minSdk.known ? minSdk.label : "Not available"}</p>
          {app.minAndroidVersion && (
            <p className="mt-1 text-xs text-muted">Upstream value: Android {app.minAndroidVersion}</p>
          )}
        </div>
        <div className="panel-raised p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Target Android</p>
          <p className="mt-1 text-lg font-semibold text-fg">{targetSdk.known ? targetSdk.label : "Not available"}</p>
          <p className="mt-1 text-xs text-muted">The version the app was built and tested against.</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Supported CPU architectures are not published by this upstream API. Check the listing in RuStore or install
        through the store client for device-specific compatibility information.
      </p>
    </Panel>
  );
}
