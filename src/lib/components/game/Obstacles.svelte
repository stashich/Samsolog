<script lang="ts">
	import { T, useTask } from '@threlte/core';

	export type ObstacleType = 'TATESHKA' | 'SAMSA' | 'BARRIER' | 'COIN';

	export interface ObstacleData {
		id: number;
		type: ObstacleType;
		lane: number; // 0, 1, 2
		z: number; // Distance down the road
		crossX?: number; // For Tateshka crossing animation
	}

	let {
		obstacles = [],
		speed = 25,
		onCollision = () => {}
	} = $props<{
		obstacles: ObstacleData[];
		speed: number;
		onCollision: (obs: ObstacleData) => void;
	}>();

	// Rotation & animation states
	let itemRotation = $state(0);

	useTask((delta) => {
		itemRotation += delta * 4;

		// Move obstacles towards player along Z axis
		for (const obs of obstacles) {
			obs.z += delta * speed;

			// Tateshka crossing animation across lanes
			if (obs.type === 'TATESHKA') {
				if (obs.crossX === undefined) obs.crossX = -2.8;
				obs.crossX += delta * 2.8;
				if (obs.crossX > 2.8) obs.crossX = -2.8;
			}
		}
	});

	const lanePositions = [-2.2, 0, 2.2];
</script>

{#each obstacles as obs (obs.id)}
	<!-- 1. Tateshka Crossing the Street in Traditional Vest & Kimeshek -->
	{#if obs.type === 'TATESHKA'}
		<T.Group position={[obs.crossX ?? lanePositions[obs.lane], 0.95, obs.z]}>
			<!-- Head & Kimeshek Headdress -->
			<T.Mesh position={[0, 0.75, 0]} castShadow>
				<T.ConeGeometry args={[0.38, 0.65, 8]} />
				<T.MeshStandardMaterial color="#ffffff" roughness={0.5} />
			</T.Mesh>
			<!-- Head Face -->
			<T.Mesh position={[0, 0.65, 0.15]}>
				<T.SphereGeometry args={[0.22]} />
				<T.MeshStandardMaterial color="#fcd34d" />
			</T.Mesh>

			<!-- Traditional Beshmet/Shapan Coat (Burgundy with Gold Trim) -->
			<T.Mesh position={[0, 0, 0]} castShadow>
				<T.CylinderGeometry args={[0.32, 0.6, 1.2]} />
				<T.MeshStandardMaterial color="#881337" roughness={0.4} />
			</T.Mesh>
			<!-- Gold Trim -->
			<T.Mesh position={[0, 0, 0.32]}>
				<T.BoxGeometry args={[0.12, 1.15, 0.05]} />
				<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={0.6} />
			</T.Mesh>

			<!-- Kazakh Grocery Shopping Bags -->
			<T.Mesh position={[0.5, -0.1, 0.1]} castShadow>
				<T.BoxGeometry args={[0.28, 0.38, 0.28]} />
				<T.MeshStandardMaterial color="#0284c7" />
			</T.Mesh>
			<T.Mesh position={[-0.5, -0.1, -0.1]} castShadow>
				<T.BoxGeometry args={[0.28, 0.38, 0.28]} />
				<T.MeshStandardMaterial color="#16a34a" />
			</T.Mesh>
		</T.Group>

	<!-- 2. Flying Samsa from Windows with Golden Energy Ring -->
	{:else if obs.type === 'SAMSA'}
		<T.Group position={[lanePositions[obs.lane], 1.2, obs.z]}>
			<!-- Spinning Golden Samsa Pastry -->
			<T.Mesh rotation.y={itemRotation} rotation.z={itemRotation * 0.5} castShadow>
				<T.CylinderGeometry args={[0.55, 0.55, 0.25, 3]} />
				<T.MeshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.2} emissive="#d97706" emissiveIntensity={0.8} />
			</T.Mesh>

			<!-- Golden Sparkle Ring -->
			<T.Mesh rotation.x={Math.PI / 2} rotation.y={itemRotation}>
				<T.TorusGeometry args={[0.85, 0.03, 12, 40]} />
				<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={2.5} />
			</T.Mesh>
		</T.Group>

	<!-- 3. Kazakh Gold Coins 🪙 (Collectible Items) -->
	{:else if obs.type === 'COIN'}
		<T.Mesh
			position={[lanePositions[obs.lane], 1.0, obs.z]}
			rotation.y={itemRotation * 1.5}
			castShadow
		>
			<T.CylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
			<T.MeshStandardMaterial color="#fec10d" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={1.2} />
		</T.Mesh>

	<!-- 4. Road Barrier / Construction Cone -->
	{:else if obs.type === 'BARRIER'}
		<T.Group position={[lanePositions[obs.lane], 0.45, obs.z]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[1.85, 0.85, 0.35]} />
				<T.MeshStandardMaterial color="#ef4444" roughness={0.5} />
			</T.Mesh>
			<!-- Reflective White Stripes -->
			<T.Mesh position={[0, 0.1, 0.01]}>
				<T.BoxGeometry args={[1.85, 0.28, 0.36]} />
				<T.MeshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
			</T.Mesh>
		</T.Group>
	{/if}
{/each}
