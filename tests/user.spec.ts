import { test, expect } from "playwright-test-coverage";

test("updateUser", async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
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

