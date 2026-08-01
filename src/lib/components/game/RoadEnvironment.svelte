<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let { speed = 25 } = $props<{ speed?: number }>();

	// Procedural Textures generated via HTML5 Canvas
	let buildingTexture = $state<THREE.CanvasTexture | null>(null);
	let kazakhTexture = $state<THREE.CanvasTexture | null>(null);

	onMount(() => {
		// 1. Generate Skyscraper Window Grid Texture
		const canvas1 = document.createElement('canvas');
		canvas1.width = 512;
		canvas1.height = 512;
		const ctx1 = canvas1.getContext('2d')!;
		ctx1.fillStyle = '#0f172a';
		ctx1.fillRect(0, 0, 512, 512);

		// Draw illuminated windows grid
		const cols = 8;
		const rows = 16;
		const w = 40;
		const h = 20;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = 20 + c * 60;
				const y = 15 + r * 30;
				const rand = Math.random();
				if (rand > 0.4) {
					ctx1.fillStyle = rand > 0.85 ? '#38bdf8' : rand > 0.6 ? '#fec10d' : '#e2e8f0';
					ctx1.shadowColor = ctx1.fillStyle;
					ctx1.shadowBlur = 6;
				} else {
					ctx1.fillStyle = '#1e293b';
					ctx1.shadowBlur = 0;
				}
				ctx1.fillRect(x, y, w, h);
			}
		}
		const tex1 = new THREE.CanvasTexture(canvas1);
		tex1.wrapS = THREE.RepeatWrapping;
		tex1.wrapT = THREE.RepeatWrapping;
		tex1.repeat.set(1, 3);
		buildingTexture = tex1;

		// 2. Generate Kazakh Ornament Architectural Texture
		const canvas2 = document.createElement('canvas');
		canvas2.width = 512;
		canvas2.height = 512;
		const ctx2 = canvas2.getContext('2d')!;
		ctx2.fillStyle = '#0284c7';
		ctx2.fillRect(0, 0, 512, 512);

		// Gold border frames
		ctx2.strokeStyle = '#fec10d';
		ctx2.lineWidth = 12;
		ctx2.strokeRect(10, 10, 492, 492);
		ctx2.strokeRect(30, 30, 452, 452);

		// Ornamental Sun Motif
		ctx2.fillStyle = '#fec10d';
		ctx2.beginPath();
		ctx2.arc(256, 256, 90, 0, Math.PI * 2);
		ctx2.fill();
		ctx2.fillStyle = '#0284c7';
		ctx2.beginPath();
		ctx2.arc(256, 256, 60, 0, Math.PI * 2);
		ctx2.fill();

		const tex2 = new THREE.CanvasTexture(canvas2);
		tex2.wrapS = THREE.RepeatWrapping;
		tex2.wrapT = THREE.RepeatWrapping;
		tex2.repeat.set(1, 2);
		kazakhTexture = tex2;
	});

	// Road segment offset for seamless infinite loop (+Z)
	let roadOffset = $state(0);
	const segmentLength = 40;

	useTask((delta) => {
		roadOffset = (roadOffset + delta * speed) % segmentLength;
	});
</script>

<!-- Ambient & Hemispheric City Lighting -->
<T.AmbientLight intensity={0.7} />
<T.HemisphereLight skyColor="#00afec" groundColor="#0f172a" intensity={1.2} />
<T.DirectionalLight position={[12, 35, 10]} intensity={2.2} castShadow />
<T.FogExp2 color="#09090b" density={0.008} />

<!-- Horizon Background Sky Backdrop -->
<T.Mesh position={[0, 30, -170]}>
	<T.PlaneGeometry args={[320, 140]} />
	<T.MeshBasicMaterial color="#09090b" />
</T.Mesh>

<!-- Main 3-Lane Horizontal Asphalt Highway -->
<T.Mesh position={[0, -0.01, -100]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[10, 320]} />
	<T.MeshStandardMaterial color="#1e1e24" roughness={0.7} metalness={0.1} />
</T.Mesh>

<!-- Glowing Kazakh Blue Neon Edge Strips -->
<T.Mesh position={[-4.9, 0.005, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[0.3, 320]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={1.8} />
</T.Mesh>
<T.Mesh position={[4.9, 0.005, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[0.3, 320]} />
	<T.MeshStandardMaterial color="#00afec" emissive="#00afec" emissiveIntensity={1.8} />
</T.Mesh>

<!-- Glowing Dashed Yellow Lane Lines (Z Motion) -->
{#each [-1.65, 1.65] as laneX}
	{#each Array(16) as _, i}
		<T.Mesh
			position={[
				laneX,
				0.01,
				((i * 15 + roadOffset) % 240) - 160
			]}
			rotation.x={-Math.PI / 2}
		>
			<T.PlaneGeometry args={[0.18, 6.5]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={2.0} />
		</T.Mesh>
	{/each}
{/each}

<!-- Speed Streaks under Runner -->
{#each Array(8) as _, i}
	<T.Mesh position={[0, 0.008, ((i * 10 + roadOffset) % 80) - 20]}>
		<T.PlaneGeometry args={[0.1, 3.0]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} transparent opacity={0.6} />
	</T.Mesh>
{/each}

<!-- Sidewalks (Left & Right) -->
<T.Mesh position={[-6.6, 0.08, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[3.2, 320]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.8} />
</T.Mesh>
<T.Mesh position={[6.6, 0.08, -100]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[3.2, 320]} />
	<T.MeshStandardMaterial color="#27272a" roughness={0.8} />
</T.Mesh>

<!-- Astana City Buildings with Procedural Illuminated Facades -->
{#each Array(12) as _, i}
	{@const zPos = ((i * 20 + roadOffset) % 240) - 160}
	
	<!-- Left Skyscrapers (Illuminated Window Grid) -->
	<T.Mesh position={[-12, 16, zPos]} castShadow>
		<T.BoxGeometry args={[7, 32, 12]} />
		{#if buildingTexture}
			<T.MeshStandardMaterial map={buildingTexture} roughness={0.2} metalness={0.3} />
		{:else}
			<T.MeshStandardMaterial color="#0284c7" />
		{/if}
	</T.Mesh>

	<!-- Right Buildings (Kazakh Gold/Blue Ornament Facade) -->
	<T.Mesh position={[12, 18, zPos]} castShadow>
		<T.BoxGeometry args={[7, 36, 12]} />
		{#if kazakhTexture}
			<T.MeshStandardMaterial map={kazakhTexture} roughness={0.2} metalness={0.3} />
		{:else}
			<T.MeshStandardMaterial color="#0f172a" />
		{/if}
	</T.Mesh>

	<!-- Street Lamps with Neon Orbs -->
	<T.Mesh position={[-5.1, 3.2, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6.4]} />
		<T.MeshStandardMaterial color="#3f3f46" metalness={0.8} />
	</T.Mesh>
	<T.Mesh position={[-5.1, 6.5, zPos]}>
		<T.SphereGeometry args={[0.42]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.0} />
	</T.Mesh>

	<T.Mesh position={[5.1, 3.2, zPos]}>
		<T.CylinderGeometry args={[0.08, 0.1, 6.4]} />
		<T.MeshStandardMaterial color="#3f3f46" metalness={0.8} />
	</T.Mesh>
	<T.Mesh position={[5.1, 6.5, zPos]}>
		<T.SphereGeometry args={[0.42]} />
		<T.MeshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.0} />
	</T.Mesh>
{/each}

<!-- Astana Landmarks Horizon Group -->
<T.Group position={[0, 0, -145]}>
	<!-- Mangilik El Triumph Arch (Center Horizon) -->
	<T.Group position={[0, 7.5, 0]}>
		<T.Mesh position={[-6.2, 0, 0]} castShadow>
			<T.BoxGeometry args={[3.2, 15, 4]} />
			<T.MeshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.6} />
		</T.Mesh>
		<T.Mesh position={[6.2, 0, 0]} castShadow>
			<T.BoxGeometry args={[3.2, 15, 4]} />
			<T.MeshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.6} />
		</T.Mesh>
		<T.Mesh position={[0, 8.5, 0]} castShadow>
			<T.BoxGeometry args={[15.6, 4.0, 4]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={1.2} />
		</T.Mesh>
	</T.Group>

	<!-- Baiterek Tower (Left Horizon) -->
	<T.Group position={[-26, 0, -25]}>
		<T.Mesh position={[0, 16, 0]}>
			<T.CylinderGeometry args={[0.5, 1.4, 32, 16]} />
			<T.MeshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
		</T.Mesh>
		<T.Mesh position={[0, 33, 0]}>
			<T.SphereGeometry args={[3.8, 32, 32]} />
			<T.MeshStandardMaterial color="#fec10d" emissive="#fec10d" emissiveIntensity={2.5} metalness={0.9} />
		</T.Mesh>
	</T.Group>

	<!-- Khan Shatyr Tent (Right Horizon) -->
	<T.Group position={[26, 0, -25]}>
		<T.Mesh position={[0, 18, 0]}>
			<T.ConeGeometry args={[12, 36, 16]} />
			<T.MeshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.9} emissive="#0284c7" emissiveIntensity={1.0} />
		</T.Mesh>
	</T.Group>
</T.Group>
