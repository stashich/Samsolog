<script lang="ts">
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import { enhance } from '$app/forms';

	// Svelte 5 page props (data loaded from +page.server.ts and form action response)
	let { data, form } = $props();

	// Local gameplay state using Svelte 5 $state rune
	let currentScore = $state(0);
	let chargeMultiplier = $state(1);
	let generatorLevel = $state(1);
	let playerNameInput = $state('');

	// Derived state using Svelte 5 $derived rune
	let upgradeCost = $derived(15 * Math.pow(2, generatorLevel - 1));

	function chargeCore() {
		currentScore += chargeMultiplier;
		
		// Visual effect triggers (vibrancy, particle bursts can be added, but standard transition is sufficient)
		if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
			window.navigator.vibrate(10);
		}
	}

	function buyUpgrade() {
		if (currentScore >= upgradeCost) {
			currentScore -= upgradeCost;
			generatorLevel += 1;
			chargeMultiplier += 1;
		}
	}
</script>

<div class="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full z-10">
	<!-- Left Side: 3D Core Viewport & Clicking Game -->
	<section class="lg:col-span-8 flex flex-col gap-6">
		<!-- Header/Core Info -->
		<header class="flex items-center justify-between rounded-3xl border border-zinc-950/20 bg-zinc-900/40 p-6 backdrop-blur-md">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">Portal Core PWA</h1>
				<p class="text-xs text-zinc-400 mt-1">Svelte 5 + WebGL 3D Interactive Demo</p>
			</div>
			<div class="text-right">
				<span class="text-xs text-zinc-500 uppercase tracking-widest block">Core Energy</span>
				<span class="text-3xl font-black text-cyan-400 tracking-wider transition-all drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
					{currentScore} <span class="text-xs text-zinc-400">EC</span>
				</span>
			</div>
		</header>

		<!-- 3D Canvas Box -->
		<div class="relative h-[350px] md:h-[480px] w-full shrink-0">
			<GameCanvas />
			
			<!-- Floating instructions -->
			<div class="absolute bottom-4 left-4 pointer-events-none bg-zinc-950/70 border border-zinc-900 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[10px] text-zinc-400">
				Drag to orbit camera • Scroll to zoom
			</div>
		</div>

		<!-- Interaction Deck -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Game Charging Trigger Button -->
			<button
				onclick={chargeCore}
				class="group relative flex h-24 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
			>
				<div class="flex h-full w-full items-center justify-center rounded-[22px] bg-zinc-950/90 transition-colors group-hover:bg-zinc-950/40">
					<div class="text-center">
						<span class="block text-xs font-bold uppercase tracking-wider text-cyan-400 group-hover:text-white">Charge Quantum Core</span>
						<span class="text-xs text-zinc-400 group-hover:text-zinc-200">Generate +{chargeMultiplier} Energy per Click</span>
					</div>
				</div>
			</button>

			<!-- Upgrades Shop -->
			<button
				onclick={buyUpgrade}
				disabled={currentScore < upgradeCost}
				class="group flex h-24 items-center justify-between rounded-3xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/60 disabled:opacity-40 disabled:hover:bg-zinc-900/30 disabled:scale-100 active:scale-[0.98]"
			>
				<div class="text-left">
					<span class="block text-xs font-bold uppercase tracking-wider text-indigo-400">Upgrade Core Multiplier</span>
					<span class="text-xs text-zinc-500">Current Level: {generatorLevel}</span>
				</div>
				<div class="text-right">
					<span class="block text-[10px] uppercase text-zinc-400">Cost</span>
					<span class="font-bold text-zinc-100">{upgradeCost} EC</span>
				</div>
			</button>
		</div>
	</section>

	<!-- Right Side: Leaderboard & DB Form -->
	<aside class="lg:col-span-4 flex flex-col gap-6">
		<!-- Score Submission Card -->
		<div class="rounded-3xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-md">
			<h2 class="text-lg font-bold text-white mb-4">Save High Score</h2>
			<p class="text-xs text-zinc-400 mb-6">Connects to PostgreSQL database via Drizzle-ORM server actions.</p>

			<form 
				method="POST" 
				action="?/submitScore" 
				use:enhance={() => {
					return ({ result }) => {
						if (result.type === 'success') {
							// Reset score on successful submission
							currentScore = 0;
							generatorLevel = 1;
							chargeMultiplier = 1;
						}
					};
				}}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="score" value={currentScore} />

				<div class="flex flex-col gap-1.5">
					<label for="playerName" class="text-xs font-semibold text-zinc-400">Player Name</label>
					<input
						type="text"
						id="playerName"
						name="playerName"
						required
						bind:value={playerNameInput}
						placeholder="Enter your alias..."
						class="rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
					/>
				</div>

				<button
					type="submit"
					disabled={currentScore <= 0}
					class="w-full rounded-xl bg-zinc-100 py-3 text-xs font-bold text-zinc-950 transition-colors hover:bg-white active:scale-95 disabled:opacity-30 disabled:hover:bg-zinc-100 disabled:scale-100"
				>
					Submit Score ({currentScore} EC)
				</button>
			</form>

			{#if form?.success === true}
				<div class="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
					✓ Score successfully uploaded to PostgreSQL!
				</div>
			{:else}
				{#if form?.success === false}
					<div class="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
						✗ {form?.error || 'Database submission failed.'}
					</div>
				{/if}
			{/if}
		</div>

		<!-- Leaderboard List Card -->
		<div class="rounded-3xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-md flex-1 flex flex-col">
			<h2 class="text-lg font-bold text-white mb-4">Postgres Leaderboard</h2>

			<div class="flex flex-col gap-2.5 overflow-y-auto flex-1">
				{#each data.scores as scoreEntry, index}
					<div class="flex items-center justify-between rounded-xl bg-zinc-950/40 border border-zinc-900/50 p-4 transition-colors hover:border-zinc-800">
						<div class="flex items-center gap-3">
							<!-- Placement Rank -->
							<span class="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold 
								{index === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : ''} 
								{index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : ''} 
								{index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' : ''} 
								{index > 2 ? 'bg-zinc-900 text-zinc-400' : ''}"
							>
								#{index + 1}
							</span>
							<span class="text-sm font-semibold text-zinc-200">{scoreEntry.playerName}</span>
						</div>
						<span class="text-sm font-black tracking-wider text-cyan-400">{scoreEntry.score} <span class="text-[10px] font-normal text-zinc-500">EC</span></span>
					</div>
				{:else}
					<p class="text-xs text-zinc-500 text-center py-6">No scores registered yet. Be the first!</p>
				{/each}
			</div>
		</div>
	</aside>
</div>
