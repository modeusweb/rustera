"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// XMarkIcon is used for both the mobile menu and the search clear control.
import { MESSAGES } from "@/lib/constants/messages";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: MESSAGES.nav.home },
  { href: "/search", label: MESSAGES.nav.search },
  { href: "/downloads", label: MESSAGES.nav.downloads },
  { href: "/favorites", label: MESSAGES.nav.favorites },
  { href: "/compare", label: MESSAGES.nav.compare },
  { href: "/about", label: MESSAGES.nav.about },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search/?q=${encodeURIComponent(trimmed)}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${MESSAGES.brand.name} — ${MESSAGES.nav.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/rustera-mark.svg`} alt="" width={30} height={30} className="rounded-md" />
          <span className="text-base font-bold tracking-[0.18em] text-fg">{MESSAGES.brand.name}</span>
        </Link>

        <form onSubmit={submit} role="search" className="ml-auto hidden w-full max-w-xs md:block">
          <div className="relative">
            <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={MESSAGES.search.placeholder}
              aria-label={MESSAGES.search.label}
              className={`h-9 w-full rounded-lg border border-line bg-surface pl-9 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none ${query ? "pr-9" : "pr-3"}`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={MESSAGES.search.clear}
                className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-fg"
              >
                <XMarkIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-hover text-fg" : "text-muted hover:bg-hover hover:text-fg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? MESSAGES.nav.closeMenu : MESSAGES.nav.openMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted hover:bg-hover hover:text-fg lg:hidden"
          >
            {menuOpen ? <XMarkIcon aria-hidden="true" className="h-5 w-5" /> : <Bars3Icon aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-line bg-surface lg:hidden">
          <form onSubmit={submit} role="search" className="border-b border-line p-4 md:hidden">
            <div className="relative">
              <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={MESSAGES.search.placeholder}
                aria-label={MESSAGES.search.label}
                className={`h-10 w-full rounded-lg border border-line bg-bg pl-9 text-sm text-fg ${query ? "pr-10" : "pr-3"}`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={MESSAGES.search.clear}
                  className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-fg"
                >
                  <XMarkIcon aria-hidden="true" className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          <nav aria-label="Mobile" className="flex flex-col p-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-muted-strong hover:bg-hover hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
