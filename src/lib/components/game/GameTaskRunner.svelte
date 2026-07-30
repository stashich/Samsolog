<script lang="ts">
	import { useTask } from '@threlte/core';

	let { onUpdate } = $props<{ onUpdate: (delta: number) => void }>();

	useTask((delta) => {
		onUpdate(delta);
	});
</script>
