import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./basicInit";

// Increase default timeout for CI
test.setTimeout(30_000);

test("login", async ({ page }) => {
    await basicInit(page);
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("a");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
    await basicInit(page);

    // Go to order page
    await page.getByRole("button", { name: "Order now" }).click();

    // Create order
    await expect(page.locator("h2")).toContainText("Awesome is a click away");
    await page.getByRole("combobox").selectOption("4");
    await page.getByRole("link", { name: "Image Description Veggie A" }).click();
    await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
    await expect(page.locator("form")).toContainText("Selected pizzas: 2");
    await page.getByRole("button", { name: "Checkout" }).click();

    // Login
    await page.getByPlaceholder("Email address").click();
    await page.getByPlaceholder("Email address").fill("d@jwt.com");
    await page.getByPlaceholder("Email address").press("Tab");
    await page.getByPlaceholder("Password").fill("a");
    await page.getByRole("button", { name: "Login" }).click();

    // Pay
    await expect(page.getByRole("main")).toContainText("Send me those 2 pizzas right now!");
    await expect(page.locator("tbody")).toContainText("Veggie");
    await expect(page.locator("tbody")).toContainText("Pepperoni");
    await expect(page.locator("tfoot")).toContainText("0.008 ₿");
    await page.getByRole("button", { name: "Pay now" }).click();

    // Check balance
    await expect(page.getByText("0.008")).toBeVisible();
});

test("update admin user", async ({ page }) => {
    await basicInit(page);
    await page.goto("/");

    //login as admin
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "au" })).toBeVisible();
    await page.getByRole("link", { name: "au" }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    const newName = "Updated Admin";
    await page.getByRole("textbox").first().fill(newName);
    await page.getByRole("button", { name: "Update" }).click();

    await page.getByRole("link", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "ua" })).toBeVisible();
});

test("view history page", async ({ page }) => {
    await basicInit(page);
    await page.goto("/");
    await page.goto("http://localhost:5173/");
    await page.getByRole("link", { name: "History" }).click();
    await expect(page.getByText("Mama Rucci, my my")).toBeVisible();
    await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
});

test("login as admin", async ({ page }) => {
    // TODO: hardcoded admin user, change to be more robust in future
    await basicInit(page);
    await page.goto("/");

    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
    await page.getByRole("textbox", { name: "Email address" }).press("Tab");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page.getByTestId("users-header")).toBeVisible();
    await expect(page.getByTestId("users-table")).toBeVisible();
});

test("delete user as admin", async ({ page }) => {
    await basicInit(page);
    await page.goto("/");

    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page.getByTestId("users-table")).toBeVisible();
    await expect(page.getByText("a@jwt.com")).toBeVisible();
    await expect(page.getByText("Kai Chen")).toBeVisible();
    await page
        .getByRole("row", { name: /Kai Chen/i })
        .getByRole("button", { name: "X" })
        .click();
    await expect(page.getByText("Kai Chen")).toHaveCount(0);

});

test("create franchise", async ({ page }) => {
    await basicInit(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Admin" }).click();
    await page.getByRole("button", { name: "Add Franchise" }).click();
    await page.getByPlaceholder("franchise name").fill("Test Franchise");
    await page.getByPlaceholder("franchisee admin email").fill("d@jwt.com");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("Test Franchise")).toBeVisible();
});

test("access franchise dashboard", async ({ page }) => {
    await basicInit(page);
    await page.goto("/");

    //login as franchise owner
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("f@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("f");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Franchise" }).first().click();
    await expect(
        page.getByText(
            "Everything you need to run an JWT Pizza franchise. Your gateway to success.",
        ),
    ).toBeVisible();
    await expect(page.getByText("pizzaPocket")).toBeVisible();
});
