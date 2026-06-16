import { expect, test } from '@playwright/test';

/**
 * End-to-end workflow verifying integration with the running mock API.
 * Prerequisite: the mock API must be running (e.g. `pnpm dev:api` or
 * docker-compose) and seeded.
 */

test('dashboard lists seeded case notes', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Tracked case notes' })).toBeVisible();
	// A seeded tracking ID should be present.
	await expect(page.getByText('CN-100482')).toBeVisible();
});

test('register a new case note then see it on the dashboard', async ({ page }) => {
	const trackingId = `CN-E2E-${Date.now()}`;

	await page.goto('/new');
	await page.getByLabel('Patient NHS number').fill('999 888 7777');
	await page.getByLabel('Tracking ID').fill(trackingId);
	await page.getByLabel('Current location').selectOption('WARD2');
	await page.getByRole('button', { name: 'Register case note' }).click();

	await expect(page).toHaveURL('/');
	await expect(page.getByText(trackingId)).toBeVisible();
});

test('move a case note to a new location', async ({ page }) => {
	await page.goto('/');
	// Open the transfer form for the first record.
	await page.getByRole('link', { name: 'Move location' }).first().click();
	await expect(page.getByRole('heading', { name: 'Move case note' })).toBeVisible();

	await page.getByLabel('Destination location').selectOption('ARCHIVE');
	await page.getByRole('button', { name: 'Move location' }).click();

	await expect(page).toHaveURL('/');
});

test('deleting a case note requires confirmation in a dialog', async ({ page }) => {
	await page.goto('/');

	const rows = page.getByRole('row');
	// Header row + at least one seeded data row.
	const initialCount = await rows.count();
	expect(initialCount).toBeGreaterThan(1);

	const firstRow = rows.nth(1);
	const trackingId = (await firstRow.getByRole('cell').nth(1).textContent())?.trim() ?? '';
	const dialog = page.getByRole('dialog');

	// Open the modal. Retry the click so an early (pre-hydration) click that
	// lands before Svelte attaches the handler doesn't flake the test.
	await expect(async () => {
		await firstRow.getByRole('button', { name: 'Delete' }).click();
		await expect(dialog).toBeVisible({ timeout: 1000 });
	}).toPass();

	// It's a real modal dialog (not window.confirm) naming the record.
	if (trackingId) {
		await expect(dialog).toContainText(trackingId);
	}

	// Cancelling leaves every row in place.
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).toBeHidden();
	await expect(rows).toHaveCount(initialCount);

	// Confirming removes exactly one row.
	await firstRow.getByRole('button', { name: 'Delete' }).click();
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete case note' }).click();
	await expect(dialog).toBeHidden();
	await expect(rows).toHaveCount(initialCount - 1);
});
