<script lang="ts">
	import Users from '@lucide/svelte/icons/users';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import DiscordIcon from '$lib/components/icons/DiscordIcon.svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<section class="bg-section py-24">
	<div class="mx-auto flex max-w-5xl flex-col gap-4 px-4">
		<h2 class="text-center text-3xl font-bold">Novidades da Serie</h2>
		<p class="mx-auto max-w-2xl text-center text-text-muted">
			Acompanha as ultimas atualizacoes sobre epocas, calendarios e anuncios da OutKing Series.
		</p>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Sparkles class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">Brevemente</span>
					<Card.Title>Proxima Epoca</Card.Title>
					<Card.Description>
						Detalhes sobre a proxima epoca serao anunciados em breve. Prepara a tua equipa e fica
						atento as nossas redes.
					</Card.Description>
				</Card.Content>
			</Card.Root>

			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Users class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">A Decorrer</span>
					<Card.Title>Inscricoes Abertas</Card.Title>
					<Card.Description>
						As inscricoes para equipas estao abertas. Junta o teu stack e garante o teu lugar na
						corrida pela coroa.
					</Card.Description>
				</Card.Content>
			</Card.Root>

			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<DiscordIcon class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">Comunidade</span>
					<Card.Title>Servidor Discord</Card.Title>
					<Card.Description>
						Junta-te a nossa comunidade no Discord para conheceres outros jogadores, formares
						equipas e receberes novidades em primeira mao.
					</Card.Description>
				</Card.Content>
			</Card.Root>
		</div>

		<p class="mt-8 text-center text-sm text-text-dim">
			Mais novidades em breve. Segue-nos para nao perderes nada.
		</p>
	</div>
</section>
