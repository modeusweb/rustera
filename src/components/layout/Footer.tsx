import Link from "next/link";
import { MESSAGES } from "@/lib/constants/messages";
import { Disclaimer } from "@/components/ui/primitives";

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
      <div className="border-t border-line px-4 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {MESSAGES.brand.name}. {MESSAGES.footer.rights}
      </div>
    </footer>
  );
}
