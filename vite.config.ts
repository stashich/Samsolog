import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),

			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Samsolog 3D PWA Game',
				short_name: 'Samsolog3D',
				description: 'WebGL 3D game test project in Svelte 5',
				theme_color: '#09090b',
				background_color: '#09090b',
				display: 'standalone',
				orientation: 'landscape',
				start_url: '/',
				icons: [
					{
						src: 'icon-192x192.jpg',
						sizes: '192x192',
						type: 'image/jpeg'
					},
					{
						src: 'icon-512x512.jpg',
						sizes: '512x512',
						type: 'image/jpeg'
					},
					{
						src: 'icon-512x512.jpg',
						sizes: '512x512',
						type: 'image/jpeg',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}']
			}
		})
	],
	ssr: {
		noExternal: ['three', '@threlte/core', '@threlte/extras']
	}
});
