import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HydrationMarker } from "@/components/layout/HydrationMarker";
import { MESSAGES } from "@/lib/constants/messages";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/constants/theme";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://modeusweb.github.io/rustera";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Resolved against metadataBase, which already contains the Pages sub-path.
const ogImage = "/images/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${MESSAGES.brand.name} — ${MESSAGES.brand.tagline}`,
    template: `%s · ${MESSAGES.brand.name}`,
  },
  description: MESSAGES.brand.description,
  applicationName: MESSAGES.brand.name,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "48x48", type: "image/x-icon" },
      { url: `${basePath}/icon.svg`, type: "image/svg+xml" },
    ],
    apple: [{ url: `${basePath}/apple-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: MESSAGES.brand.name,
    title: `${MESSAGES.brand.name} — ${MESSAGES.brand.tagline}`,
    description: MESSAGES.brand.description,
    url: siteUrl,
    locale: "en_US",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${MESSAGES.brand.name} — ${MESSAGES.brand.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${MESSAGES.brand.name} — ${MESSAGES.brand.tagline}`,
    description: MESSAGES.brand.description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d11" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <Header />
        <HydrationMarker />
        <main
          id="main-content"
          className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
