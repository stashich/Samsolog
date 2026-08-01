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

	// Rotational leaning & animation angles
	let leanZ = $state(0);
	let jumpRotationX = $state(0);
	let runCycle = $state(0);

	useTask((delta) => {
		// 1. Smooth Lane Interpolation & Lean Angle
		const targetX = lanePositions[lane] ?? 0;
		const diffX = targetX - currentX;
		currentX += diffX * Math.min(delta * 18, 1);
		
		// Lean character into the direction of lane switch
		leanZ = -diffX * 0.15;

		// 2. Vertical Jump Physics & Flip Animation
		if (isJumping) {
			if (currentY === 0 && vy === 0) {
				vy = 13; // Jump impulse
			}
			currentY += vy * delta;
			vy -= 34 * delta; // Gravity

			// Forward flip rotation during jump
			jumpRotationX += delta * 7;

			if (currentY <= 0) {
				currentY = 0;
				vy = 0;
				jumpRotationX = 0;
				onJumpEnd();
			}
		}

		// 3. Slide Timer & Crouch
		if (isSliding) {
			slideTimer += delta;
			if (slideTimer > 0.7) {
				slideTimer = 0;
				onSlideEnd();
			}
		}

		// 4. Running Animation Cycle
		runCycle += delta * 14;
	});
</script>

<!-- Player Group Position & Leaning Rotations -->
<T.Group 
	position={[currentX, currentY + (isSliding ? 0.35 : 0.95), 0]}
	rotation.y={Math.PI}
	rotation.z={leanZ}
	rotation.x={isJumping ? -jumpRotationX : (isSliding ? -0.4 : 0)}
>
	<!-- Torso / Kazakh Flag Blue Runner Jacket -->
	<T.Mesh
		scale={[isSliding ? 1.1 : 0.85, isSliding ? 0.45 : 1.0, isSliding ? 1.4 : 0.65]}
		castShadow
	>
		<T.BoxGeometry args={[0.8, 1.2, 0.6]} />
		<T.MeshStandardMaterial color="#00afec" roughness={0.3} metalness={0.2} />
	</T.Mesh>

	<!-- Golden Sun Badge on Chest -->
	<T.Mesh position={[0, isSliding ? 0.2 : 0.2, 0.35]} scale={[0.3, 0.3, 0.05]}>
		<T.CylinderGeometry args={[0.4, 0.4, 0.1]} />
		<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={0.6} />
	</T.Mesh>

	<!-- Head & Stylized Visor -->
	<T.Mesh position={[0, isSliding ? 0.3 : 0.9, 0]} castShadow>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#fde047" roughness={0.4} />
	</T.Mesh>

	<!-- Cap / Visor -->
	<T.Mesh position={[0, isSliding ? 0.55 : 1.15, 0.1]} castShadow>
		<T.BoxGeometry args={[0.5, 0.12, 0.6]} />
		<T.MeshStandardMaterial color="#ec4899" />
	</T.Mesh>

	<!-- Animated Arms (Swinging while running) -->
	{#if !isSliding}
		<T.Mesh position={[-0.55, 0.1, Math.sin(runCycle) * 0.3]} rotation.x={Math.sin(runCycle) * 0.4}>
			<T.BoxGeometry args={[0.2, 0.7, 0.2]} />
			<T.MeshStandardMaterial color="#00afec" />
		</T.Mesh>
		<T.Mesh position={[0.55, 0.1, -Math.sin(runCycle) * 0.3]} rotation.x={-Math.sin(runCycle) * 0.4}>
			<T.BoxGeometry args={[0.2, 0.7, 0.2]} />
			<T.MeshStandardMaterial color="#00afec" />
		</T.Mesh>
	{/if}

	<!-- Animated Legs (Swinging sneakers) -->
	{#if !isSliding && !isJumping}
		<T.Group position={[-0.25, -0.75, Math.sin(runCycle) * 0.25]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[0.25, 0.65, 0.25]} />
				<T.MeshStandardMaterial color="#1e1b4b" />
			</T.Mesh>
			<!-- White Sneaker -->
			<T.Mesh position={[0, -0.35, 0.1]}>
				<T.BoxGeometry args={[0.28, 0.18, 0.45]} />
				<T.MeshStandardMaterial color="#ffffff" />
			</T.Mesh>
		</T.Group>

		<T.Group position={[0.25, -0.75, -Math.sin(runCycle) * 0.25]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[0.25, 0.65, 0.25]} />
				<T.MeshStandardMaterial color="#1e1b4b" />
			</T.Mesh>
			<!-- White Sneaker -->
			<T.Mesh position={[0, -0.35, 0.1]}>
				<T.BoxGeometry args={[0.28, 0.18, 0.45]} />
				<T.MeshStandardMaterial color="#ffffff" />
			</T.Mesh>
		</T.Group>
	{/if}

	<!-- Double-Tap Energy Shield Ring & Glow Shield Sphere -->
	{#if isShielded}
		<T.Mesh rotation.x={Math.PI / 2}>
			<T.TorusGeometry args={[1.35, 0.08, 16, 60]} />
			<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.5} />
		</T.Mesh>
		<T.Mesh>
			<T.SphereGeometry args={[1.4, 16, 16]} />
			<T.MeshStandardMaterial color="#38bdf8" transparent opacity={0.25} emissive="#0284c7" emissiveIntensity={0.8} />
		</T.Mesh>
	{/if}
</T.Group>
