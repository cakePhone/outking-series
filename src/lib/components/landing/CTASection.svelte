<script lang="ts">
	import { resolve } from '$app/paths';
	import { signIn, session } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

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
	<Card.Root class="mx-auto max-w-2xl p-10 text-center">
		<Card.Header>
			<Card.Title class="text-2xl">Pronto para competir?</Card.Title>
			<Card.Description>
				A proxima epoca esta a chegar. Regista a tua equipa e mostra do que es feito.
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<Button onclick={handleClick}>
				{$session.data?.user ? 'Registar Equipa' : 'Entrar com Discord'}
			</Button>
			<Button variant="outline" href={resolve('/teams')}>Ver Equipas</Button>
		</Card.Footer>
	</Card.Root>
</section>
