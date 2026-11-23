import type { Metadata } from "next";
import { Panel } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How RUSTERA handles local data and upstream requests.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Privacy policy</h1>
      <Panel as="div" className="flex flex-col gap-4 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-1 font-semibold text-fg">Local data</h2>
          <p>Favorites, recent searches, comparison selections and download history are stored in your browser&apos;s localStorage. They never leave your device and can be removed at any time from the relevant page or through browser settings.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Signed URLs</h2>
          <p>Download URLs returned by RuStore are short-lived and potentially sensitive. RUSTERA does not persist them in local storage, server storage, logs or history. Only non-sensitive metadata such as the app name, filename and source hostname is recorded.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Upstream requests</h2>
          <p>When you search, open an application or request a download, RUSTERA sends requests to RuStore&apos;s backend from its own server. Standard HTTP metadata (such as IP address) may be processed by the hosting provider and the upstream service.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Logging</h2>
          <p>Structured server logs record request correlation IDs, endpoint paths and error categories. Full signed URLs, credentials and authorization headers are deliberately excluded.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">No tracking</h2>
          <p>RUSTERA does not use advertising trackers, analytics cookies or third-party scripts for behavioral profiling.</p>
        </section>
      </Panel>
    </div>
  );
}
