<script lang="ts">
	import Icon from '@iconify/svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">A Nossa Historia</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		Da paixao pelo competitivo nasceu a OutKing Series - um circuito pensado para elevar o cenario
		portugues de VALORANT, epoca apos epoca.
	</p>

	<div class="grid gap-6 md:grid-cols-3">
		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Icon icon="mdi:flag-checkered" class="h-5 w-5 text-primary" />
				</div>
				<Card.Title>Fundacao</Card.Title>
				<Card.Description>
					A OutKing Series nasceu em 2024 com o objetivo de criar um espaco competitivo dedicado ao
					talento portugues no VALORANT.
				</Card.Description>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Icon icon="mdi:trophy" class="h-5 w-5 text-primary" />
				</div>
				<Card.Title>Primeira Epoca</Card.Title>
				<Card.Description>
					A epoca inaugural colocou frente a frente as melhores equipas nacionais num formato de
					liga com playoffs ao vivo.
				</Card.Description>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Icon icon="mdi:rocket-launch" class="h-5 w-5 text-primary" />
				</div>
				<Card.Title>O Futuro</Card.Title>
				<Card.Description>
					Estamos a preparar novas epocas, parcerias e surpresas. O melhor ainda esta para vir -
					fica atento.
				</Card.Description>
			</Card.Content>
		</Card.Root>
	</div>
</section>
