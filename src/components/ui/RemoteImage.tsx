"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { isAllowedRemoteImage } from "@/lib/validation/image-url";

/** Stable accent pair derived from a name, so placeholders look intentional. */
function palette(seed: string): [string, string] {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue} 60% 44%)`, `hsl(${(hue + 42) % 360} 62% 28%)`];
}

function initials(name: string): string {
  const words = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}

export function AppAvatar({
  src,
  name,
  size = 64,
  className = "",
}: {
  src: string | null | undefined;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [from, to] = palette(name || "app");

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line ${className}`}
      style={{ width: size, height: size }}
    >
      {isAllowedRemoteImage(src) && !failed ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={`${name} icon unavailable`}
          className="relative flex h-full w-full items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 85% 80%, white 0, transparent 40%)",
            }}
          />
          <span className="relative text-[0.42em] font-bold tracking-wide text-white/95" style={{ fontSize: Math.max(12, size * 0.32) }}>
            {initials(name)}
          </span>
        </span>
      )}
    </span>
  );
}

export function ScreenshotImage({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !isAllowedRemoteImage(src)) {
    return (
      <span
        role="img"
        aria-label={`${alt} unavailable`}
        className={`flex items-center justify-center bg-raised ${className}`}
        style={{ width, height }}
      >
        <span className="flex flex-col items-center gap-2 text-muted">
          <PhotoIcon aria-hidden="true" className="h-7 w-7" />
          <span className="text-[11px]">Image unavailable</span>
        </span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
