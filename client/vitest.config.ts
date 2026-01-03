/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	resolve: {
		alias: {
			'$app/stores': path.resolve(__dirname, './src/test/mocks/$app/stores.ts'),
			'$app/navigation': path.resolve(__dirname, './src/test/mocks/$app/navigation.ts'),
			'$app/environment': path.resolve(__dirname, './src/test/mocks/$app/environment.ts')
		}
	},
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
		setupFiles: ['./src/test/setup.ts']
	}
});
