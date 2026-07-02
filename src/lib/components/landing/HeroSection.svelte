<script lang="ts">
	import { signIn, session } from '$lib/auth-client';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let { onregister, playerCount = 0 }: { onregister?: () => void; playerCount?: number } = $props();

	async function handleClick() {
		if ($session.data?.user) {
			window.location.href = resolve('/register');
		} else {
			await signIn.social({ provider: 'discord' });
		}
		onregister?.();
	}
</script>

<section
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-bg-accent-text"
>
	<img
		class="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale"
		src="/pearl.jpg"
		alt=""
	/>
	<div class="absolute inset-0 bg-bg-accent mix-blend-multiply"></div>

	<div class="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
		<h1 class="text-3xl font-extrabold tracking-tight md:text-7xl">
			{#if playerCount > 0}
				Junta-te a mais de {playerCount} jogadores
			{:else}
				Junta-te a mais de 150 jogadores
			{/if}
		</h1>
		<p class="max-w-xl text-lg text-text-muted md:text-xl"></p>
		<Button size="lg" class="rounded-full text-lg" onclick={handleClick}>
			{$session.data?.user ? 'Registar Equipa' : 'Entrar com Discord'}
		</Button>
		<p class="text-sm text-text-dim">
			{#if $session.data?.user}
				Pronto para competir?
			{:else}
				Faz login com Discord para comecares.
			{/if}
		</p>
	</div>

	<div class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
		<span class="text-xs text-text-inactive">Scroll</span>
		<ChevronDownIcon class="h-5 w-5 animate-bounce text-text-inactive" />
	</div>
</section>
