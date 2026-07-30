<script lang="ts">
	import { T, useTask } from '@threlte/core';

	export type ObstacleType = 'TATESHKA' | 'SAMSA' | 'BARRIER';

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

	// Rotation angles for flying Samsa pastries
	let samsaRotation = $state(0);

	useTask((delta) => {
		samsaRotation += delta * 5;

		// Move obstacles towards player along Z axis
		for (const obs of obstacles) {
			obs.z += delta * speed;

			// Tateshka crossing animation across lanes
			if (obs.type === 'TATESHKA') {
				if (obs.crossX === undefined) obs.crossX = -2.5;
				obs.crossX += delta * 2.5;
				if (obs.crossX > 2.5) obs.crossX = -2.5;
			}
		}
	});

	const lanePositions = [-2.2, 0, 2.2];
</script>

{#each obstacles as obs (obs.id)}
	<!-- Tateshka Crossing the Street -->
	{#if obs.type === 'TATESHKA'}
		<T.Group position={[obs.crossX ?? lanePositions[obs.lane], 0.9, obs.z]}>
			<!-- Traditional Headscarf / Kimeshek -->
			<T.Mesh position={[0, 0.7, 0]}>
				<T.ConeGeometry args={[0.35, 0.5, 8]} />
				<T.MeshStandardMaterial color="#fef08a" />
			</T.Mesh>
			<!-- Coat / Dress -->
			<T.Mesh position={[0, 0, 0]} castShadow>
				<T.CylinderGeometry args={[0.3, 0.55, 1.1]} />
				<T.MeshStandardMaterial color="#b91c1c" roughness={0.4} />
			</T.Mesh>
			<!-- Shopping Bags -->
			<T.Mesh position={[0.45, -0.1, 0]}>
				<T.BoxGeometry args={[0.25, 0.35, 0.25]} />
				<T.MeshStandardMaterial color="#16a34a" />
			</T.Mesh>
		</T.Group>

	<!-- Flying Samsa from Building Windows -->
	{:else if obs.type === 'SAMSA'}
		<T.Mesh
			position={[lanePositions[obs.lane], 1.2, obs.z]}
			rotation.y={samsaRotation}
			rotation.z={samsaRotation * 0.5}
			castShadow
		>
			<!-- Triangular Samsa Pastry Shape -->
			<T.CylinderGeometry args={[0.55, 0.55, 0.25, 3]} />
			<T.MeshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} emissive="#d97706" emissiveIntensity={0.6} />
		</T.Mesh>

	<!-- Road Barrier / Construction Cone -->
	{:else if obs.type === 'BARRIER'}
		<T.Group position={[lanePositions[obs.lane], 0.45, obs.z]}>
			<T.Mesh castShadow>
				<T.BoxGeometry args={[1.8, 0.85, 0.3]} />
				<T.MeshStandardMaterial color="#ef4444" roughness={0.5} />
			</T.Mesh>
			<!-- White Reflective Stripes -->
			<T.Mesh position={[0, 0.1, 0.01]}>
				<T.BoxGeometry args={[1.8, 0.25, 0.3]} />
				<T.MeshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
			</T.Mesh>
		</T.Group>
	{/if}
{/each}
