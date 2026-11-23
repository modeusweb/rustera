import { SignalIcon } from "@heroicons/react/24/outline";
import { Panel, Badge, Disclaimer } from "@/components/ui/primitives";

export function IntegrationStatus() {
  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
          <SignalIcon aria-hidden="true" className="h-5 w-5 text-accent" />
          Integration status
        </h2>
        <Badge tone="success">Direct connection</Badge>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Your browser talks directly to the official RuStore catalog over CORS, validates every response and never
        stores metadata. Download links are resolved on demand and never cached.
      </p>
      <Disclaimer className="mt-4" />
    </Panel>
  );
}
