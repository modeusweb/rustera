import Link from "next/link";
import { MESSAGES } from "@/lib/constants/messages";
import { EmptyState } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <EmptyState
        title={MESSAGES.errors.notFoundTitle}
        body={MESSAGES.errors.notFoundBody}
        icon="warning"
        action={
          <Link href="/" className="inline-flex min-h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover">
            {MESSAGES.errors.backHome}
          </Link>
        }
      />
    </div>
  );
}
