<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Sobre - OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
	<h1 class="mb-4 text-3xl font-bold">Sobre</h1>
	<Card.Root class="p-10">
		<Card.Content>
			<p class="text-text-muted">
				A OutKing Series e um circuito competitivo de VALORANT focado no talento portugues. Estamos
				a preparar mais detalhes sobre a nossa historia e missao.
			</p>
			<p class="mt-4 text-sm text-text-dim">
				Entretanto, consulta as <a href={resolve('/rules')} class="text-primary hover:underline"
					>regras</a
				>
				ou
				<a href={resolve('/teams')} class="text-primary hover:underline">as equipas</a> da serie.
			</p>
		</Card.Content>
	</Card.Root>
</div>
