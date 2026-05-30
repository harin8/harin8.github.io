import { test, expect } from "@playwright/test";

test("homepage renders title and a visible H1", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/harin \/\/ ai-forward engineer/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("lab page renders the agent loop", async ({ page }) => {
  await page.goto("/lab");

  await expect(page.locator("h1")).toContainText("the lab");
  // The interactive agent run exposes a run/idle status label.
  await expect(page.getByText("agent.run()")).toBeVisible();
});
