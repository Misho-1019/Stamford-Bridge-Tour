import { test, expect } from "@playwright/test";

const MOCK_TICKET_TYPES = [
  { id: "ticket-1", name: "Adult", priceCents: 2500, isActive: true },
  { id: "ticket-2", name: "Child", priceCents: 1500, isActive: true },
  { id: "ticket-3", name: "Student", priceCents: 2000, isActive: true },
];

const MOCK_SLOTS_RESPONSE = {
  blocked: false,
  slots: [
    {
      id: "slot-1",
      startAt: "2026-06-15T10:00:00.000Z",
      endAt: "2026-06-15T11:00:00.000Z",
      capacityTotal: 30,
      remainingSeats: 25,
    },
    {
      id: "slot-2",
      startAt: "2026-06-15T11:00:00.000Z",
      endAt: "2026-06-15T12:00:00.000Z",
      capacityTotal: 30,
      remainingSeats: 10,
    },
  ],
};

test.describe("Booking flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/ticket-types", async (route) => {
      await route.fulfill({ json: MOCK_TICKET_TYPES });
    });

    await page.route("**/slots*", async (route) => {
      await route.fulfill({ json: MOCK_SLOTS_RESPONSE });
    });
  });

  test("loads booking page with ticket types", async ({ page }) => {
    await page.goto("/book");

    await expect(page.locator("h1")).toHaveText(
      "Book Your Stamford Bridge Tour"
    );

    await expect(page.getByText("Adult")).toBeVisible();
    await expect(page.getByText("Child")).toBeVisible();
    await expect(page.getByText("Student")).toBeVisible();
  });

  test("loads slots for a date and selects one", async ({ page }) => {
    await page.goto("/book");

    await page.locator('input[type="date"]').fill("2026-06-15");
    await page.getByRole("button", { name: "Load Slots" }).click();

    await expect(page.getByText("Remaining: 25 / 30")).toBeVisible();
    await page.getByText("Remaining: 25 / 30").click();

    await expect(page.getByText("Selected slot:")).toBeVisible();
  });

  test("selects tickets and sees correct total", async ({ page }) => {
    await page.goto("/book");

    await page.locator('input[type="date"]').fill("2026-06-15");
    await page.getByRole("button", { name: "Load Slots" }).click();
    await page.getByText("Remaining: 25 / 30").click();

    const adultPlus = page.getByRole("button", { name: "+" }).first();
    await adultPlus.click();
    await adultPlus.click();

    const childPlus = page.getByRole("button", { name: "+" }).nth(1);
    await childPlus.click();

    await expect(page.getByText("Tickets selected: 3")).toBeVisible();
    await expect(page.getByText("Total: £65.00")).toBeVisible();
  });

  test("redirects to login when unauthenticated user clicks payment", async ({
    page,
  }) => {
    await page.route("**/auth/client/refresh", async (route) => {
      await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
    });

    await page.goto("/book");

    await page.locator('input[type="date"]').fill("2026-06-15");
    await page.getByRole("button", { name: "Load Slots" }).click();
    await page.getByText("Remaining: 25 / 30").click();

    const adultPlus = page.getByRole("button", { name: "+" }).first();
    await adultPlus.click();

    await page.getByPlaceholder("you@example.com").fill("test@example.com");

    await page.getByRole("button", { name: "Continue to Payment" }).click();

    await page.waitForURL("**/login");
  });
});
