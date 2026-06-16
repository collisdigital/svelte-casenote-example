/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svelteTesting()],
	server: {
		// Bind explicitly so port-forwarding interfaces (Codespaces / containers) work.
		host: '0.0.0.0',
		port: 5173,
		strictPort: false
	},
	preview: {
		host: '0.0.0.0',
		port: 4173
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Exclude Playwright E2E specs from the Vitest run.
		exclude: ['tests/e2e/**', 'node_modules/**']
	}
});
