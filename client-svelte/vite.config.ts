import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
	css: {
		postcss: {
			plugins: [
					tailwindcss,
					autoprefixer
			]
		}
	},
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['typesafe-i18n']
	}
});
