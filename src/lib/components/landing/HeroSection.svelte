<script lang="ts">
	import { signIn, session } from '$lib/auth-client';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import {
		hero_title,
		hero_cta_logged_in,
		hero_cta_logged_out,
		hero_prompt_logged_in,
		hero_prompt_logged_out,
		hero_scroll
	} from '$lib/paraglide/messages';

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
			{hero_title({ count: playerCount > 0 ? playerCount : 150 })}
		</h1>
		<p class="max-w-xl text-lg text-text-muted md:text-xl">
			{$session.data?.user ? hero_prompt_logged_in() : hero_prompt_logged_out()}
		</p>
		<Button size="lg" type="button" class="text-lg" onclick={handleClick}>
			{$session.data?.user ? hero_cta_logged_in() : hero_cta_logged_out()}
		</Button>
	</div>

	<div class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
		<span class="text-xs">{hero_scroll()}</span>
		<ChevronDownIcon class="h-5 w-5 animate-bounce" />
	</div>
</section>
