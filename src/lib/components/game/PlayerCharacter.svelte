<script lang="ts">
	import { T, useTask } from '@threlte/core';

	let {
		lane = 1, // 0 = Left (-2.2), 1 = Center (0), 2 = Right (2.2)
		isJumping = false,
		isSliding = false,
		isShielded = false,
		isTurboActive = false,
		onJumpEnd = () => {},
		onSlideEnd = () => {}
	} = $props<{
		lane: number;
		isJumping: boolean;
		isSliding: boolean;
		isShielded: boolean;
		isTurboActive?: boolean;
		onJumpEnd?: () => void;
		onSlideEnd?: () => void;
	}>();

	// Physical X coordinates for lanes
	const lanePositions = [-2.2, 0, 2.2];

	// Motion state
	let currentX = $state(0);
	let baseY = $state(0); // Height from Turbo flight
	let jumpY = $state(0); // Height from user Jump impulse
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

		// 2. Smooth Turbo Flight Height Lerp
		const targetBaseY = isTurboActive ? 2.2 : 0;
		baseY += (targetBaseY - baseY) * Math.min(delta * 8, 1);

		// 3. Vertical Jump Physics & Flip Animation
		if (isJumping) {
			if (jumpY === 0 && vy === 0) {
				vy = 13; // Jump impulse
			}
			jumpY += vy * delta;
			vy -= 34 * delta; // Gravity

			jumpRotationX += delta * 7;

			if (jumpY <= 0) {
				jumpY = 0;
				vy = 0;
				jumpRotationX = 0;
				onJumpEnd();
			}
		}

		// 4. Slide Timer & Crouch
		if (isSliding) {
			slideTimer += delta;
			if (slideTimer > 0.7) {
				slideTimer = 0;
				onSlideEnd();
			}
		}

		// 5. Running Animation Cycle
		runCycle += delta * 14;
	});
</script>

<!-- Soft Ground Shadow Disk (Stays directly under runner on road) -->
<T.Mesh position={[currentX, 0.02, 0]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[0.65, 16]} />
	<T.MeshBasicMaterial color="#000000" transparent opacity={0.5} />
</T.Mesh>

<!-- Player Group Position & Leaning Rotations -->
<T.Group 
	position={[currentX, baseY + jumpY + (isSliding ? 0.35 : 0.95), 0]}
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

	<!-- Kazakh Gold Crest Emblem on Back/Chest -->
	<T.Mesh position={[0, 0.1, -0.32]}>
		<T.CylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
		<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={1.0} />
	</T.Mesh>

	<!-- Gold Trim Jacket Zipper Strip -->
	<T.Mesh position={[0, 0, 0.32]}>
		<T.BoxGeometry args={[0.08, 1.1, 0.04]} />
		<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={0.8} />
	</T.Mesh>

	<!-- Animated Running Arms -->
	{#if !isSliding}
		<!-- Left Arm -->
		<T.Mesh position={[-0.52, 0.1, -Math.sin(runCycle) * 0.2]} rotation.x={-Math.sin(runCycle) * 0.7} castShadow>
			<T.BoxGeometry args={[0.22, 0.7, 0.22]} />
			<T.MeshStandardMaterial color="#00afec" />
		</T.Mesh>
		<!-- Right Arm -->
		<T.Mesh position={[0.52, 0.1, Math.sin(runCycle) * 0.2]} rotation.x={Math.sin(runCycle) * 0.7} castShadow>
			<T.BoxGeometry args={[0.22, 0.7, 0.22]} />
			<T.MeshStandardMaterial color="#00afec" />
		</T.Mesh>
	{/if}

	<!-- Head & Stylized Astana Cap -->
	<T.Mesh position={[0, isSliding ? 0.4 : 0.85, 0]} castShadow>
		<T.SphereGeometry args={[0.34]} />
		<T.MeshStandardMaterial color="#fcd34d" roughness={0.3} />
	</T.Mesh>

	<!-- Cap Peak / Visor facing forward (-Z) -->
	<T.Mesh position={[0, isSliding ? 0.55 : 1.02, -0.2]}>
		<T.BoxGeometry args={[0.4, 0.1, 0.42]} />
		<T.MeshStandardMaterial color="#ec4899" />
	</T.Mesh>

	<!-- Animated Running Legs & Glowing Sneakers -->
	{#if !isSliding}
		<!-- Left Leg -->
		<T.Mesh
			position={[-0.22, -0.65, Math.sin(runCycle) * 0.25]}
			rotation.x={Math.sin(runCycle) * 0.6}
			castShadow
		>
			<T.BoxGeometry args={[0.26, 0.65, 0.28]} />
			<T.MeshStandardMaterial color="#0f172a" />
		</T.Mesh>

		<!-- Right Leg -->
		<T.Mesh
			position={[0.22, -0.65, -Math.sin(runCycle) * 0.25]}
			rotation.x={-Math.sin(runCycle) * 0.6}
			castShadow
		>
			<T.BoxGeometry args={[0.26, 0.65, 0.28]} />
			<T.MeshStandardMaterial color="#0f172a" />
		</T.Mesh>

		<!-- Left Sneaker with Neon Blue Sole -->
		<T.Group position={[-0.22, -0.95, Math.sin(runCycle) * 0.25 - 0.08]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[0.28, 0.18, 0.42]} />
				<T.MeshStandardMaterial color="#ffffff" />
			</T.Mesh>
			<T.Mesh position={[0, -0.1, 0]}>
				<T.BoxGeometry args={[0.3, 0.06, 0.44]} />
				<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
			</T.Mesh>
		</T.Group>

		<!-- Right Sneaker with Neon Blue Sole -->
		<T.Group position={[0.22, -0.95, -Math.sin(runCycle) * 0.25 - 0.08]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[0.28, 0.18, 0.42]} />
				<T.MeshStandardMaterial color="#ffffff" />
			</T.Mesh>
			<T.Mesh position={[0, -0.1, 0]}>
				<T.BoxGeometry args={[0.3, 0.06, 0.44]} />
				<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
			</T.Mesh>
		</T.Group>
	{/if}

	<!-- Double Tap Energy Shield Power-up Aura -->
	{#if isShielded}
		<T.Mesh scale={1.4}>
			<T.SphereGeometry args={[0.9, 16, 16]} />
			<T.MeshStandardMaterial
				color="#06b6d4"
				transparent
				opacity={0.35}
				emissive="#06b6d4"
				emissiveIntensity={1.8}
				roughness={0.1}
			/>
		</T.Mesh>
	{/if}
</T.Group>
