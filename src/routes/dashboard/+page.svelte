<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import {
		page_title_dashboard,
		dashboard_title,
		dashboard_desc,
		dashboard_empty,
		dashboard_approve,
		dashboard_decline,
		status_pending,
		status_approved,
		status_recusado,
		fallback_team_name,
		fallback_view_logo,
		label_creator,
		label_players_count,
		label_staff_count,
		register_label_tag,
		register_label_logo,
		register_label_socials,
		register_review_players,
		register_review_staff
	} from '$lib/paraglide/messages';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{page_title_dashboard()}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">{dashboard_title()}</h1>
	<p class="mb-8 text-text-muted">{dashboard_desc()}</p>

	{#if data.submissions.length === 0}
		<Empty.Root>
			<Empty.Media variant="icon">
				<InboxIcon />
			</Empty.Media>
			<Empty.Description>{dashboard_empty()}</Empty.Description>
		</Empty.Root>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.submissions as s (s.id)}
				{@const d = s.data}
				<Card.Root
					class={cn(
						'border-l-4',
						s.status === 'declined' && 'border-l-error',
						s.status === 'approved' && 'border-l-success',
						s.status === 'pending' && 'border-l-primary'
					)}
				>
					<Card.Content class="flex flex-col gap-3">
						<div class="flex items-start justify-between">
							<div>
								<h2 class="text-lg">{d.team_name || fallback_team_name()}</h2>
								<p class="text-sm text-text-muted">
									{register_label_tag()}
									{d.team_tag} &middot; {label_creator()}
									{d.creator_riot_id} ({d.creator_role})
								</p>
							</div>
							<Badge
								variant={s.status === 'pending'
									? 'default'
									: s.status === 'approved'
										? 'secondary'
										: 'destructive'}
							>
								{s.status === 'pending'
									? status_pending()
									: s.status === 'approved'
										? status_approved()
										: status_recusado()}
							</Badge>
						</div>

						<div class="grid grid-cols-3 gap-2 text-sm">
							<div>
								<span class="text-text-muted">{label_players_count()}</span>
								{d.players?.length ?? 0}
							</div>
							<div>
								<span class="text-text-muted">{label_staff_count()}</span>
								{d.staff?.length ?? 0}
							</div>
							<div>
								<span class="text-text-muted">{register_label_logo()}</span>
								{#if d.team_logo_url}
									<a href={d.team_logo_url} target="_blank" rel="external noopener noreferrer"
										>{fallback_view_logo()}</a
									>
								{:else}—{/if}
							</div>
						</div>

						{#if d.team_socials}
							<p class="text-sm">
								<span class="text-text-muted">{register_label_socials()}</span>
								{d.team_socials}
							</p>
						{/if}

						<!-- Players list -->
						<details class="text-sm">
							<summary class="cursor-pointer text-text-muted"
								>{register_review_players({ n: d.players?.length ?? 0 })}</summary
							>
							<ul class="mt-2 flex flex-col gap-1 pl-4">
								{#each d.players ?? [] as p, i (`player-${i}`)}
									<li>{p.display_name || '—'} ({p.discord || '—'})</li>
								{/each}
							</ul>
						</details>

						{#if d.staff?.length}
							<details class="text-sm">
								<summary class="cursor-pointer text-text-muted"
									>{register_review_staff({ n: d.staff.length })}</summary
								>
								<ul class="mt-2 flex flex-col gap-1 pl-4">
									{#each d.staff as st, i (`staff-${i}`)}
										<li>{st.display_name || '—'} — {st.role || '—'}</li>
									{/each}
								</ul>
							</details>
						{/if}

						{#if s.status === 'pending'}
							<div class="flex gap-2">
								<form method="POST" action="?/approve" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<Button type="submit" variant="default">{dashboard_approve()}</Button>
								</form>
								<form method="POST" action="?/decline" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<Button type="submit" variant="destructive">{dashboard_decline()}</Button>
								</form>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
