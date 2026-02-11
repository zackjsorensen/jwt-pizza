import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('register user', async ({ page }) => {

  await page.goto('http://127.0.0.1:5173/');
await page.goto('http://127.0.0.1:5173/');
await page.getByRole('link', { name: 'Register' }).click();
await page.getByRole('textbox', { name: 'Full name' }).fill('z');
await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
await page.getByRole('textbox', { name: 'Email address' }).fill('z@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('z');
await page.getByRole('textbox', { name: 'Password' }).press('Enter');
await page.getByRole('button', { name: 'Register' }).click();
await page.getByRole('button', { name: 'Register' }).click();
await page.getByText('Order nowMost amazing pizza').click();
await page.locator('body').press('ControlOrMeta+=');
await page.locator('body').press('ControlOrMeta+=');
await expect(page.locator('#navbar-dark')).toContainText('Logout');
await page.getByRole('link', { name: 'z' }).click();
await expect(page.getByRole('link', { name: 'z' })).toBeVisible();
});

test('logged out test', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});


test('login and buy pizza', async ({ page }) => {

await page.goto('/');
await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('z@jwt.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('z');
await page.getByRole('textbox', { name: 'Password' }).press('Enter');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button', { name: 'Order now' }).click();
await page.getByRole('combobox').selectOption('3');
await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
await page.getByText('Selected pizzas:').click();
await expect(page.locator('form')).toContainText('Selected pizzas: 1');
await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
await expect(page.locator('form')).toContainText('Selected pizzas: 2');
await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
await page.getByRole('button', { name: 'Checkout' }).click();
await page.getByRole('navigation', { name: 'Global' }).click();
await expect(page.getByRole('button', { name: 'Pay now' })).toBeVisible();
await page.getByRole('button', { name: 'Pay now' }).click();
await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');

});

test('about page', async ({ page }) => {

await page.goto('http://localhost:5173/');
await page.getByRole('link', { name: 'About' }).click();
await expect(page.getByRole('img').nth(3)).toBeVisible();
await expect(page.getByRole('main')).toContainText('The secret sauce');

});

test('franchise page', async ({ page }) => {

await page.goto('/');
await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
await expect(page.getByRole('main').locator('img')).toBeVisible();
await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
});


test('login as admin', async ({ page }) => {

    // TODO: hardcoded admin user, change to be more robust in future

await page.goto('http://localhost:5173/');
await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('m2mcvalkc8@admin.com');
await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
await page.getByRole('textbox', { name: 'Password' }).fill('toomanysecrets');
await page.getByRole('button', { name: 'Login' }).click();
await expect(page.locator('#navbar-dark')).toContainText('Admin');
await page.getByRole('link', { name: 'Admin' }).click();
await expect(page.getByRole('list')).toContainText('admin-dashboard');
await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();


});