import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright";
import { User, Role } from "../src/service/pizzaService";
import { basicInit } from "./basicInit";

test.setTimeout(process.env.CI ? 30000 : 10000);

const token = "mock-token";

function setupUserMocks(page: Page, options?: { initialUser?: User }) {
    let storedUser: User = options?.initialUser ?? {
        id: "100",
        name: "",
        email: "",
        password: "",
        roles: [{ role: Role.Diner }],
    };

    page.route("*/**/api/auth", async (route) => {
        if (route.request().method() === "DELETE") {
            await route.fulfill({ status: 204 });
            return;
        }
        if (route.request().method() === "POST") {
            const body = route.request().postDataJSON();
            storedUser = {
                id: storedUser.id ?? "100",
                name: body.name,
                email: body.email,
                password: body.password,
                roles: storedUser.roles ?? [{ role: Role.Diner }],
            };
            await route.fulfill({ json: { user: storedUser, token } });
            return;
        }
        if (route.request().method() === "PUT") {
            const body = route.request().postDataJSON();
            if (body.email === storedUser.email && body.password === storedUser.password) {
                await route.fulfill({ json: { user: storedUser, token } });
            } else {
                await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
            }
            return;
        }
        await route.continue();
    });

    page.route(/\/api\/user\/(\d+)/, async (route) => {
        if (route.request().method() === "PUT") {
            const updatedUser: User = route.request().postDataJSON();
            const prevPassword = storedUser.password;
            storedUser = { ...storedUser, ...updatedUser };
            if (updatedUser.password === undefined || updatedUser.password === "") {
                storedUser.password = prevPassword ?? "";
            }
            await route.fulfill({ json: { user: storedUser, token } });
            return;
        }
        await route.continue();
    });

    page.route("*/**/api/order", async (route) => {
        if (route.request().method() === "GET") {
            await route.fulfill({ json: { orders: [] } });
            return;
        }
        await route.continue();
    });
}

test("updateUser", async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    setupUserMocks(page);

    await page.goto("/");
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill("diner");
    await page.getByRole("button", { name: "Register" }).click();

    await page.getByRole("link", { name: "pd" }).first().click();
    await expect(page.getByRole("main")).toContainText("pizza diner");

    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator("h3").waitFor({ state: "visible" });
    await page.getByRole("textbox").first().fill("pizza dinerx");
    await page.getByRole("button", { name: "Update" }).click();
    await page.locator('[role="dialog"].hidden').waitFor({ state: "attached" });

    await expect(page.getByRole("main")).toContainText("pizza dinerx");

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
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    const testUser = { name: "pizza diner", email, password: "diner" };
    setupUserMocks(page);

    await page.goto("/register");
    await page.getByRole("textbox", { name: "Full name" }).fill(testUser.name);
    await page.getByRole("textbox", { name: "Email address" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Password" }).fill(testUser.password);
    await page.getByRole("button", { name: "Register" }).click();
    await page.getByRole("link", { name: "pd", exact: true }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    const newPassword = "newpassword";
    await page.locator("#password").click();
    await page.locator("#password").fill(newPassword);
    await page.getByRole("button", { name: "Update" }).click();
    await page.getByRole("link", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Password" }).fill(newPassword);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "pd", exact: true }).click();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
});

test("update email", async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    const testUser = { name: "pizza diner", email, password: "diner" };
    setupUserMocks(page);

    await page.goto("/register");
    await page.getByRole("textbox", { name: "Full name" }).fill(testUser.name);
    await page.getByRole("textbox", { name: "Email address" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Password" }).fill(testUser.password);
    await page.getByRole("button", { name: "Register" }).click();
    await page.getByRole("link", { name: "pd", exact: true }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    const newEmail = "newemail@jwt.com";
    await page.locator("input[type='email']").click();
    await page.locator("input[type='email']").fill(newEmail);
    await page.getByRole("button", { name: "Update" }).click();
    await page.getByRole("link", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill(newEmail);
    await page.getByRole("textbox", { name: "Password" }).fill(testUser.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "pd", exact: true }).click();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
});

test("update admin info", async ({ page }) => {
    setupUserMocks(page, {
        initialUser: {
            id: "1",
            name: "Admin User",
            email: "admin@jwt.com",
            password: "admin",
            roles: [{ role: Role.Admin }],
        },
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("admin@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();

    await page.getByRole("link", { name: "AU" }).click();
    await expect(page.getByRole("main")).toContainText("Admin User");
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("textbox").first().fill("Admin User Updated");
    await page.getByRole("button", { name: "Update" }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
    await expect(page.getByRole("main")).toContainText("Admin User Updated");

    await page.getByRole("link", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("admin@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "AU" }).click();
    await expect(page.getByRole("main")).toContainText("Admin User Updated");
});

test("create store", async ({ page }) => {
    await basicInit(page);

    await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
        if (route.request().method() === "POST") {
            const body = route.request().postDataJSON();
            await route.fulfill({
                json: { id: "99", name: body.name ?? "" },
            });
            return;
        }
        await route.continue();
    });

    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill("f@jwt.com");
    await page.getByRole("textbox", { name: "Password" }).fill("f");
    await page.getByRole("button", { name: "Login" }).click();

    await page.getByRole("link", { name: "Franchise" }).first().click();
    await page.getByRole("button", { name: "Create store" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Create store" }).click();

    await expect(page.getByRole("heading", { name: "Create store" })).toBeVisible();
    await page.getByPlaceholder("store name").fill("Provo");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/franchise-dashboard\/?$/);
    await expect(page.getByRole("button", { name: "Create store" })).toBeVisible();
});
