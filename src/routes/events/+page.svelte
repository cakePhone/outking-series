<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
	import {
		page_title_events,
		events_title,
		events_desc,
		events_link_text
	} from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{page_title_events()}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-4 text-3xl font-bold">{events_title()}</h1>
	<Card.Root>
		<Card.Content class="flex flex-col gap-4 p-4">
			<p class="text-text-muted">
				{events_desc()}
			</p>
			<p class="text-sm text-text-dim">
				{@html events_link_text({
					teams:
						'<a href="' + resolve('/teams') + '" class="text-primary hover:underline">teams</a>'
				})}
			</p>
		</Card.Content>
	</Card.Root>
</div>
