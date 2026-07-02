<script lang="ts">
	import type { PageProps } from './$types';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import UsersIcon from '@lucide/svelte/icons/users';
	import {
		page_title_my_teams,
		my_teams_title,
		my_teams_desc,
		my_teams_empty,
		my_teams_new,
		my_teams_submitted,
		my_teams_details,
		status_pending,
		status_approved,
		status_recusado,
		fallback_team_name,
		label_creator,
		register_review_players,
		register_review_staff,
		register_label_socials,
		register_label_tag
	} from '$lib/paraglide/messages';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{page_title_my_teams()}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">{my_teams_title()}</h1>
	<p class="mb-8 text-text-muted">{my_teams_desc()}</p>

	{#if data.submissions.length === 0}
		<Empty.Root>
			<Empty.Media variant="icon">
				<UsersIcon />
			</Empty.Media>
			<Empty.Description>{my_teams_empty()}</Empty.Description>
			<Empty.Content>
				<Button href="/register">{my_teams_new()}</Button>
			</Empty.Content>
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
								<p class="text-sm text-text-muted">{register_label_tag()} {d.team_tag}</p>
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

						<div class="text-sm text-text-muted">
							{my_teams_submitted({ date: new Date(s.createdAt).toLocaleDateString('pt-PT') })}
						</div>

						<details class="text-sm">
							<summary class="cursor-pointer text-text-muted">{my_teams_details()}</summary>
							<div class="mt-2 flex flex-col gap-2 pl-4">
								<p>
									<span class="text-text-muted">{label_creator()}</span>
									{d.creator_riot_id} ({d.creator_role})
								</p>
								<p>
									<span class="text-text-muted"
										>{register_review_players({ n: d.players?.length ?? 0 })}</span
									>
									{#each d.players ?? [] as p, i (`player-${i}`)}
										<br />&middot; {p.display_name || '—'} ({p.discord})
									{/each}
								</p>
								{#if d.staff?.length}
									<p>
										<span class="text-text-muted"
											>{register_review_staff({ n: d.staff.length })}</span
										>
										{#each d.staff as st, i (`staff-${i}`)}
											<br />&middot; {st.display_name || '—'} — {st.role}
										{/each}
									</p>
								{/if}
								{#if d.team_socials}
									<p>
										<span class="text-text-muted">{register_label_socials()}</span>
										{d.team_socials}
									</p>
								{/if}
							</div>
						</details>
					</Card.Content>
				</Card.Root>
			{/each}

			<Button href="/register">+ {my_teams_new()}</Button>
		</div>
	{/if}
</div>
