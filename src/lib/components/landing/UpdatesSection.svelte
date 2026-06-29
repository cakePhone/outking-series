<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<section class="bg-section py-24">
	<div class="mx-auto max-w-5xl px-4">
		<h2 class="mb-4 text-center text-3xl font-bold">Novidades da Série</h2>
		<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
			Acompanha as últimas atualizações sobre épocas, calendários e anúncios da OutKing Series.
		</p>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<article class="card overflow-hidden rounded-card">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Icon icon="mdi:calendar-star" class="h-12 w-12 text-primary/40" />
				</div>
				<div class="p-5">
					<span class="text-xs text-text-dim">Brevemente</span>
					<h3 class="mt-1 mb-2 text-lg font-semibold">Próxima Época</h3>
					<p class="text-sm text-text-muted">
						Detalhes sobre a próxima época serão anunciados em breve. Prepara a tua equipa e fica
						atento às nossas redes.
					</p>
				</div>
			</article>

			<article class="card overflow-hidden rounded-card">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Icon icon="mdi:account-group" class="h-12 w-12 text-primary/40" />
				</div>
				<div class="p-5">
					<span class="text-xs text-text-dim">A Decorrer</span>
					<h3 class="mt-1 mb-2 text-lg font-semibold">Inscrições Abertas</h3>
					<p class="text-sm text-text-muted">
						As inscrições para equipas estão abertas. Junta o teu stack e garante o teu lugar na
						corrida pela coroa.
					</p>
				</div>
			</article>

			<article class="card overflow-hidden rounded-card">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Icon icon="mdi:discord" class="h-12 w-12 text-primary/40" />
				</div>
				<div class="p-5">
					<span class="text-xs text-text-dim">Comunidade</span>
					<h3 class="mt-1 mb-2 text-lg font-semibold">Servidor Discord</h3>
					<p class="text-sm text-text-muted">
						Junta-te à nossa comunidade no Discord para conheceres outros jogadores, formares
						equipas e receberes novidades em primeira mão.
					</p>
				</div>
			</article>
		</div>

		<p class="mt-8 text-center text-sm text-text-dim">
			Mais novidades em breve. Segue-nos para não perderes nada.
		</p>
	</div>
</section>
