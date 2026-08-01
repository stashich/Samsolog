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

	// Power-up States
	let isMagnetActive = $state(false);
	let magnetTimer = $state(0);
	let isTurboActive = $state(false);
	let turboTimer = $state(0);

	let score = $state(0);
	let samsasCollected = $state(0);
	let coinsCollected = $state(0);
	let gameSpeed = $state(26);
	let playerNameInput = $state('');

	// Offline LocalStorage Persistence States
	let bestScore = $state(0);
	let isNewHighscore = $state(false);
	let totalCoinsSaved = $state(0);

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
		isMagnetActive = false;
		magnetTimer = 0;
		isTurboActive = false;
		turboTimer = 0;
		isNewHighscore = false;
	}

	function triggerGameOver() {
		gameState = 'GAME_OVER';
		soundFx.playCrash();

		// Check and save Personal Best Highscore locally
		if (score > bestScore) {
			bestScore = score;
			isNewHighscore = true;
			if (typeof window !== 'undefined') {
				localStorage.setItem('astana_runner_best_score', score.toString());
			}
		}

		// Update total accumulated coins in LocalStorage
		totalCoinsSaved += coinsCollected;
		if (typeof window !== 'undefined') {
			localStorage.setItem('astana_runner_total_coins', totalCoinsSaved.toString());
			if (playerNameInput) {
				localStorage.setItem('astana_runner_player_name', playerNameInput);
			}
		}

		if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
			window.navigator.vibrate([100, 50, 100]);
		}
	}

	// Main Game Logic Loop
	function updateGameLoop(delta: number) {
		if (gameState !== 'PLAYING') return;

		// Increase score & speed (bonus speed when Turbo is active)
		const activeSpeed = isTurboActive ? gameSpeed * 1.6 : gameSpeed;
		score += Math.floor(delta * activeSpeed);
		gameSpeed += delta * 0.4;

		// Manage shield countdown
		if (isShielded) {
			shieldTimer -= delta;
			if (shieldTimer <= 0) {
				isShielded = false;
				shieldTimer = 0;
			}
		}

		// Manage Magnet countdown
		if (isMagnetActive) {
			magnetTimer -= delta;
			if (magnetTimer <= 0) {
				isMagnetActive = false;
				magnetTimer = 0;
			}
		}

		// Manage Turbo countdown
		if (isTurboActive) {
			turboTimer -= delta;
			if (turboTimer <= 0) {
				isTurboActive = false;
				turboTimer = 0;
			}
		}

		// Magnet Effect: Pull nearby coins & Samsas towards player's lane
		if (isMagnetActive) {
			for (const obs of obstacles) {
				if ((obs.type === 'COIN' || obs.type === 'SAMSA') && obs.z > -40 && obs.z < 10) {
					obs.lane = playerLane;
				}
			}
		}

		// Spawn new obstacles & powerups
		spawnTimer += delta * (gameSpeed * 0.04);
		if (spawnTimer > 1.8) {
			spawnTimer = 0;
			const types: ObstacleType[] = ['TATESHKA', 'SAMSA', 'BARRIER', 'COIN', 'COIN', 'MAGNET', 'TURBO'];
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
					samsasCollected += 1;
					score += 250;
					soundFx.playPickup();
					obs.z = 999;
				} else if (obs.type === 'COIN') {
					coinsCollected += 1;
					score += 100;
					soundFx.playPickup();
					obs.z = 999;
				} else if (obs.type === 'MAGNET') {
					isMagnetActive = true;
					magnetTimer = 7.0;
					soundFx.playShield();
					obs.z = 999;
				} else if (obs.type === 'TURBO') {
					isTurboActive = true;
					turboTimer = 4.0;
					soundFx.playShield();
					obs.z = 999;
				} else if (isTurboActive) {
					// Invincible during Turbo Flight!
					obs.z = 999;
				} else if (obs.type === 'BARRIER' && (isJumping || isSliding)) {
					// Cleared barrier via jump or slide
				} else {
					// Hit obstacle
					if (isShielded) {
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
		// Load LocalStorage Highscores and Player Name on mount
		if (typeof window !== 'undefined') {
			const savedBest = localStorage.getItem('astana_runner_best_score');
			if (savedBest) bestScore = parseInt(savedBest, 10);

			const savedCoins = localStorage.getItem('astana_runner_total_coins');
			if (savedCoins) totalCoinsSaved = parseInt(savedCoins, 10);

			const savedName = localStorage.getItem('astana_runner_player_name');
			if (savedName) playerNameInput = savedName;
		}

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
		<!-- Camera setup for Subway Surfers perspective (elevated & tilted down for full character visibility) -->
		<T.PerspectiveCamera 
			makeDefault 
			position={[0, isTurboActive ? 7.5 : 5.4, isTurboActive ? 10.5 : 8.2]} 
			rotation.x={-0.18}
			fov={55} 
		/>

		<RoadEnvironment speed={gameState === 'PLAYING' ? (isTurboActive ? gameSpeed * 1.6 : gameSpeed) : 0} />

		<PlayerCharacter
			lane={playerLane}
			isJumping={isJumping || isTurboActive}
			{isSliding}
			isShielded={isShielded || isMagnetActive || isTurboActive}
			onJumpEnd={() => (isJumping = false)}
			onSlideEnd={() => (isSliding = false)}
		/>

		<Obstacles
			{obstacles}
			speed={gameState === 'PLAYING' ? (isTurboActive ? gameSpeed * 1.6 : gameSpeed) : 0}
			onCollision={() => {}}
		/>

		<GameTaskRunner onUpdate={updateGameLoop} />
	</Canvas>

	<!-- HUD Header (Score, Samsas, Coins & Active Powerups) -->
	<div class="pointer-events-none absolute top-4 left-4 right-4 flex items-center justify-between z-20">
		<div class="flex items-center gap-2">
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md">
				<span class="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Score</span>
				<span class="text-base font-black tracking-wider text-cyan-400">{score}</span>
			</div>
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md">
				<span class="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Samsas 🥐</span>
				<span class="text-base font-black tracking-wider text-amber-400">{samsasCollected}</span>
			</div>
			<div class="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 backdrop-blur-md">
				<span class="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Coins 🪙</span>
				<span class="text-base font-black tracking-wider text-yellow-400">{coinsCollected}</span>
			</div>
		</div>

		<!-- Powerup Status Badges -->
		<div class="flex gap-2">
			{#if isTurboActive}
				<div class="rounded-2xl border border-sky-400/50 bg-sky-950/80 px-3 py-1.5 text-xs font-bold text-sky-300 backdrop-blur-md animate-pulse">
					🚀 TURBO ({turboTimer.toFixed(1)}s)
				</div>
			{/if}

			{#if isMagnetActive}
				<div class="rounded-2xl border border-red-500/50 bg-red-950/80 px-3 py-1.5 text-xs font-bold text-red-300 backdrop-blur-md animate-pulse">
					🧲 MAGNET ({magnetTimer.toFixed(1)}s)
				</div>
			{/if}

			{#if isShielded}
				<div class="rounded-2xl border border-cyan-500/50 bg-cyan-950/80 px-3 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md animate-pulse">
					🛡️ SHIELD ({shieldTimer.toFixed(1)}s)
				</div>
			{/if}
		</div>
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
				<h1 class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400 tracking-tight mb-1">
					АСТАНА РАHЕР 3D
				</h1>
				<p class="text-xs text-zinc-400 mb-4">Проспект Мангилик Ел • Свайпай и Уворачивайся!</p>

				<!-- Personal Best Banner -->
				{#if bestScore > 0}
					<div class="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
						🏆 Личный Рекорд: {bestScore} pts
					</div>
				{/if}

				<!-- Controls & Items Guide -->
				<div class="grid grid-cols-2 gap-3 mb-6 text-left text-xs bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
					<div>⬆️ <b>Свайп Вверх:</b> Прыжок</div>
					<div>⬇️ <b>Свайп Вниз:</b> Подкат</div>
					<div>⬅️➡️ <b>Свайп Вбок:</b> Полоса</div>
					<div>👆 <b>Двойной Тап:</b> Щит</div>
					<div>🧲 <b>Магнит:</b> Тянет самсу</div>
					<div>🚀 <b>Турбо:</b> Полет и скорость</div>
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
				{#if isNewHighscore}
					<div class="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-1.5 text-xs font-black text-emerald-300 animate-bounce">
						🎉 НОВЫЙ РЕКОРД! 🎉
					</div>
				{/if}

				<h2 class="text-3xl font-black text-rose-500 mb-1">ЗАБЕГ ОКОНЧЕН!</h2>
				<p class="text-xs text-zinc-400 mb-4">Вы столкнулись с препятствием на Мангилик Ел</p>

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
					<div>
						<span class="text-[10px] uppercase text-zinc-500 block">Монеты 🪙</span>
						<span class="text-2xl font-black text-yellow-400">{coinsCollected}</span>
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
