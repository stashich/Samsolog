<script lang="ts">
	import { T, useTask } from '@threlte/core';

	let {
		lane = 1, // 0 = Left (-2.2), 1 = Center (0), 2 = Right (2.2)
		isJumping = false,
		isSliding = false,
		isShielded = false,
		onJumpEnd = () => {},
		onSlideEnd = () => {}
	} = $props<{
		lane: number;
		isJumping: boolean;
		isSliding: boolean;
		isShielded: boolean;
		onJumpEnd?: () => void;
		onSlideEnd?: () => void;
	}>();

	// Physical X coordinates for lanes
	const lanePositions = [-2.2, 0, 2.2];

	// Motion state
	let currentX = $state(0);
	let currentY = $state(0);
	let vy = $state(0);
	let slideTimer = $state(0);

	// Running animation wiggle angle
	let runCycle = $state(0);

	useTask((delta) => {
		// 1. Smooth Lane Interpolation (Lerp)
		const targetX = lanePositions[lane] ?? 0;
		currentX += (targetX - currentX) * Math.min(delta * 18, 1);

		// 2. Vertical Jump Physics
		if (isJumping) {
			if (currentY === 0 && vy === 0) {
				vy = 12; // Initial jump impulse
			}
			currentY += vy * delta;
			vy -= 32 * delta; // Gravity

			if (currentY <= 0) {
				currentY = 0;
				vy = 0;
				onJumpEnd();
			}
		}

		// 3. Slide Timer
		if (isSliding) {
			slideTimer += delta;
			if (slideTimer > 0.7) {
				slideTimer = 0;
				onSlideEnd();
			}
		}

		// 4. Running Animation Cycle
		runCycle += delta * 12;
	});
</script>

<!-- Player Group Position -->
<T.Group position={[currentX, currentY + (isSliding ? 0.4 : 1.0), 0]}>
	<!-- Body Torso -->
	<T.Mesh
		scale={[isSliding ? 1.1 : 0.8, isSliding ? 0.4 : 1.0, isSliding ? 1.4 : 0.6]}
		castShadow
	>
		<T.BoxGeometry args={[0.8, 1.2, 0.6]} />
		<T.MeshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.2} />
	</T.Mesh>

	<!-- Head -->
	<T.Mesh position={[0, isSliding ? 0.3 : 0.9, 0]} castShadow>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#fcd34d" roughness={0.4} />
	</T.Mesh>

	<!-- Cap / Helmet -->
	<T.Mesh position={[0, isSliding ? 0.55 : 1.15, 0.05]} castShadow>
		<T.BoxGeometry args={[0.45, 0.15, 0.55]} />
		<T.MeshStandardMaterial color="#ec4899" />
	</T.Mesh>

	<!-- Legs (Animated wiggling when running) -->
	{#if !isSliding && !isJumping}
		<T.Mesh position={[-0.25, -0.7, Math.sin(runCycle) * 0.2]}>
			<T.BoxGeometry args={[0.25, 0.6, 0.25]} />
			<T.MeshStandardMaterial color="#1e1b4b" />
		</T.Mesh>
		<T.Mesh position={[0.25, -0.7, -Math.sin(runCycle) * 0.2]}>
			<T.BoxGeometry args={[0.25, 0.6, 0.25]} />
			<T.MeshStandardMaterial color="#1e1b4b" />
		</T.Mesh>
	{/if}

	<!-- Double-Tap Protective Energy Shield Aura -->
	{#if isShielded}
		<T.Mesh rotation.x={Math.PI / 2}>
			<T.TorusGeometry args={[1.2, 0.06, 16, 60]} />
			<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.0} />
		</T.Mesh>
	{/if}
</T.Group>
