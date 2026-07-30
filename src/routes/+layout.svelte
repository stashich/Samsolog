<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { dev, browser } from '$app/environment';

	let { children } = $props();

	// Initialize Service Worker
	const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
		onRegistered(r) {
			console.log('PWA Service Worker registered successfully:', r);
		},
		onRegisterError(error) {
			console.error('PWA Service Worker registration error:', error);
		}
	});

	function close() {
		needRefresh.set(false);
		offlineReady.set(false);
	}

	// Initialize Eruda in dev mode on mobile or any dev screen
	if (browser && dev) {
		import('eruda').then((eruda) => {
			eruda.default.init();
		}).catch((err) => {
			console.error('Failed to load Eruda:', err);
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Samsolog 3D PWA Game</title>
	<meta name="description" content="A Svelte 5 & Threlte 3D WebGL PWA Game Template" />
	<!-- Viewport fit=cover for PWA mobile gaming look -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

<!-- Standard wrapper using only inline Tailwind 4 CSS classes -->
<div 
	role="presentation"
	oncontextmenu={(e) => e.preventDefault()}
	ondragstart={(e) => e.preventDefault()}
	class="relative min-h-screen bg-zinc-950 text-zinc-100 selection:bg-none overflow-x-hidden font-sans antialiased select-none"
>
	<!-- Ambient Background Glow -->
	<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
		<div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]"></div>
		<div class="absolute right-10 top-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[96px]"></div>
	</div>

	<!-- Main App Content -->
	<main class="relative z-10 min-h-screen flex flex-col">
		{@render children()}
	</main>

	<!-- PWA Notification Popups (Glassmorphism & Micro-animations) -->
	{#if $needRefresh || $offlineReady}
		<div 
			class="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
			role="alert"
		>
			<div class="flex items-start gap-4">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="font-semibold text-zinc-100">
						{#if $offlineReady}
							App is ready to work offline
						{:else}
							New update available!
						{/if}
					</h3>
					<p class="mt-1 text-sm text-zinc-400">
						{#if $offlineReady}
							You can launch this game even without an internet connection.
						{:else}
							A new version of the game is ready. Reload to update.
						{/if}
					</p>
					<div class="mt-4 flex gap-3">
						{#if $needRefresh}
							<button 
								onclick={() => updateServiceWorker()}
								class="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-cyan-400 active:scale-95"
							>
								Update
							</button>
						{/if}
						<button 
							onclick={close}
							class="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 active:scale-95"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
