<script lang="ts">
	let { children } = $props();
</script>

<div class="rounded-card-small bg-surface p-6 backdrop-blur-2xl">
	{@render children()}
</div>
