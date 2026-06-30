<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Eventos - OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-4 text-3xl font-bold">Eventos</h1>
	<Card.Root>
		<Card.Content class="flex flex-col gap-4 p-4">
			<p class="text-text-muted">
				Calendario de torneios, jornadas e transmissoes da OutKing Series. Fica atento - os proximos
				eventos serao anunciados em breve.
			</p>
			<p class="text-sm text-text-dim">
				Ve as
				<a href={resolve('/teams')} class="text-primary hover:underline">equipas participantes</a>
				na epoca atual.
			</p>
		</Card.Content>
	</Card.Root>
</div>
