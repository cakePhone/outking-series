<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import InboxIcon from '@lucide/svelte/icons/inbox';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard - OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">Dashboard</h1>
	<p class="mb-8 text-text-muted">Submissões de equipas para aprovação.</p>

	{#if data.submissions.length === 0}
		<Empty.Root>
			<Empty.Media variant="icon">
				<InboxIcon />
			</Empty.Media>
			<Empty.Description>Nenhuma submissão encontrada.</Empty.Description>
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
								<h2 class="text-lg">{d.team_name || 'Sem nome'}</h2>
								<p class="text-sm text-text-muted">
									Tag: {d.team_tag} · Criador: {d.creator_riot_id} ({d.creator_role})
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
									? 'Pendente'
									: s.status === 'approved'
										? 'Aprovado'
										: 'Recusado'}
							</Badge>
						</div>

						<div class="grid grid-cols-3 gap-2 text-sm">
							<div>
								<span class="text-text-muted">Jogadores:</span>
								{d.players?.length ?? 0}
							</div>
							<div>
								<span class="text-text-muted">Staff:</span>
								{d.staff?.length ?? 0}
							</div>
							<div>
								<span class="text-text-muted">Logo:</span>
								{#if d.team_logo_url}
									<a href={d.team_logo_url} target="_blank" rel="external noopener noreferrer"
										>ver</a
									>
								{:else}—{/if}
							</div>
						</div>

						{#if d.team_socials}
							<p class="text-sm">
								<span class="text-text-muted">Redes:</span>
								{d.team_socials}
							</p>
						{/if}

						<!-- Players list -->
						<details class="text-sm">
							<summary class="cursor-pointer text-text-muted"
								>Jogadores ({d.players?.length ?? 0})</summary
							>
							<ul class="mt-2 flex flex-col gap-1 pl-4">
								{#each d.players ?? [] as p, i (`player-${i}`)}
									<li>{p.display_name || '—'} ({p.discord || '—'})</li>
								{/each}
							</ul>
						</details>

						{#if d.staff?.length}
							<details class="text-sm">
								<summary class="cursor-pointer text-text-muted">Staff ({d.staff.length})</summary>
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
									<Button type="submit" variant="default">Aprovar</Button>
								</form>
								<form method="POST" action="?/decline" use:enhance>
									<input type="hidden" name="id" value={s.id} />
									<Button type="submit" variant="destructive">Recusar</Button>
								</form>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
