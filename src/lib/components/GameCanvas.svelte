<script lang="ts">
	import { Canvas } from '@threlte/core';
	import GameScene from './GameScene.svelte';
</script>

<div class="relative h-full w-full overflow-hidden bg-zinc-950/80 rounded-3xl border border-zinc-900 shadow-inner">
	<!-- Canvas renders WebGL context -->
	<Canvas>
		<GameScene />
	</Canvas>
</div>
