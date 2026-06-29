<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Eventos - OutKing Series</title>
</svelte:head>

<article>
	<h1>Eventos</h1>
	<div class="card rounded-card p-4">
		<p>
			Calendário de torneios, jornadas e transmissões da OutKing Series. Fica atento - os próximos
			eventos serão anunciados em breve.
		</p>
		<p>
			Vê as
			<a href={resolve('/teams')} class="text-primary hover:underline">equipas participantes</a>
			na época atual.
		</p>
	</div>
</article>
