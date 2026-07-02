<script lang="ts">
	import Flag from '@lucide/svelte/icons/flag';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Rocket from '@lucide/svelte/icons/rocket';
	import * as Card from '$lib/components/ui/card';
	import {
		history_title,
		history_desc,
		history_foundation,
		history_foundation_desc,
		history_first_season,
		history_first_season_desc,
		history_future,
		history_future_desc
	} from '$lib/paraglide/messages';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">{history_title()}</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		{history_desc()}
	</p>

	<div class="grid gap-6 md:grid-cols-3">
		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Flag class="size-5 text-primary" />
				</div>
				<Card.Title>{history_foundation()}</Card.Title>
				<Card.Description>
					{history_foundation_desc()}
				</Card.Description>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Trophy class="size-5 text-primary" />
				</div>
				<Card.Title>{history_first_season()}</Card.Title>
				<Card.Description>
					{history_first_season_desc()}
				</Card.Description>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
					<Rocket class="size-5 text-primary" />
				</div>
				<Card.Title>{history_future()}</Card.Title>
				<Card.Description>
					{history_future_desc()}
				</Card.Description>
			</Card.Content>
		</Card.Root>
	</div>
</section>
