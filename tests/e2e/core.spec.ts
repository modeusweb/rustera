import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";
import { detailsFixture, downloadV3Fixture, searchFixture } from "./fixtures";

const APP_HOST = "**/backapi.rustore.ru/**";

function mockUpstream(route: Route): unknown {
  const url = route.request().url();
  if (url.includes("/applicationData/apps")) {
    return route.fulfill({ json: searchFixture });
  }
  if (url.includes("/applicationData/overallInfo/")) {
    if (url.endsWith("/not-a-package")) {
      return route.fulfill({ status: 404, json: { code: "ERROR", message: "Can't find required data" } });
    }
    return route.fulfill({ json: detailsFixture });
  }
  if (url.includes("/download-link")) {
    return route.fulfill({ json: downloadV3Fixture });
  }
  return route.fulfill({ status: 404, json: { code: "ERROR", message: "Not found" } });
}

async function mockApi(page: Page): Promise<void> {
  await page.route(APP_HOST, mockUpstream);
}

async function hydrated(page: Page): Promise<void> {
  await page.locator('html[data-hydrated="true"]').waitFor({ state: "attached" });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("homepage loads with brand and search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Android application discovery/i })).toBeVisible();
  await expect(page.locator("#home-search")).toBeVisible();
  await expect(page.getByText("Discover. Analyze. Download.").first()).toBeVisible();
});

test("search works and results render", async ({ page }) => {
  await page.goto("/search/?q=telegram");
  await expect(page.getByRole("heading", { name: /Results for/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Telegram", exact: true })).toBeVisible();
  await expect(page.getByText("org.telegram.messenger.web").first()).toBeVisible();
});

test("empty search state is shown for no query", async ({ page }) => {
  await page.goto("/search/");
  await expect(page.getByText("No applications found")).toBeVisible();
});

test("invalid package identifier is handled", async ({ page }) => {
  await page.goto("/app/?p=not-a-package");
  await expect(page.getByRole("heading", { name: /not found|went wrong/i }).first()).toBeVisible();
});

test("application details render technical metadata", async ({ page }) => {
  await page.goto("/app/?p=org.telegram.messenger.web");
  await expect(page.getByRole("heading", { name: "Technical information" })).toBeVisible();
  await expect(page.getByText("Android 6.0 (API 23)").first()).toBeVisible();
  await expect(page.getByText("Android 16 (API 36)").first()).toBeVisible();
});

test("download link resolution works with mocked upstream", async ({ page }) => {
  await page.goto("/app/?p=org.telegram.messenger.web");
  await hydrated(page);
  await page.getByRole("button", { name: "Get download link" }).click();
  await expect(page.getByText("Original file link ready")).toBeVisible();
  await expect(page.getByText("org.telegram.messenger.web-13.3.1.zip")).toBeVisible();
});

test("download errors are handled and retry is offered", async ({ page }) => {
  // Registered after beforeEach, so it takes precedence over the happy-path mock.
  await page.route("**/backapi.rustore.ru/**", (route) => {
    const url = route.request().url();
    if (url.includes("/download-link")) {
      return route.fulfill({ status: 404, json: { code: "ERROR", message: "No file" } });
    }
    return mockUpstream(route);
  });
  await page.goto("/app/?p=org.telegram.messenger.web");
  await hydrated(page);
  await page.getByRole("button", { name: "Get download link" }).click();
  await expect(page.getByText("No downloadable file is available for this release.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Retry/ })).toBeVisible();
});

test("favorites work", async ({ page }) => {
  await page.goto("/app/?p=org.telegram.messenger.web");
  await hydrated(page);
  await page.getByRole("button", { name: "Add to favorites" }).click();
  await page.goto("/favorites/");
  await expect(page.getByRole("heading", { name: "Telegram", exact: true })).toBeVisible();
});

test("download history works", async ({ page }) => {
  await page.goto("/app/?p=org.telegram.messenger.web");
  await hydrated(page);
  await page.getByRole("button", { name: "Get download link" }).click();
  await expect(page.getByText("Original file link ready")).toBeVisible();
  await page.goto("/downloads/");
  await expect(page.getByRole("link", { name: "Telegram", exact: true })).toBeVisible();
  await expect(page.getByText("Resolved", { exact: true })).toBeVisible();
});

test("theme switching works", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  const toggle = page.getByRole("button", { name: "Switch color theme" });
  const background = () =>
    page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  const before = await background();
  await toggle.click();
  await expect.poll(background).not.toBe(before);
  await toggle.click();
  await expect.poll(background).toBe(before);
});

test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Downloads" }),
  ).toBeVisible();
});

test("search input handles escape and clear", async ({ page }) => {
  await page.goto("/search/");
  await hydrated(page);
  const input = page.getByLabel("Search the RuStore catalog", { exact: true }).last();
  await input.fill("telegram");
  await expect(input).toHaveValue("telegram");
  await input.press("Escape");
  await expect(input).toHaveValue("");
});

test("technical comparison highlights differences", async ({ page }) => {
  await page.goto("/app/?p=org.telegram.messenger.web");
  await hydrated(page);
  await page.getByRole("button", { name: "Add to comparison" }).click();
  await page.goto("/compare/");
  await expect(page.getByRole("heading", { name: "Compare applications" })).toBeVisible();
  await expect(page.getByText("Minimum SDK")).toBeVisible();
});
