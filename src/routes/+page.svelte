<script lang="ts">
	import { resolve } from '$app/paths';
	import { signIn, session } from '$lib/auth-client';
	import Icon from '@iconify/svelte';

	async function handleRegister() {
		if ($session.data?.user) {
			window.location.href = resolve('/register');
		} else {
			await signIn.social({ provider: 'discord' });
		}
	}
</script>

<svelte:head>
	<title>OutKing Series — Torneios de VALORANT</title>
</svelte:head>

<!-- ════════════════════════════════════════
     HERO
     ════════════════════════════════════════ -->
<section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
	<!-- Background: grayscale pearl with accent blend -->
	<img
		class="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale"
		src="/pearl.jpg"
		alt=""
	/>
	<div class="absolute inset-0 bg-accent mix-blend-multiply"></div>

	<!-- Content overlay -->
	<div class="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
		<h1 class="text-5xl font-extrabold tracking-tight md:text-7xl">
			OutKing<span class="text-primary"> Series</span>
		</h1>
		<p class="max-w-xl text-lg text-text-muted md:text-xl">
			O circuito competitivo de VALORANT onde equipas portuguesas se enfrentam pela coroa. Cada
			época, um novo rei.
		</p>
		<button
			class="cursor-pointer rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
			onclick={handleRegister}
		>
			{$session.data?.user ? 'Registar Equipa' : 'Entrar com Discord'}
		</button>
		<p class="text-sm text-text-dim">
			{#if $session.data?.user}
				Pronto para competir?
			{:else}
				Faz login com Discord para começares.
			{/if}
		</p>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
		<span class="text-xs text-text-inactive">Scroll</span>
		<Icon icon="mdi:chevron-down" class="h-5 w-5 animate-bounce text-text-inactive" />
	</div>
</section>

<!-- ════════════════════════════════════════
     ABOUT / HISTORY
     ════════════════════════════════════════ -->
<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">A Nossa História</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		Da paixão pelo competitivo nasceu a OutKing Series — um circuito pensado para elevar o cenário
		português de VALORANT, época após época.
	</p>

	<!-- Timeline framework — replace with real milestones -->
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

<!-- ════════════════════════════════════════
     SERIES UPDATES
     ════════════════════════════════════════ -->
<section class="bg-section py-24">
	<div class="mx-auto max-w-5xl px-4">
		<h2 class="mb-4 text-center text-3xl font-bold">Novidades da Série</h2>
		<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
			Acompanha as últimas atualizações sobre épocas, calendários e anúncios da OutKing Series.
		</p>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Example update 1 -->
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

			<!-- Example update 2 -->
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

			<!-- Example update 3 -->
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

<!-- ════════════════════════════════════════
     WHY PARTICIPATE
     ════════════════════════════════════════ -->
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

<!-- ════════════════════════════════════════
     FINAL CTA
     ════════════════════════════════════════ -->
<section class="py-24">
	<div class="card mx-auto max-w-2xl rounded-card p-10 text-center">
		<h2 class="mb-4 text-2xl font-bold">Pronto para competir?</h2>
		<p class="mb-8 text-text-muted">
			A próxima época está a chegar. Regista a tua equipa e mostra do que és feito.
		</p>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<button
				class="cursor-pointer rounded-full bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
				onclick={handleRegister}
			>
				{$session.data?.user ? 'Registar Equipa' : 'Entrar com Discord'}
			</button>
			<a
				href={resolve('/teams')}
				class="rounded-full border border-border px-8 py-3 font-semibold text-text-muted no-underline transition-all hover:border-primary hover:text-primary"
			>
				Ver Equipas
			</a>
		</div>
	</div>
</section>
