import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

/**
 * Captures documentation screenshots against a running dev/production server.
 * Usage: node tests/e2e/screenshots.mjs [baseURL]
 */
const baseURL = process.argv[2] ?? "http://127.0.0.1:3000";
const output = "public/images";
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  locale: "en-US",
  colorScheme: "dark",
});

const routes = [
  { path: "/", file: "home.png", wait: "[data-hydrated='true']" },
  { path: "/search?q=telegram", file: "search.png", wait: "[data-hydrated='true']" },
  { path: "/apps/org.telegram.messenger.web", file: "details.png", wait: "[data-hydrated='true']" },
];

for (const route of routes) {
  await page.goto(baseURL + route.path, { waitUntil: "domcontentloaded" });
  await page.locator(route.wait).waitFor({ state: "attached", timeout: 30_000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${output}/${route.file}`, fullPage: false });
  console.log(`Captured ${route.file}`);
}

await browser.close();
