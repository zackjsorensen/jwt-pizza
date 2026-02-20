import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright";

test.setTimeout(10000); // 30s per test

// Helper to register a new user
async function registerUser(page: Page, name = "pizza diner") {
  const email = `user+${Date.now()}@jwt.com`;
  const password = "diner";

  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(name);
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();

  // Wait for login - user badge appears when logged in
  await page.getByRole("link", { name: "pd" }).waitFor({ state: "visible" });

  return { email, password };
}

test("updateUser", async ({ page }) => {
  const { email } = await registerUser(page);

  // Navigate to user page
  await page.getByRole("link", { name: "pd" }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd" }).click();
  await expect(page.getByRole("main")).toContainText("pizza diner");

  // Edit user
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator("h3").waitFor({ state: "visible" });
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();
  await page.locator('[role="dialog"].hidden').waitFor({ state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  // Logout and login again
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd" }).click();
  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

test("update password", async ({ page }) => {
  const { email, password } = await registerUser(page);

  // Navigate to user page
  await page.getByRole("link", { name: "pd", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd", exact: true }).click();
  await page.getByRole("button", { name: "Edit" }).click();

  // Update password
  const newPassword = "newpassword";
  await page.locator("#password").click();
  await page.locator("#password").fill(newPassword);
  await page.getByRole("button", { name: "Update" }).click();

  // Logout and login with new password
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(newPassword);
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
});

test("update email", async ({ page }) => {
  const { email, password } = await registerUser(page);

  // Navigate to user page
  await page.getByRole("link", { name: "pd", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd", exact: true }).click();
  await page.getByRole("button", { name: "Edit" }).click();

  // Update email
  const newEmail = `new+${Date.now()}@jwt.com`;
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(newEmail);
  await page.getByRole("button", { name: "Update" }).click();

  // Logout and login with new email
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(newEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: "pd", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
});
