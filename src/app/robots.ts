import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://modeusweb.github.io/rustera";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/search/", "/downloads/", "/favorites/", "/compare/", "/privacy/", "/terms/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
