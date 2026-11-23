import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About",
  description: "About RUSTERA, its approach to RuStore data and its limitations.",
  alternates: { canonical: "/about" },
};

const sections = [
  {
    title: "What RUSTERA is",
    body: "RUSTERA is an independent tool for discovering Android applications in the RuStore catalog, inspecting verified metadata and resolving original download links. It is designed for users who want more technical detail than a typical storefront provides.",
  },
  {
    title: "What RUSTERA is not",
    body: "It is not an official RuStore client, not a malware scanner, and not a source of applications. RUSTERA does not host, modify, repackage or sign APK files. It does not guarantee that any application is safe, legal or compatible with your device.",
  },
  {
    title: "How data is obtained",
    body: "Catalog and metadata requests are made server-side against the RuStore backend, validated with runtime schemas and normalized into internal models. When a field is absent upstream, RUSTERA shows 'Not available' rather than guessing a value.",
  },
  {
    title: "Downloads",
    body: "Download links are resolved on demand from RuStore, validated against an allow-list of official RuStore CDN hosts, and delivered to your browser as a redirect. No APK bytes pass through the application server. Signed URLs are never cached or stored in history.",
  },
  {
    title: "Privacy",
    body: "Favorites, recent searches, comparison selections and download history are stored locally in your browser using localStorage. No account is required and no personal data is transmitted by RUSTERA to its own servers beyond normal HTTP request metadata.",
  },
  {
    title: "Limitations",
    body: "The upstream API is undocumented and may change or become unavailable without notice. Search requires a query, sorting and category filters are not exposed by the verified endpoint, supported CPU architectures are not published, and many downloads are ZIP bundles of split APKs rather than single APK files. These limitations are described in detail in the integration notes.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">About RUSTERA</h1>
        <p className="mt-1 text-sm text-muted">Discover. Analyze. Download.</p>
      </div>
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <Panel key={section.title} as="div">
            <h2 className="mb-2 text-base font-semibold text-fg">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted">{section.body}</p>
          </Panel>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-accent">
        <Link href="/privacy" className="hover:underline">Privacy policy</Link>
        <Link href="/terms" className="hover:underline">Terms of use</Link>
      </div>
    </div>
  );
}
