<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';

	let { data, children } = $props();
	const bare = data.maintenance;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Oxanium:wght@200..800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{#if bare}
	<main class="min-h-dvh">
		{@render children()}
	</main>
{:else}
	<Navbar />
	<main class="min-h-screen">
		{@render children()}
	</main>
	<Footer />
{/if}
