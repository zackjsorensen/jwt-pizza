import { Page } from "playwright";
import { expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

export async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    let validUsers: Record<string, User> = {
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

    let franchiseRes = {
        franchises: [
            {
                id: 2,
                admins: [{ id: 4, name: "pizza franchisee", email: "f@jwt.com" }],
                name: "LotaPizza",
                stores: [
                    { id: 4, name: "Lehi" },
                    { id: 5, name: "Springville" },
                    { id: 6, name: "American Fork" },
                ],
            },
            {
                id: 3,
                admins: [{ id: 5, name: "Admin User", email: "a@jwt.com" }],
                name: "PizzaCorp",
                stores: [{ id: 7, name: "Spanish Fork" }],
            },
            { id: 4, admins: [{ email: "jimmy@jwt.com" }], name: "topSpot", stores: [] },
        ],
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
        const pageNum = Number(url.searchParams.get("page") || "0");
        const limit = Number(url.searchParams.get("limit") || "10");
        const name = url.searchParams.get("name");
        const users = Object.values(validUsers).filter((u) => {
            if (!name) return true;
            return u.name!.includes(name);
        });
        const start = pageNum * limit;
        const end = start + limit;
        await route.fulfill({
            json: { users: users.slice(start, end), more: end < users.length },
        });
    });

    await page.route(/\/api\/user\/(\d+)/, async (route) => {
        if (route.request().method() === "PUT") {
            const updateUser: User = route.request().postDataJSON();
            if (!loggedInUser) {
                await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
                return;
            }
            loggedInUser = { ...loggedInUser, ...updateUser };
            validUsers[loggedInUser.email!] = loggedInUser;
            await route.fulfill({ json: loggedInUser });
        } else if (route.request().method() === "DELETE") {
            const match = route
                .request()
                .url()
                .match(/\/api\/user\/(\d+)/);
            const id = match?.[1];

            const userToDelete = Object.values(validUsers).find((u) => u.id === id);
            // const userToDelete: User = route.request().postDataJSON();
            if (userToDelete) {
                delete validUsers[userToDelete.email!];
            }
            console.log("After delete:", Object.keys(validUsers));
            await route.fulfill({ status: 204 });
        }
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
    await page.route(/\/api\/franchise\/(\d+)/, async (route) => {
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
        if (route.request().method() === "POST") {
            const franchiseReq = route.request().postDataJSON();
            franchiseRes.franchises.push({
                id: franchiseRes.franchises.length + 2,
                name: franchiseReq.name,
                admins: franchiseReq.admins,
                stores: [],
            });
            await route.fulfill({
                json: franchiseRes.franchises[franchiseRes.franchises.length - 1],
            });
        } else if (route.request().method() === "GET") {
            await route.fulfill({ json: franchiseRes });
        }
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
