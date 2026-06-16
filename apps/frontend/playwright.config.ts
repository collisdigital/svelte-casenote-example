import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Playwright E2E configuration.
 *
 * Unless `E2E_BASE_URL` points at an already-running deployment, Playwright
 * spins up the whole stack itself before the tests run:
 *   1. the mock Case Note API (the stub backend) on an isolated, freshly
 *      migrated + seeded SQLite database so runs are deterministic and never
 *      touch dev data;
 *   2. the SvelteKit app, pointed at that mock API.
 */

const API_PORT = 4000;
const APP_PORT = 5173;

// Dedicated throwaway database for E2E so seeded state is predictable and
// isolated from local development.
const E2E_DB_PATH = join(tmpdir(), 'casenote-e2e.sqlite');

export default defineConfig({
	testDir: 'tests/e2e',
	timeout: 30_000,
	fullyParallel: false,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${APP_PORT}`,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: process.env.E2E_BASE_URL
		? undefined
		: [
				{
					// Reset + seed the isolated DB, then start the stub API.
					command:
						'pnpm --filter @casenote/mock-api db:reset && pnpm --filter @casenote/mock-api dev',
					url: `http://localhost:${API_PORT}/health`,
					reuseExistingServer: !process.env.CI,
					timeout: 60_000,
					env: {
						PORT: String(API_PORT),
						HOST: '0.0.0.0',
						DATABASE_PATH: E2E_DB_PATH,
						LOG_LEVEL: 'warn'
					}
				},
				{
					command: 'pnpm dev',
					url: `http://localhost:${APP_PORT}`,
					reuseExistingServer: !process.env.CI,
					timeout: 60_000,
					env: {
						API_BASE_URL: `http://localhost:${API_PORT}`
					}
				}
			]
});

