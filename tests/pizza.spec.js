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