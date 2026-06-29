<script lang="ts">
	import { signIn, session } from '$lib/auth-client';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';

	let { onregister }: { onregister?: () => void } = $props();

	async function handleClick() {
		if ($session.data?.user) {
			window.location.href = resolve('/register');
		} else {
			await signIn.social({ provider: 'discord' });
		}
		onregister?.();
	}
</script>

<section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
	<img
		class="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale"
		src="/pearl.jpg"
		alt=""
	/>
	<div class="absolute inset-0 bg-accent mix-blend-multiply"></div>

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
			onclick={handleClick}
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

	<div class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
		<span class="text-xs text-text-inactive">Scroll</span>
		<Icon icon="mdi:chevron-down" class="h-5 w-5 animate-bounce text-text-inactive" />
	</div>
</section>
