import { test, expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

test("updateUser", async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    let storedUser: User = {
        id: "100",
        name: "pizza diner",
        email,
        password: "diner",
        roles: [{ role: Role.Diner }],
    };
    const token = "mock-token";

    await page.route("*/**/api/auth", async (route) => {
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
                roles: [{ role: Role.Diner }],
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

    await page.route(/\/api\/user\/(\d+)/, async (route) => {
        if (route.request().method() === "PUT") {
            const updatedUser: User = route.request().postDataJSON();
            const prevPassword = storedUser.password;
            storedUser = { ...storedUser, ...updatedUser };
            if (updatedUser.password === undefined || updatedUser.password === "") {
                storedUser.password = prevPassword ?? "diner";
            }
            await route.fulfill({ json: { user: storedUser, token } });
            return;
        }
        await route.continue();
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill("diner");
    await page.getByRole("button", { name: "Register" }).click();

    await page.getByRole("link", { name: "pd" }).click();

    await expect(page.getByRole("main")).toContainText("pizza diner");

    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("h3")).toContainText("Edit user");
    await page.getByRole("textbox").first().fill("pizza dinerx");
    await page.getByRole("button", { name: "Update" }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

    await expect(page.getByRole("main")).toContainText("pizza dinerx");

    await page.getByRole("link", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Login" }).click();

    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill("diner");
    await page.getByRole("button", { name: "Login" }).click();

    await page.getByRole("link", { name: "pd" }).click();

    await expect(page.getByRole("main")).toContainText("pizza dinerx");
});


test("update password", async ({ page }) => {

    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    const testUser = { name: "pizza diner",
        email: email,
        password: "diner",
    };

    await page.goto('http://localhost:5173/register');
    await page.getByRole('textbox', { name: 'Full name' }).fill(testUser.name);
    await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email address' }).fill(testUser.email);
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password);
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'pd', exact: true }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const newPassword = "newpassword";

    await page.locator('#password').click();
    await page.locator('#password').fill(newPassword);
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(testUser.email);
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(newPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pd', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
   
});


test("update email", async ({ page }) => {

    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    const testUser = { name: "pizza diner",
        email: email,
        password: "diner",
    };

    await page.goto('http://localhost:5173/register');
    await page.getByRole('textbox', { name: 'Full name' }).fill(testUser.name);
    await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email address' }).fill(testUser.email);
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password);
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'pd', exact: true }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const newemail = "newemail@jwt.com";

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill(newemail);
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(newemail);
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(testUser.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pd', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
   
});


test("update admin info", async ({ page }) => {

    // need to mock the getUser endpoint to return an admin user, then test that the admin can update their info and that it persists.

    // mock
    

    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

});
