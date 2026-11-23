import Link from "next/link";
import { MESSAGES } from "@/lib/constants/messages";
import { Disclaimer } from "@/components/ui/primitives";

const REPOSITORY_URL = "https://github.com/modeusweb/rustera";

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/rustera-mark.svg`} alt="" width={26} height={26} />
            <span className="font-bold tracking-[0.18em]">{MESSAGES.brand.name}</span>
          </div>
          <p className="text-sm text-muted">{MESSAGES.brand.tagline}</p>
          <p className="mt-2 text-sm text-muted">{MESSAGES.brand.description}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm text-muted">
          <Link className="hover:text-fg" href="/about">{MESSAGES.nav.about}</Link>
          <Link className="hover:text-fg" href="/privacy">Privacy policy</Link>
          <Link className="hover:text-fg" href="/terms">Terms of use</Link>
          <Link className="hover:text-fg" href="/downloads">{MESSAGES.nav.downloads}</Link>
        </nav>
        <div className="md:col-span-1">
          <Disclaimer />
        </div>
      </div>
      <div className="border-t border-line px-4 py-5">
        <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted sm:flex-row sm:gap-4">
          <span>
            © {new Date().getFullYear()} {MESSAGES.brand.name}. {MESSAGES.footer.rights}
          </span>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-hover hover:text-fg"
          >
            <GitHubMark />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
