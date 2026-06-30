<script lang="ts">
	import type { PageProps } from './$types';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import UsersIcon from '@lucide/svelte/icons/users';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>As Minhas Equipas — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">As Minhas Equipas</h1>
	<p class="mb-8 text-text-muted">Submissões de equipas que fizeste.</p>

	{#if data.submissions.length === 0}
		<Empty.Root>
			<Empty.Media variant="icon">
				<UsersIcon />
			</Empty.Media>
			<Empty.Description>Ainda não tens nenhuma equipa registada.</Empty.Description>
			<Empty.Content>
				<Button href="/register">Registar Equipa</Button>
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
								<h2 class="text-lg">{d.team_name || 'Sem nome'}</h2>
								<p class="text-sm text-text-muted">Tag: {d.team_tag}</p>
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

						<div class="text-sm text-text-muted">
							Submetido em {new Date(s.createdAt).toLocaleDateString('pt-PT')}
						</div>

						<details class="text-sm">
							<summary class="cursor-pointer text-text-muted">Ver detalhes</summary>
							<div class="mt-2 flex flex-col gap-2 pl-4">
								<p>
									<span class="text-text-muted">Criador:</span>
									{d.creator_riot_id} ({d.creator_role})
								</p>
								<p>
									<span class="text-text-muted">Jogadores ({d.players?.length ?? 0}):</span>
									{#each d.players ?? [] as p, i (`player-${i}`)}
										<br />· {p.display_name || '—'} ({p.discord})
									{/each}
								</p>
								{#if d.staff?.length}
									<p>
										<span class="text-text-muted">Staff ({d.staff.length}):</span>
										{#each d.staff as st, i (`staff-${i}`)}
											<br />· {st.display_name || '—'} — {st.role}
										{/each}
									</p>
								{/if}
								{#if d.team_socials}
									<p><span class="text-text-muted">Redes:</span> {d.team_socials}</p>
								{/if}
							</div>
						</details>
					</Card.Content>
				</Card.Root>
			{/each}

			<Button href="/register">+ Nova Equipa</Button>
		</div>
	{/if}
</div>
