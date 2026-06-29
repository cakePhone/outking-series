<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">Porquê Participar?</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		Mais do que um torneio, a OutKing Series é uma plataforma para cresceres como jogador e equipa.
	</p>

	<div class="grid gap-8 md:grid-cols-2">
		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Icon icon="mdi:sword-cross" class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Competição de Nível</h3>
				<p class="text-sm text-text-muted">
					Enfrenta as melhores equipas de Portugal num formato justo e estruturado. Cada jogo conta
					para a tua jornada até ao topo.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Icon icon="mdi:television" class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Transmissão ao Vivo</h3>
				<p class="text-sm text-text-muted">
					Os jogos principais são transmitidos com casting em português. Dá-te a conhecer à
					comunidade e constrói a tua marca.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Icon icon="mdi:medal" class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Reconhecimento</h3>
				<p class="text-sm text-text-muted">
					Ganha visibilidade no cenário nacional. Scouts, organizações e comunidade acompanham de
					perto o talento que emerge da OutKing.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Icon icon="mdi:chart-line" class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Progressão</h3>
				<p class="text-sm text-text-muted">
					Acompanha a evolução da tua equipa época após época. Estatísticas, histórico e rankings
					constroem o teu legado na série.
				</p>
			</div>
		</div>
	</div>
</section>
