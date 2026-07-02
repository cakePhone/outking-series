<script lang="ts">
	import { resolve } from '$app/paths';
	import { signIn, session } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import {
		cta_title,
		cta_desc,
		cta_register,
		hero_cta_logged_out,
		cta_view_teams
	} from '$lib/paraglide/messages';

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
			<Card.Title class="text-2xl">{cta_title()}</Card.Title>
			<Card.Description>
				{cta_desc()}
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<Button onclick={handleClick}>
				{$session.data?.user ? cta_register() : hero_cta_logged_out()}
			</Button>
			<Button variant="outline" href={resolve('/teams')}>{cta_view_teams()}</Button>
		</Card.Footer>
	</Card.Root>
</section>
