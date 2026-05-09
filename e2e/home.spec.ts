import { test, expect } from "@playwright/test";

test("homepage renders title and a visible H1", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/harin \/\/ operator console/);
  await expect(page.locator("h1").first()).toBeVisible();
});
