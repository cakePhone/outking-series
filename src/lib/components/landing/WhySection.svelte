<script lang="ts">
	import Swords from '@lucide/svelte/icons/swords';
	import Tv from '@lucide/svelte/icons/tv';
	import Medal from '@lucide/svelte/icons/medal';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">Porque Participar?</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		Mais do que um torneio, a OutKing Series e uma plataforma para cresceres como jogador e equipa.
	</p>

	<div class="grid gap-8 md:grid-cols-2">
		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Swords class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Competicao de Nivel</h3>
				<p class="text-sm text-text-muted">
					Enfrenta as melhores equipas de Portugal num formato justo e estruturado. Cada jogo conta
					para a tua jornada ate ao topo.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Tv class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Transmissao ao Vivo</h3>
				<p class="text-sm text-text-muted">
					Os jogos principais sao transmitidos com casting em portugues. Da-te a conhecer a
					comunidade e constroi a tua marca.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Medal class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Reconhecimento</h3>
				<p class="text-sm text-text-muted">
					Ganha visibilidade no cenario nacional. Scouts, organizacoes e comunidade acompanham de
					perto o talento que emerge da OutKing.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<TrendingUp class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Progressao</h3>
				<p class="text-sm text-text-muted">
					Acompanha a evolucao da tua equipa epoca apos epoca. Estatisticas, historico e rankings
					constroem o teu legado na serie.
				</p>
			</div>
		</div>
	</div>
</section>
