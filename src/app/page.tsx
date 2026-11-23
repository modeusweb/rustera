import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { MESSAGES } from "@/lib/constants/messages";
import { Panel, Disclaimer } from "@/components/ui/primitives";
import { HomeSearch } from "@/components/search/HomeSearch";
import { IntegrationStatus } from "@/components/technical/IntegrationStatus";
import { appDetailHref } from "@/lib/utils/links";

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: "Catalog search",
    body: "Find applications by name through the live RuStore catalog with debounced queries and keyboard-friendly interactions.",
    href: "/search/",
  },
  {
    icon: ChartBarIcon,
    title: "Compatibility intelligence",
    body: "Inspect minimum and target SDK levels with a centralized, tested Android version mapping.",
    href: appDetailHref("org.telegram.messenger.web"),
  },
  {
    icon: ArrowDownTrayIcon,
    title: "Original file links",
    body: "Resolve signed RuStore download URLs and follow them directly to the source — no repackaging.",
    href: "/downloads/",
  },
  {
    icon: BookmarkIcon,
    title: "Local workspace",
    body: "Keep favorites, recent searches and download history in your own browser. No account required.",
    href: "/favorites/",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-14 sm:px-10 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{MESSAGES.brand.tagline}</p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl">
            Android application discovery, with the technical detail that matters.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            RUSTERA searches the RuStore catalog, surfaces verified metadata and Android compatibility information,
            and resolves original download links. Independent, precise, and built for professionals.
          </p>
          <div className="max-w-3xl">
            <HomeSearch />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/search/" className="text-sm font-medium text-accent hover:underline">Open full search →</Link>
            <Link href="/about/" className="text-sm font-medium text-muted hover:text-fg">How it works</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-title">
        <h2 id="features-title" className="mb-5 text-lg font-semibold text-fg">What you can do</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="panel group flex flex-col gap-3 p-5 transition-colors hover:border-line-strong">
              <feature.icon aria-hidden="true" className="h-6 w-6 text-accent" />
              <h3 className="text-sm font-semibold text-fg group-hover:text-accent">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <IntegrationStatus />
        <Panel>
          <h2 className="mb-3 text-lg font-semibold text-fg">Privacy by design</h2>
          <p className="mb-4 text-sm leading-relaxed text-muted">
            Favorites, recent searches and download history are stored only in this browser. Signed download URLs are
            never written to storage. Clearing browser data removes everything.
          </p>
          <Disclaimer />
        </Panel>
      </section>
    </div>
  );
}
