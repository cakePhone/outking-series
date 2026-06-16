import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			// better-auth/svelte deep-imports this but @better-auth/core
			// doesn't expose it in its exports map.
			'@better-auth/core/utils/string': path.resolve(
				__dirname,
				'node_modules/@better-auth/core/dist/utils/string.mjs'
			)
		}
	}
});
