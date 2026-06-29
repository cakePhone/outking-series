<script lang="ts">
	import { resolve } from '$app/paths';
	import { signIn, session } from '$lib/auth-client';

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

<section class="py-24">
	<div class="card mx-auto max-w-2xl rounded-card p-10 text-center">
		<h2 class="mb-4 text-2xl font-bold">Pronto para competir?</h2>
		<p class="mb-8 text-text-muted">
			A próxima época está a chegar. Regista a tua equipa e mostra do que és feito.
		</p>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<button
				class="cursor-pointer rounded-full bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
				onclick={handleClick}
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
