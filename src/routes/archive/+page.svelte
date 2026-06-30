<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Arquivo - OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
	<h1 class="mb-4 text-3xl font-bold">Arquivo</h1>
	<Card.Root class="p-10">
		<Card.Content>
			<p class="text-text-muted">
				Historico de epocas passadas, vencedores e momentos marcantes da OutKing Series. O arquivo
				completo estara disponivel em breve.
			</p>
			<p class="mt-4 text-sm text-text-dim">
				Explora as
				<a href={resolve('/teams')} class="text-primary hover:underline">equipas</a> da serie ou ve
				as
				<a href={resolve('/rules')} class="text-primary hover:underline">regras</a> do torneio.
			</p>
		</Card.Content>
	</Card.Root>
</div>
