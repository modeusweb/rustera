"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { AppScreenshot } from "@/types/domain";

/** Accessible image lightbox: no download link, keyboard navigation, focus return. */
export function ScreenshotGallery({
  items,
  appName,
}: {
  items: AppScreenshot[];
  appName: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [fullFailed, setFullFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((next: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setFullFailed(false);
    setIndex(next);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback((delta: number) => {
    setIndex((current) => {
      if (current === null) return current;
      return (current + delta + items.length) % items.length;
    });
    setFullFailed(false);
  }, [items.length]);

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [index, close, step]);

  const current = index === null ? null : items[index];

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item, position) => (
          <button
            key={`${item.url}-${position}`}
            type="button"
            onClick={(event) => open(position, event.currentTarget)}
            aria-label={`Open ${appName} screenshot ${position + 1} of ${items.length}`}
            className="shrink-0 overflow-hidden rounded-lg border border-line transition-colors hover:border-accent"
          >
            <Image
              src={item.url}
              alt={`${appName} screenshot ${position + 1}`}
              width={150}
              height={280}
              loading="lazy"
              className="h-[260px] w-[145px] object-cover object-top"
            />
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${appName} screenshots`}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-full w-full max-w-4xl flex-col items-center gap-4"
          >
            <div className="flex w-full items-center justify-between gap-4 text-sm text-white/80">
              <span>
                {appName} — {(index ?? 0) + 1} / {items.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close screenshots"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10"
              >
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 max-h-[76vh] w-full items-center justify-center gap-2">
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous screenshot"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                </button>
              )}

              {fullFailed ? (
                <div className="flex h-[60vh] w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-white/70">
                  <PhotoIcon aria-hidden="true" className="h-10 w-10" />
                  <span className="text-sm">Image unavailable</span>
                </div>
              ) : (
                <Image
                  key={current.url}
                  src={current.url}
                  alt={`${appName} screenshot ${(index ?? 0) + 1}`}
                  width={720}
                  height={1280}
                  onError={() => setFullFailed(true)}
                  className="max-h-[76vh] w-auto max-w-full rounded-lg object-contain"
                />
              )}

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next screenshot"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
