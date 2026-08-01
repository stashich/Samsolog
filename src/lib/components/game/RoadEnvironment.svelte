<script lang="ts">
	import { T, useTask } from '@threlte/core';

	let { speed = 25 } = $props<{ speed?: number }>();

	// Road segment offset for seamless infinite loop towards horizon (-Z)
	let roadOffset = $state(0);
	const segmentLength = 40;

	useTask((delta) => {
		roadOffset = (roadOffset + delta * speed) % segmentLength;
	});
</script>

<!-- Sun & Ambient City Lighting -->
<T.DirectionalLight position={[15, 30, 20]} intensity={2.0} castShadow />
<T.AmbientLight intensity={0.65} />
<T.FogExp2 color="#09090b" density={0.01} />

<!-- Horizon Background Sky Wall -->
<T.Mesh position={[0, 25, -160]}>
	<T.PlaneGeometry args={[300, 120]} />
	<T.MeshBasicMaterial color="#09090b" />
</T.Mesh>

<!-- Main 3-Lane Horizontal Asphalt Highway (XZ Plane, width = 10 along X, length = 320 along Z) -->
<T.Mesh position={[0, -0.01, -100]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[10, 320]} />
	<T.MeshStandardMaterial color="#18181b" roughness={0.8} />
</T.Mesh>

<!-- Kazakh Flag Blue Ornamental Edge Strips -->
<T.Mesh position={[-4.9, 0.005, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[0.3, 320]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={0.6} />
</T.Mesh>
<T.Mesh position={[4.9, 0.005, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[0.3, 320]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={0.6} />
</T.Mesh>

<!-- Dashed Yellow Lane Lines (Z Axis Motion) -->
{#each [-1.65, 1.65] as laneX}
	{#each Array(16) as _, i}
		<T.Mesh
			position={[
				laneX,
				0.01,
				((i * 15 - roadOffset) % 240) - 160
			]}
			rotation.x={-Math.PI / 2}
		>
			<T.PlaneGeometry args={[0.15, 6]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={0.8} />
		</T.Mesh>
	{/each}
{/each}

<!-- Sidewalks (Left & Right Horizontal Strips) -->
<T.Mesh position={[-6.6, 0.08, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[3.2, 320]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>
<T.Mesh position={[6.6, 0.08, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[3.2, 320]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.9} />
</T.Mesh>

<!-- Astana City Buildings & Street Lamps along the sides -->
{#each Array(12) as _, i}
	{@const zPos = ((i * 20 - roadOffset) % 240) - 160}
	
	<!-- Left Buildings (Mangilik El Skyscrapers) -->
	<T.Mesh position={[-12, 14, zPos]}>
		<T.BoxGeometry args={[7, 28, 12]} />
		<T.MeshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} />
	</T.Mesh>

	<!-- Right Buildings -->
	<T.Mesh position={[12, 16, zPos]}>
		<T.BoxGeometry args={[7, 32, 12]} />
		<T.MeshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
	</T.Mesh>

	<!-- Street Lamps Left -->
	<T.Mesh position={[-5.1, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[-5.1, 6, zPos]}>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
	</T.Mesh>

	<!-- Street Lamps Right -->
	<T.Mesh position={[5.1, 3, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6]} />
		<T.MeshStandardMaterial color="#52525b" />
	</T.Mesh>
	<T.Mesh position={[5.1, 6, zPos]}>
		<T.SphereGeometry args={[0.35]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
	</T.Mesh>
{/each}

<!-- Astana Landmarks Background Group -->
<T.Group position={[0, 0, -145]}>
	<!-- 1. Mangilik El Triumph Arch (Center Horizon) -->
	<T.Group position={[0, 7.5, 0]}>
		<T.Mesh position={[-6.2, 0, 0]}>
			<T.BoxGeometry args={[3, 15, 4]} />
			<T.MeshStandardMaterial color="#f59e0b" roughness={0.3} emissive="#d97706" emissiveIntensity={0.4} />
		</T.Mesh>
		<T.Mesh position={[6.2, 0, 0]}>
			<T.BoxGeometry args={[3, 15, 4]} />
			<T.MeshStandardMaterial color="#f59e0b" roughness={0.3} emissive="#d97706" emissiveIntensity={0.4} />
		</T.Mesh>
		<T.Mesh position={[0, 8.5, 0]}>
			<T.BoxGeometry args={[15.4, 3.8, 4]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#f59e0b" emissiveIntensity={0.8} />
		</T.Mesh>
	</T.Group>

	<!-- 2. Baiterek Tower (Left Background) -->
	<T.Group position={[-26, 0, -25]}>
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

	<!-- 3. Khan Shatyr Tent (Right Background) -->
	<T.Group position={[26, 0, -25]}>
		<T.Mesh position={[0, 18, 0]}>
			<T.ConeGeometry args={[12, 36, 16]} />
			<T.MeshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.3} transparent opacity={0.85} emissive="#0284c7" emissiveIntensity={0.5} />
		</T.Mesh>
	</T.Group>
</T.Group>
