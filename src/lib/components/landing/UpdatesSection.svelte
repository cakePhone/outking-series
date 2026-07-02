<script lang="ts">
	import Users from '@lucide/svelte/icons/users';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import DiscordIcon from '$lib/components/icons/DiscordIcon.svelte';
	import * as Card from '$lib/components/ui/card';
	import {
		updates_title,
		updates_desc,
		updates_coming_soon,
		updates_next_season,
		updates_next_season_desc,
		updates_ongoing,
		updates_registration_open,
		updates_registration_open_desc,
		updates_community,
		updates_discord,
		updates_discord_desc,
		updates_footer
	} from '$lib/paraglide/messages';
</script>

<section class="bg-section py-24">
	<div class="mx-auto flex max-w-5xl flex-col gap-4 px-4">
		<h2 class="text-center text-3xl font-bold">{updates_title()}</h2>
		<p class="mx-auto max-w-2xl text-center text-text-muted">
			{updates_desc()}
		</p>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Sparkles class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">{updates_coming_soon()}</span>
					<Card.Title>{updates_next_season()}</Card.Title>
					<Card.Description>
						{updates_next_season_desc()}
					</Card.Description>
				</Card.Content>
			</Card.Root>

			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<Users class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">{updates_ongoing()}</span>
					<Card.Title>{updates_registration_open()}</Card.Title>
					<Card.Description>
						{updates_registration_open_desc()}
					</Card.Description>
				</Card.Content>
			</Card.Root>

			<Card.Root class="overflow-hidden">
				<div class="flex h-32 items-center justify-center bg-primary/10">
					<DiscordIcon class="size-12 text-primary/40" />
				</div>
				<Card.Content class="flex flex-col gap-2">
					<span class="text-xs text-text-dim">{updates_community()}</span>
					<Card.Title>{updates_discord()}</Card.Title>
					<Card.Description>
						{updates_discord_desc()}
					</Card.Description>
				</Card.Content>
			</Card.Root>
		</div>

		<p class="mt-8 text-center text-sm text-text-dim">
			{updates_footer()}
		</p>
	</div>
</section>
