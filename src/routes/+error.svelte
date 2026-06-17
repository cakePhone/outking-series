<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>404 — OutKing Series</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
	<h1 class="text-8xl font-black text-primary">404</h1>
	<p class="max-w-md text-lg text-text-dim">
		Parece que o Cypher não conseguiu encontrar esta página. Nem as câmaras dele deram com ela.
	</p>
	<a
		href="/"
		class="rounded-lg bg-primary px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-primary-hover"
	>
		Voltar ao início
	</a>
</div>
