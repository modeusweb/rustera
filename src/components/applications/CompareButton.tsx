"use client";

import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import type { AppSummary } from "@/types/domain";
import { comparisonStore } from "@/stores/collections";
import { MESSAGES } from "@/lib/constants/messages";
import { Button } from "@/components/ui/primitives";

export function CompareButton({ app }: { app: AppSummary }) {
  const comparison = comparisonStore.useStore();
  const setComparison = comparisonStore.useActions();
  const added = comparison.some((item) => item.packageName === app.packageName);

  function toggle() {
    setComparison((current) => {
      if (added) return current.filter((item) => item.packageName !== app.packageName);
      const withoutSelf = current.filter((item) => item.packageName !== app.packageName);
      return withoutSelf.length >= 3 ? current : [...withoutSelf, app];
    });
  }

  return (
    <Button variant="ghost" onClick={toggle} aria-pressed={added} title={comparison.length >= 3 && !added ? MESSAGES.compare.full : undefined}>
      <SquaresPlusIcon aria-hidden="true" className="h-4 w-4" />
      {added ? MESSAGES.compare.remove : MESSAGES.compare.add}
    </Button>
  );
}
