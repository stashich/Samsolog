<script lang="ts">
	import AstanaRunnerGame from '$lib/components/game/AstanaRunnerGame.svelte';

	let { data, form } = $props();
</script>

<AstanaRunnerGame scores={data.scores} {form} />
