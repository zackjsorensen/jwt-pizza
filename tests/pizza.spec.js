import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

// test('register user', async ({ page }) => {
//   // TODO: investigate why passes twice in a row - shouldn't be able to register same user twice.
//   // Is test data persistent across tests?

// await page.goto('/');

// await page.goto('http://localhost:5173/register');
// await page.getByRole('textbox', { name: 'Full name' }).fill('z');
// await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
// await page.getByRole('textbox', { name: 'Email address' }).fill('z@jwt.com');
// await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
// await page.getByRole('textbox', { name: 'Password' }).fill('z');
// await page.getByRole('button', { name: 'Register' }).click();
// await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
// await page.getByRole('link', { name: 'Order' }).click();
// await page.getByRole('combobox').selectOption('1');
// await page.getByRole('link', { name: 'Image Description Cheese' }).click();
// await page.getByRole('link', { name: 'Image Description Cheese' }).click();
// await expect(page.locator('form')).toContainText('Selected pizzas: 2');
// await page.getByRole('button', { name: 'Checkout' }).click();
// await expect(page.getByRole('button', { name: 'Pay now' })).toBeVisible();
// await page.getByRole('button', { name: 'Pay now' }).click();
// await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
// await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');


// });

test('logged out test', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});


test('login and buy pizza', async ({ page }) => {
await page.goto('/');
await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('z@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('z');
await page.getByRole('button', { name: 'Login' }).click();
await expect(page.locator('#navbar-dark')).toContainText('Logout');
await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
await page.getByRole('link', { name: 'About' }).click();
await expect(page.getByRole('main')).toContainText('The secret sauce');


});


test('about page', async ({ page }) => {

await page.goto('http://localhost:5173/');
await page.getByRole('link', { name: 'About' }).click();
await expect(page.getByRole('img').nth(3)).toBeVisible();
await expect(page.getByRole('main')).toContainText('The secret sauce');

});

test('franchise page', async ({ page }) => {await page.goto('http://localhost:5173/');
await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('f');
await page.getByRole('button', { name: 'Login' }).click();

await page.goto('/');
await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
await expect(page.getByRole('main').locator('img')).toBeVisible();
await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
});


test('login as admin', async ({ page }) => {

    // TODO: hardcoded admin user, change to be more robust in future

await page.goto('/');

await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('admin');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button').filter({ hasText: /^$/ }).click();
await page.getByRole('button').filter({ hasText: /^$/ }).click();


});


test('login, create franchise, logout', async ({ page }) => {
  await page.goto('/');
  


});