import type { NextConfig } from "next";

// GitHub Pages serves a project site from /<repo>/ and cannot run a Node server.
// The browser talks directly to the CORS-enabled RuStore API (see client-api.ts).
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/rustera" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  basePath,
  assetPrefix: isPages ? "/rustera/" : undefined,
  // Public-folder assets referenced from components need the prefix manually.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "static-m.rustore.ru" },
      { protocol: "https", hostname: "static.rustore.ru" },
    ],
  },
};

export default nextConfig;
