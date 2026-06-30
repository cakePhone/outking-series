<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>404 - OutKing Series</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
	<h1 class="text-8xl font-black text-primary">404</h1>
	<p class="max-w-md text-lg text-text-dim">
		Parece que o Cypher nao conseguiu encontrar esta pagina. Nem as camaras dele deram com ela.
	</p>
	<Button href="/">Voltar ao inicio</Button>
</div>
