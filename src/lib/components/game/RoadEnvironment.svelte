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

<!-- Ambient City Lighting & Sky Tint -->
<T.DirectionalLight position={[20, 45, 20]} intensity={2.0} castShadow />
<T.AmbientLight intensity={0.7} />
<T.FogExp2 color="#09090b" density={0.012} />

<!-- Main 3-Lane Asphalt Highway -->
<T.Mesh position={[0, -0.01, -30]} receiveShadow>
	<T.PlaneGeometry args={[9, 170]} />
	<T.MeshStandardMaterial color="#18181b" roughness={0.8} />
</T.Mesh>

<!-- Golden Kazakh Ornamental Border Strips on Road Edges -->
<T.Mesh position={[-4.5, 0.005, -30]}>
	<T.PlaneGeometry args={[0.3, 170]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={0.6} />
</T.Mesh>
<T.Mesh position={[4.5, 0.005, -30]}>
	<T.PlaneGeometry args={[0.3, 170]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={0.6} />
</T.Mesh>

<!-- Lane Divider Markings (Infinite loop) -->
{#each [-1.5, 1.5] as laneX}
	{#each Array(9) as _, i}
		<T.Mesh
			position={[
				laneX,
				0.01,
				((i * 15 - roadOffset) % 135) - 85
			]}
		>
			<T.BoxGeometry args={[0.15, 0.02, 6]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={0.8} />
		</T.Mesh>
	{/each}
{/each}

<!-- Sidewalks (Left & Right) -->
<T.Mesh position={[-6.2, 0.1, -30]}>
	<T.BoxGeometry args={[3.2, 0.2, 170]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>
<T.Mesh position={[6.2, 0.1, -30]}>
	<T.BoxGeometry args={[3.2, 0.2, 170]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>

<!-- Astana City Buildings & Street Lamps along the sides -->
{#each Array(10) as _, i}
	{@const zPos = ((i * 16 - roadOffset) % 160) - 100}
	
	<!-- Left Buildings (Mangilik El Sky-Blue & Gold Skyscrapers) -->
	<T.Mesh position={[-12, 14, zPos]}>
		<T.BoxGeometry args={[8, 28, 12]} />
		<T.MeshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} />
	</T.Mesh>

	<!-- Right Buildings -->
	<T.Mesh position={[12, 16, zPos]}>
		<T.BoxGeometry args={[8, 32, 12]} />
		<T.MeshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
	</T.Mesh>

	<!-- Street Lamps Left -->
	<T.Mesh position={[-4.7, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[-4.7, 6, zPos]}>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
	</T.Mesh>

	<!-- Street Lamps Right -->
	<T.Mesh position={[4.7, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[4.7, 6, zPos]}>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
	</T.Mesh>
{/each}

<!-- Astana Landmarks Background Group -->
<T.Group position={[0, 0, -115]}>
	<!-- 1. Mangilik El Triumph Arch (Center) -->
	<T.Group position={[0, 8, 0]}>
		<T.Mesh position={[-6.5, 0, 0]}>
			<T.BoxGeometry args={[3.2, 16, 4]} />
			<T.MeshStandardMaterial color="#f59e0b" roughness={0.3} emissive="#d97706" emissiveIntensity={0.4} />
		</T.Mesh>
		<T.Mesh position={[6.5, 0, 0]}>
			<T.BoxGeometry args={[3.2, 16, 4]} />
			<T.MeshStandardMaterial color="#f59e0b" roughness={0.3} emissive="#d97706" emissiveIntensity={0.4} />
		</T.Mesh>
		<T.Mesh position={[0, 9, 0]}>
			<T.BoxGeometry args={[16, 4, 4]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#f59e0b" emissiveIntensity={0.8} />
		</T.Mesh>
	</T.Group>

	<!-- 2. Baiterek Tower (Distant Left) -->
	<T.Group position={[-25, 0, -30]}>
		<T.Mesh position={[0, 15, 0]}>
			<T.CylinderGeometry args={[0.4, 1.2, 30, 12]} />
			<T.MeshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
		</T.Mesh>
		<!-- Golden Sun Egg -->
		<T.Mesh position={[0, 32, 0]}>
			<T.SphereGeometry args={[3.5, 32, 32]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
		</T.Mesh>
	</T.Group>

	<!-- 3. Khan Shatyr Tent (Distant Right) -->
	<T.Group position={[25, 0, -30]}>
		<T.Mesh position={[0, 18, 0]}>
			<T.ConeGeometry args={[12, 36, 16]} />
			<T.MeshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.3} transparent opacity={0.85} emissive="#0284c7" emissiveIntensity={0.5} />
		</T.Mesh>
	</T.Group>
</T.Group>
