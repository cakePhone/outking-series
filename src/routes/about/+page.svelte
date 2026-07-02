<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
	import {
		page_title_about,
		about_title,
		about_desc,
		about_link_text
	} from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{page_title_about()}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
	<h1 class="mb-4 text-3xl font-bold">{about_title()}</h1>
	<Card.Root class="p-10">
		<Card.Content>
			<p class="text-text-muted">
				{about_desc()}
			</p>
			<p class="mt-4 text-sm text-text-dim">
				{@html about_link_text({
					rules:
						'<a href="' + resolve('/rules') + '" class="text-primary hover:underline">rules</a>',
					teams:
						'<a href="' + resolve('/teams') + '" class="text-primary hover:underline">teams</a>'
				})}
			</p>
		</Card.Content>
	</Card.Root>
</div>
