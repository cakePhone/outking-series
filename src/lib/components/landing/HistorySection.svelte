<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">A Nossa História</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		Da paixão pelo competitivo nasceu a OutKing Series — um circuito pensado para elevar o cenário
		português de VALORANT, época após época.
	</p>

	<div class="grid gap-6 md:grid-cols-3">
		<div class="card rounded-card p-6">
			<div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
				<Icon icon="mdi:flag-checkered" class="h-5 w-5 text-primary" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">Fundação</h3>
			<p class="text-sm text-text-muted">
				A OutKing Series nasceu em 2024 com o objetivo de criar um espaço competitivo dedicado ao
				talento português no VALORANT.
			</p>
		</div>

		<div class="card rounded-card p-6">
			<div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
				<Icon icon="mdi:trophy" class="h-5 w-5 text-primary" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">Primeira Época</h3>
			<p class="text-sm text-text-muted">
				A época inaugural colocou frente a frente as melhores equipas nacionais num formato de liga
				com playoffs ao vivo.
			</p>
		</div>

		<div class="card rounded-card p-6">
			<div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
				<Icon icon="mdi:rocket-launch" class="h-5 w-5 text-primary" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">O Futuro</h3>
			<p class="text-sm text-text-muted">
				Estamos a preparar novas épocas, parcerias e surpresas. O melhor ainda está para vir — fica
				atento.
			</p>
		</div>
	</div>
</section>
