"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MESSAGES } from "@/lib/constants/messages";
import { Button, EmptyState } from "@/components/ui/primitives";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("RUSTERA route error", error.digest ?? "unknown");
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <EmptyState
        title={MESSAGES.errors.genericTitle}
        body={MESSAGES.errors.genericBody}
        icon="warning"
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={reset}>{MESSAGES.errors.tryAgain}</Button>
            <Link href="/" className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm text-muted-strong hover:bg-hover">
              {MESSAGES.errors.backHome}
            </Link>
          </div>
        }
      />
    </div>
  );
}
