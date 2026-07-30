<script lang="ts">
	import { T, useTask } from '@threlte/core';

	let { speed = 25 } = $props<{ speed?: number }>();

	// Road segment offset for seamless infinite loop
	let roadOffset = $state(0);
	const segmentLength = 40;

	useTask((delta) => {
		roadOffset = (roadOffset + delta * speed) % segmentLength;
	});
</script>

<!-- Ambient City Lighting -->
<T.DirectionalLight position={[20, 40, 20]} intensity={1.8} castShadow />
<T.AmbientLight intensity={0.6} />
<T.FogExp2 color="#09090b" density={0.015} />

<!-- Main 3-Lane Asphalt Highway -->
<T.Mesh position={[0, -0.01, -30]} receiveShadow>
	<T.PlaneGeometry args={[9, 160]} />
	<T.MeshStandardMaterial color="#18181b" roughness={0.8} />
</T.Mesh>

<!-- Lane Divider Markings (Infinite loop) -->
{#each [-1.1, 1.1] as laneX}
	{#each Array(8) as _, i}
		<T.Mesh
			position={[
				laneX,
				0.01,
				((i * 15 - roadOffset) % 120) - 80
			]}
		>
			<T.BoxGeometry args={[0.15, 0.02, 6]} />
			<T.MeshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
		</T.Mesh>
	{/each}
{/each}

<!-- Sidewalks (Left & Right) -->
<T.Mesh position={[-6, 0.1, -30]}>
	<T.BoxGeometry args={[3, 0.2, 160]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>
<T.Mesh position={[6, 0.1, -30]}>
	<T.BoxGeometry args={[3, 0.2, 160]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>

<!-- Astana City Buildings & Street Lamps along the sides -->
{#each Array(10) as _, i}
	{@const zPos = ((i * 16 - roadOffset) % 160) - 100}
	
	<!-- Left Buildings (Mangilik El Style Skyscrapers) -->
	<T.Mesh position={[-12, 12, zPos]}>
		<T.BoxGeometry args={[8, 24, 12]} />
		<T.MeshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.2} />
	</T.Mesh>

	<!-- Right Buildings -->
	<T.Mesh position={[12, 15, zPos]}>
		<T.BoxGeometry args={[8, 30, 12]} />
		<T.MeshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.3} />
	</T.Mesh>

	<!-- Street Lamps Left -->
	<T.Mesh position={[-4.7, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[-4.7, 6, zPos]}>
		<T.SphereGeometry args={[0.3]} />
		<T.MeshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.0} />
	</T.Mesh>

	<!-- Street Lamps Right -->
	<T.Mesh position={[4.7, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[4.7, 6, zPos]}>
		<T.SphereGeometry args={[0.3]} />
		<T.MeshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.0} />
	</T.Mesh>
{/each}

<!-- Astana Mangilik El Arch Replica in distant background -->
<T.Group position={[0, 8, -110]}>
	<!-- Arch Columns -->
	<T.Mesh position={[-6, 0, 0]}>
		<T.BoxGeometry args={[3, 16, 4]} />
		<T.MeshStandardMaterial color="#f59e0b" roughness={0.4} emissive="#d97706" emissiveIntensity={0.3} />
	</T.Mesh>
	<T.Mesh position={[6, 0, 0]}>
		<T.BoxGeometry args={[3, 16, 4]} />
		<T.MeshStandardMaterial color="#f59e0b" roughness={0.4} emissive="#d97706" emissiveIntensity={0.3} />
	</T.Mesh>
	<!-- Arch Crown -->
	<T.Mesh position={[0, 9, 0]}>
		<T.BoxGeometry args={[15, 4, 4]} />
		<T.MeshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
	</T.Mesh>
</T.Group>
