import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// The backend is mocked: nothing here ever reaches the real one.
async function mock(page: Page, opts: { published?: object[]; submit?: object } = {}) {
  const sent: { path: string; args: Record<string, unknown> }[] = [];
  await page.route("**/api/query", (r) => r.fulfill({ json: { status: "success", value: opts.published ?? [] } }));
  await page.route("**/api/mutation", (r) => {
    sent.push(r.request().postDataJSON());
    return r.fulfill({ json: opts.submit ?? { status: "success", value: null } });
  });
  return sent;
}

const noOverflow = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);

test.beforeEach(async ({ page }) => {
  // The cookie banner is covered elsewhere; keep it off the buttons.
  await page.addInitScript(() => localStorage.setItem("ga_consent", "denied"));
});

test("a customer can leave a review, low stars included", async ({ page }) => {
  const sent = await mock(page);
  await page.goto("/review/");
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByRole("alert")).toContainText("stars");

  await page.getByLabel("2 stars").check({ force: true });
  await page.getByLabel(/Your review/).fill("The massage was fine but started late.");
  await page.getByLabel(/Your name/).fill("Test Guest");
  await noOverflow(page);
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0].path).toBe("beautyReviews:submit");
  expect(sent[0].args).toEqual({ name: "Test Guest", rating: 2, text: "The massage was fine but started late." });
});

test("if sending fails, the words are kept and WhatsApp is offered", async ({ page }) => {
  await mock(page, { submit: { status: "error", errorMessage: "Server Error" } });
  await page.goto("/review/");
  await page.getByLabel("5 stars").check({ force: true });
  await page.getByLabel(/Your review/).fill("Wonderful pedicure at our villa.");
  await page.getByLabel(/Your name/).fill("Test Guest");
  await page.getByRole("button", { name: "Send review" }).click();
  await expect(page.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me|whatsapp/);
  await expect(page.getByLabel(/Your review/)).toHaveValue("Wonderful pedicure at our villa.");
});

test("published reviews show on the home page as plain text", async ({ page }) => {
  await mock(page, { published: [{ _id: "1", name: "Test Guest", rating: 4, text: "<b>Great</b> braids", service: "Hair", createdAt: Date.UTC(2026, 10, 15) }] });
  await page.goto("/");
  await expect(page.getByText("<b>Great</b> braids")).toBeVisible();
  await expect(page.getByLabel("4 of 5 stars")).toBeVisible();
  await expect(page.getByText("Hair · November 2026")).toBeVisible();
  await noOverflow(page);
});

test("the home page works, and invites reviews, when there are none or the backend is down", async ({ page }) => {
  await page.route("**/api/query", (r) => r.abort());
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Spa care at your villa." })).toBeVisible();
  await expect(page.locator("#reviews").getByRole("link", { name: "Leave a review" })).toHaveAttribute("href", "/review/");
});
