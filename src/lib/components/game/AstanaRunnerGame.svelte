<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { onMount } from 'svelte';
	import RoadEnvironment from './RoadEnvironment.svelte';
	import PlayerCharacter from './PlayerCharacter.svelte';
	import Obstacles, { type ObstacleData, type ObstacleType } from './Obstacles.svelte';
	import GameTaskRunner from './GameTaskRunner.svelte';
	import { createGestureListener, type GameAction } from '$lib/utils/gestures';
	import { soundFx } from '$lib/utils/audio';
	import { enhance } from '$app/forms';

	let { scores = [], form = null } = $props<{
		scores?: Array<{ id: number; playerName: string; score: number; createdAt: Date }>;
		form?: any;
	}>();

	// Game States
	type GameState = 'START' | 'PLAYING' | 'GAME_OVER';
	let gameState = $state<GameState>('START');

	// Game Parameters
	let playerLane = $state(1); // 0 = Left (-2.2), 1 = Center (0), 2 = Right (2.2)
	let isJumping = $state(false);
	let isSliding = $state(false);
	let isShielded = $state(false);
	let shieldTimer = $state(0);

	let score = $state(0);
	let samsasCollected = $state(0);
	let coinsCollected = $state(0);
	let gameSpeed = $state(26);
	let playerNameInput = $state('');

	// Obstacles List
	let obstacles = $state<ObstacleData[]>([]);
	let nextObstacleId = 1;
	let spawnTimer = 0;

	// Element reference for gesture registration
	let gameContainerEl = $state<HTMLDivElement | null>(null);

	// Action Handler for Swipes and Double Tap
	function handleGameAction(action: GameAction) {
		if (gameState !== 'PLAYING') return;

		switch (action) {
			case 'LEFT':
				if (playerLane > 0) playerLane -= 1;
				break;
			case 'RIGHT':
				if (playerLane < 2) playerLane += 1;
				break;
			case 'JUMP':
				if (!isJumping && !isSliding) {
					isJumping = true;
					soundFx.playJump();
				}
				break;
			case 'SLIDE':
				if (!isSliding) {
					isSliding = true;
					isJumping = false;
					soundFx.playSlide();
				}
				break;
			case 'DOUBLE_TAP':
				// Activate Energy Shield Powerup
				if (!isShielded) {
					isShielded = true;
					shieldTimer = 5.0; // Shield lasts 5 seconds
					soundFx.playShield();
				}
				break;
		}
	}

	function startGame() {
		gameState = 'PLAYING';
		playerLane = 1;
		score = 0;
		samsasCollected = 0;
		coinsCollected = 0;
		gameSpeed = 26;
		obstacles = [];
		isJumping = false;
		isSliding = false;
		isShielded = false;
		shieldTimer = 0;
	}

	function triggerGameOver() {
		gameState = 'GAME_OVER';
		soundFx.playCrash();
		if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
			window.navigator.vibrate([100, 50, 100]);
		}
	}

	// Main Game Logic Loop
	function updateGameLoop(delta: number) {
		if (gameState !== 'PLAYING') return;

		// Increase score & speed
		score += Math.floor(delta * gameSpeed);
		gameSpeed += delta * 0.4;

		// Manage shield countdown
		if (isShielded) {
			shieldTimer -= delta;
			if (shieldTimer <= 0) {
				isShielded = false;
				shieldTimer = 0;
			}
		}

		// Spawn new obstacles & collectibles (Tateshka, Samsa, Barrier, Coin)
		spawnTimer += delta * (gameSpeed * 0.04);
		if (spawnTimer > 1.8) {
			spawnTimer = 0;
			const types: ObstacleType[] = ['TATESHKA', 'SAMSA', 'BARRIER', 'COIN', 'COIN'];
			const randomType = types[Math.floor(Math.random() * types.length)];
			const randomLane = Math.floor(Math.random() * 3);

			obstacles = [
				...obstacles.filter((o) => o.z < 10), // Remove past obstacles
				{
					id: nextObstacleId++,
					type: randomType,
					lane: randomLane,
					z: -90
				}
			];
		}

		// Collision Detection
		const lanePositions = [-2.2, 0, 2.2];
		const playerX = lanePositions[playerLane];

		for (const obs of obstacles) {
			const obsX = obs.type === 'TATESHKA' ? (obs.crossX ?? lanePositions[obs.lane]) : lanePositions[obs.lane];
			const distZ = Math.abs(obs.z - 0); // Player is at z = 0
			const distX = Math.abs(obsX - playerX);

			// Collision threshold
			if (distZ < 1.2 && distX < 1.1) {
				if (obs.type === 'SAMSA') {
					// Collect Samsa bonus points!
					samsasCollected += 1;
					score += 250;
					soundFx.playPickup();
					obs.z = 999; // Despawn
				} else if (obs.type === 'COIN') {
					// Collect Gold Coin!
					coinsCollected += 1;
					score += 100;
					soundFx.playPickup();
					obs.z = 999; // Despawn
				} else if (obs.type === 'BARRIER' && (isJumping || isSliding)) {
					// Cleared barrier via jump or slide
				} else {
					// Hit obstacle
					if (isShielded) {
						// Shield absorbs hit
						isShielded = false;
						obs.z = 999;
						soundFx.playShield();
					} else {
						triggerGameOver();
						break;
					}
				}
			}
		}
	}

	onMount(() => {
		if (gameContainerEl) {
			const listener = createGestureListener(gameContainerEl, {
				onAction: handleGameAction
			});
			return () => listener.destroy();
		}
	});
</script>

<!-- Outer Fullscreen Game Viewport -->
<div 
	bind:this={gameContainerEl}
	class="relative h-screen w-screen overflow-hidden bg-zinc-950 select-none touch-none font-sans"
>
	<!-- 3D Canvas Viewport -->
	<Canvas>
		<!-- Camera setup for Subway Surfers perspective -->
		<T.PerspectiveCamera makeDefault position={[0, 4.5, 6]} fov={55} />

		<RoadEnvironment speed={gameState === 'PLAYING' ? gameSpeed : 0} />

		<PlayerCharacter
			lane={playerLane}
			{isJumping}
			{isSliding}
			{isShielded}
			onJumpEnd={() => (isJumping = false)}
			onSlideEnd={() => (isSliding = false)}
		/>

		<Obstacles
			{obstacles}
			speed={gameState === 'PLAYING' ? gameSpeed : 0}
			onCollision={() => {}}
		/>

		<GameTaskRunner onUpdate={updateGameLoop} />
	</Canvas>

	<!-- HUD Header (Score, Samsas & Coins Count) -->
	<div class="pointer-events-none absolute top-4 left-4 right-4 flex items-center justify-between z-20">
		<div class="flex items-center gap-2.5">
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 backdrop-blur-md">
				<span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Score</span>
				<span class="text-lg font-black tracking-wider text-cyan-400">{score}</span>
			</div>
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 backdrop-blur-md">
				<span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Samsas 🥐</span>
				<span class="text-lg font-black tracking-wider text-amber-400">{samsasCollected}</span>
			</div>
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 backdrop-blur-md">
				<span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Coins 🪙</span>
				<span class="text-lg font-black tracking-wider text-yellow-400">{coinsCollected}</span>
			</div>
		</div>

		{#if isShielded}
			<div class="rounded-2xl border border-cyan-500/50 bg-cyan-950/80 px-4 py-2 text-xs font-bold text-cyan-300 backdrop-blur-md animate-pulse">
				🛡️ SHIELD ACTIVE ({shieldTimer.toFixed(1)}s)
			</div>
		{/if}
	</div>

	<!-- On-screen Controls Overlay for Touch / Desktop -->
	{#if gameState === 'PLAYING'}
		<div class="absolute bottom-6 left-4 right-4 z-20 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
			<div class="flex gap-2">
				<button onclick={() => handleGameAction('LEFT')} class="h-12 w-12 rounded-xl bg-zinc-900/80 text-white font-bold border border-zinc-700 active:scale-95">←</button>
				<button onclick={() => handleGameAction('RIGHT')} class="h-12 w-12 rounded-xl bg-zinc-900/80 text-white font-bold border border-zinc-700 active:scale-95">→</button>
			</div>
			<div class="flex gap-2">
				<button onclick={() => handleGameAction('JUMP')} class="h-12 w-12 rounded-xl bg-zinc-900/80 text-white font-bold border border-zinc-700 active:scale-95">↑</button>
				<button onclick={() => handleGameAction('SLIDE')} class="h-12 w-12 rounded-xl bg-zinc-900/80 text-white font-bold border border-zinc-700 active:scale-95">↓</button>
				<button onclick={() => handleGameAction('DOUBLE_TAP')} class="h-12 px-3 rounded-xl bg-cyan-900/80 text-cyan-300 font-bold border border-cyan-700 text-xs active:scale-95">🛡️ Shield</button>
			</div>
		</div>
	{/if}

	<!-- START OVERLAY -->
	{#if gameState === 'START'}
		<div class="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/85 p-6 backdrop-blur-md">
			<div class="max-w-md w-full text-center">
				<h1 class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400 tracking-tight mb-2">
					АСТАНА РАHЕР 3D
				</h1>
				<p class="text-xs text-zinc-400 mb-6">Проспект Мангилик Ел • Свайпай и Уворачивайся!</p>

				<!-- Controls Guide -->
				<div class="grid grid-cols-2 gap-3 mb-8 text-left text-xs bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
					<div>⬆️ <b>Свайп Вверх:</b> Прыжок</div>
					<div>⬇️ <b>Свайп Вниз:</b> Подкат</div>
					<div>⬅️➡️ <b>Свайп Вбок:</b> Смена полосы</div>
					<div>👆 <b>Двойной Тап:</b> Супер-Щит</div>
				</div>

				<button
					onclick={startGame}
					class="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-4 text-base font-black uppercase tracking-wider text-zinc-950 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95"
				>
					Начать Забег! 🏃‍♂️
				</button>
			</div>
		</div>
	{/if}

	<!-- GAME OVER OVERLAY -->
	{#if gameState === 'GAME_OVER'}
		<div class="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/90 p-6 backdrop-blur-md">
			<div class="max-w-md w-full text-center">
				<h2 class="text-3xl font-black text-rose-500 mb-1">ЗАБЕГ ОКОНЧЕН!</h2>
				<p class="text-xs text-zinc-400 mb-6">Вы столкнулись с препятствием на Мангилик Ел</p>

				<!-- Score Summary -->
				<div class="flex justify-around bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl mb-6">
					<div>
						<span class="text-[10px] uppercase text-zinc-500 block">Дистанция</span>
						<span class="text-2xl font-black text-cyan-400">{score}</span>
					</div>
					<div>
						<span class="text-[10px] uppercase text-zinc-500 block">Самса 🥐</span>
						<span class="text-2xl font-black text-amber-400">{samsasCollected}</span>
					</div>
				</div>

				<!-- Save Score to PostgreSQL Form -->
				<form
					method="POST"
					action="?/submitScore"
					use:enhance={() => {
						return ({ result }) => {
							if (result.type === 'success') {
								startGame();
							}
						};
					}}
					class="flex flex-col gap-3 mb-4"
				>
					<input type="hidden" name="score" value={score} />
					<input
						type="text"
						name="playerName"
						required
						bind:value={playerNameInput}
						placeholder="Введите ваше имя..."
						class="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
					/>
					<button
						type="submit"
						class="w-full rounded-xl bg-cyan-500 py-3 text-xs font-bold text-zinc-950 hover:bg-cyan-400 active:scale-95"
					>
						Сохранить рекорд в Таблицу Лидеров
					</button>
				</form>

				<button
					onclick={startGame}
					class="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-800 active:scale-95"
				>
					Играть Снова
				</button>
			</div>
		</div>
	{/if}
</div>
