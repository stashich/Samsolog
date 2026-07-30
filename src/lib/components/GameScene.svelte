<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls, ContactShadows } from '@threlte/extras';
	import { useTask } from '@threlte/core';

	let rotationY = $state(0);
	let rotationX = $state(0);

	// Unified frame loop tick to rotate the portal crystal and rings
	useTask((delta) => {
		rotationY += delta * 0.4;
		rotationX += delta * 0.15;
	});
</script>

<!-- Camera setup with OrbitControls for user interaction -->
<T.PerspectiveCamera
	makeDefault
	position={[0, 4, 8]}
	fov={45}
>
	<OrbitControls 
		enableDamping 
		dampingFactor={0.05} 
		maxPolarAngle={Math.PI / 2 - 0.05} 
		minDistance={4}
		maxDistance={12}
	/>
</T.PerspectiveCamera>

<!-- Scene Lighting -->
<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} />
<T.PointLight position={[-10, -5, -5]} intensity={1.0} color="#818cf8" />
<T.AmbientLight intensity={0.4} />

<!-- Glowing Grid Helper on the Floor -->
<T.GridHelper args={[20, 20, '#3f3f46', '#27272a']} position={[0, -0.01, 0]} />

<!-- Spinning 3D Crystal Portal Core (MeshPhysicalMaterial for glass look) -->
<T.Mesh position={[0, 1.5, 0]} rotation.y={rotationY} rotation.x={rotationX}>
	<T.IcosahedronGeometry args={[1.2, 0]} />
	<T.MeshPhysicalMaterial
		color="#06b6d4"
		roughness={0.05}
		metalness={0.1}
		transmission={0.8}
		thickness={1.5}
		ior={1.6}
		clearcoat={1.0}
		clearcoatRoughness={0.05}
	/>
</T.Mesh>

<!-- Floating Outer Orbit Ring (Glowing purple/indigo) -->
<T.Mesh position={[0, 1.5, 0]} rotation.z={rotationY * 0.5} rotation.x={Math.PI / 2}>
	<T.TorusGeometry args={[2.0, 0.06, 16, 100]} />
	<T.MeshStandardMaterial color="#818cf8" roughness={0.1} emissive="#818cf8" emissiveIntensity={2.0} />
</T.Mesh>

<!-- Floating Inner Orbit Ring (Glowing pink) -->
<T.Mesh position={[0, 1.5, 0]} rotation.y={-rotationY * 0.8} rotation.x={Math.PI / 4}>
	<T.TorusGeometry args={[1.6, 0.04, 16, 100]} />
	<T.MeshStandardMaterial color="#ec4899" roughness={0.1} emissive="#ec4899" emissiveIntensity={2.5} />
</T.Mesh>

<!-- Soft ground contact shadows -->
<ContactShadows
	scale={10}
	blur={2.5}
	far={4}
	opacity={0.6}
	position={[0, 0, 0]}
/>
