import { test, expect } from "playwright-test-coverage";
import { Page } from "playwright";
import { User, Role } from "../src/service/pizzaService";

async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = {
        "d@jwt.com": {
            id: "3",
            name: "Kai Chen",
            email: "d@jwt.com",
            password: "a",
            roles: [{ role: Role.Diner }],
        },
        "a@jwt.com": {
            id: "5",
            name: "Admin User",
            email: "a@jwt.com",
            password: "admin",
            roles: [{ role: Role.Admin }],
        },
        "f@jwt.com": {
            id: "4",
            name: "Franchise Owner",
            email: "f@jwt.com",
            password: "f",
            roles: [{ role: Role.Franchisee }],
        },
    };

    

    // Authorize login for the given user
    await page.route("*/**/api/auth", async (route) => {
        if (route.request().method() === "DELETE") {
            loggedInUser = undefined;
            await route.fulfill({ status: 204 });
            return;

        }

        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
            return;
        }
        loggedInUser = validUsers[loginReq.email];
        const loginRes = {
            user: loggedInUser,
            token: "abcdef",
        };
        expect(route.request().method()).toBe("PUT");
        await route.fulfill({ json: loginRes });
    });

    // return users for admin to view
    await page.route("*/**/api/user?page**", async (route) => {
        // "/api/user?page=1&limit=10&name=*"
        if (!loggedInUser || !loggedInUser.roles?.find((r) => r.role === Role.Admin)) {
            await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
            return;
        }
        const url = new URL(route.request().url());
        const page = Number(url.searchParams.get("page") || "0");
        const limit = Number(url.searchParams.get("limit") || "10");
        const name = url.searchParams.get("name");
        const users = Object.values(validUsers ).filter((u) => {
            if (!name) return true;
            return u.name!.includes(name);
        });
        const start = page * limit;
        const end = start + limit;
        await route.fulfill({ json: { users: users.slice(start, end), more: end < users.length } });
    });

    await page.route(/\/api\/user\/(\d+)/, async (route) => {
        expect(route.request().method()).toBe("PUT");
        const updateUser: User = route.request().postDataJSON();
        if (!loggedInUser) {
            await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
            return;
        }
        loggedInUser = { ...loggedInUser, ...updateUser };
        validUsers[loggedInUser.email!] = loggedInUser;
        await route.fulfill({ json: loggedInUser });
    });

    // Return the currently logged in user
    await page.route("*/**/api/user/me", async (route) => {
        expect(route.request().method()).toBe("GET");
        await route.fulfill({ json: loggedInUser });
    });

    // A standard menu
    await page.route("*/**/api/order/menu", async (route) => {
        const menuRes = [
            {
                id: 1,
                title: "Veggie",
                image: "pizza1.png",
                price: 0.0038,
                description: "A garden of delight",
            },
            {
                id: 2,
                title: "Pepperoni",
                image: "pizza2.png",
                price: 0.0042,
                description: "Spicy treat",
            },
        ];
        expect(route.request().method()).toBe("GET");
        await route.fulfill({ json: menuRes });
    });

    // Get a user's franchise
    await page.route(/\/api\/franchise\/:(\d+)/, async (route) => {
        // '/api/franchise/:userId'
        const userId = "4";
        if (userId === "4") {
            await route.fulfill({
                json: [
                    {
                        id: 2,
                        name: "pizzaPocket",
                        admins: [{ id: 4, name: "pizza franchisee", email: "f@jwt.com" }],
                        stores: [{ id: 4, name: "SLC", totalRevenue: 0 }],
                    },
                ],
            });
        } else {
            await route.fulfill({ json: [] });
        }
    });

    // Standard franchises and stores
    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
        const franchiseRes = {
            franchises: [
                {
                    id: 2,
                    name: "LotaPizza",
                    stores: [
                        { id: 4, name: "Lehi" },
                        { id: 5, name: "Springville" },
                        { id: 6, name: "American Fork" },
                    ],
                },
                { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
                { id: 4, name: "topSpot", stores: [] },
            ],
        };
        expect(route.request().method()).toBe("GET");
        await route.fulfill({ json: franchiseRes });
    });

    // Order a pizza.
    await page.route("**/api/order", async (route) => {
        if (route.request().method() === "POST") {
            const orderReq = route.request().postDataJSON();
            const orderRes = {
                order: { ...orderReq, id: 23 },
                jwt: "eyJpYXQ",
            };

            await route.fulfill({ json: orderRes });
        } else {
            await route.continue();
        }
    });

    await page.goto("/");
}

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


test('login as admin', async ({ page }) => {

    // TODO: hardcoded admin user, change to be more robust in future
await basicInit(page);
await page.goto('/');

await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('admin');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('link', { name: 'Admin' }).click();
await expect(page.getByTestId('users-header')).toBeVisible();
await expect(page.getByTestId('users-table')).toBeVisible();

});

test('delete user as admin', async ({ page }) => { 
    await basicInit(page);
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByTestId('users-table')).toBeVisible();
    await expect(page.getByText('a@jwt.com')).toBeVisible();
    await expect(page.getByText('Kai Chen')).toBeVisible();
});




// new plan
/* 
  --- startup backend in CI with test configuration ---
         -- figure out if that works with locahost and if .env vars need to change



*/



// test("access franchise dashboard", async ({ page }) => {
//     await basicInit(page);

//     //login as franchise owner
//     await page.getByRole("link", { name: "Login" }).click();
//     await page.getByRole("textbox", { name: "Email address" }).fill("f@jwt.com");
//     await page.getByRole("textbox", { name: "Password" }).fill("f");
//     await page.getByRole("button", { name: "Login" }).click();
//     await page.getByRole("link", { name: "Franchise" }).first().click();
//     await expect(page.getByText("Everything you need to run an JWT Pizza franchise. Your gateway to success.")).toBeVisible();
//     await expect(page.getByText("pizzaPocket")).toBeVisible();

// });
