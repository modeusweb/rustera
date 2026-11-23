import type { Metadata } from "next";
import { Panel } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing the use of RUSTERA.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Terms of use</h1>
      <Panel as="div" className="flex flex-col gap-4 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-1 font-semibold text-fg">Independent service</h2>
          <p>RUSTERA is an independent project. It is not affiliated with, endorsed by or officially connected to RuStore or VK. Trademarks, application names, icons and descriptions belong to their respective owners.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Lawful use</h2>
          <p>You agree to use RUSTERA only for lawful purposes and in compliance with applicable laws and the terms of the source catalog. Do not use this service to bypass access controls, regional restrictions, subscriptions, authentication or technical protection measures.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Untrusted files</h2>
          <p>All downloadable files are untrusted external binaries. RUSTERA does not scan them for malware and makes no safety guarantee. You are responsible for verifying compatibility, legality and trustworthiness before installing any application.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Availability</h2>
          <p>The upstream catalog is an undocumented third-party service. RUSTERA may be unavailable or incomplete if that service changes, restricts access or becomes unreachable. Features are provided &ldquo;as is&rdquo; without warranty.</p>
        </section>
        <section>
          <h2 className="mb-1 font-semibold text-fg">Changes</h2>
          <p>These terms may be updated as the service evolves. Continued use after changes constitutes acceptance of the revised terms.</p>
        </section>
      </Panel>
    </div>
  );
}
