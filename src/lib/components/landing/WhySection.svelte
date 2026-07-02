<script lang="ts">
	import Swords from '@lucide/svelte/icons/swords';
	import Tv from '@lucide/svelte/icons/tv';
	import Medal from '@lucide/svelte/icons/medal';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import {
		why_title,
		why_desc,
		why_competition,
		why_competition_desc,
		why_broadcast,
		why_broadcast_desc,
		why_recognition,
		why_recognition_desc,
		why_progression,
		why_progression_desc
	} from '$lib/paraglide/messages';
</script>

<section class="mx-auto max-w-5xl px-4 py-24">
	<h2 class="mb-4 text-center text-3xl font-bold">{why_title()}</h2>
	<p class="mx-auto mb-12 max-w-2xl text-center text-text-muted">
		{why_desc()}
	</p>

	<div class="grid gap-8 md:grid-cols-2">
		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Swords class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">{why_competition()}</h3>
				<p class="text-sm text-text-muted">
					{why_competition_desc()}
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Tv class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">{why_broadcast()}</h3>
				<p class="text-sm text-text-muted">
					{why_broadcast_desc()}
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<Medal class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">{why_recognition()}</h3>
				<p class="text-sm text-text-muted">
					{why_recognition_desc()}
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<div class="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/20">
				<TrendingUp class="size-6 text-primary" />
			</div>
			<div>
				<h3 class="text-lg font-semibold">{why_progression()}</h3>
				<p class="text-sm text-text-muted">
					{why_progression_desc()}
				</p>
			</div>
		</div>
	</div>
</section>
