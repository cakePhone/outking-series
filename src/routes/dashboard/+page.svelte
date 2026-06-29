<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard - OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">Dashboard</h1>
	<p class="mb-8 text-text-muted">Submissões de equipas para aprovação.</p>

	{#if data.submissions.length === 0}
		<div class="card p-8 text-center text-text-muted">Nenhuma submissão encontrada.</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.submissions as s (s.id)}
				{@const d = s.data}
				<div
					class="card flex flex-col gap-3 p-6"
					class:border-l-4={true}
					class:border-l-error={s.status === 'declined'}
					class:border-l-success={s.status === 'approved'}
					class:border-l-primary={s.status === 'pending'}
				>
					<div class="flex items-start justify-between">
						<div>
							<h2 class="text-lg">{d.team_name || 'Sem nome'}</h2>
							<p class="text-sm text-text-muted">
								Tag: {d.team_tag} · Criador: {d.creator_riot_id} ({d.creator_role})
							</p>
						</div>
						<span
							class="rounded-full px-3 py-1 text-xs capitalize {s.status === 'pending'
								? 'bg-primary/15 text-primary'
								: s.status === 'approved'
									? 'bg-success-bg text-success'
									: 'bg-error-bg text-error'}"
						>
							{s.status === 'pending'
								? 'Pendente'
								: s.status === 'approved'
									? 'Aprovado'
									: 'Recusado'}
						</span>
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
								<a href={d.team_logo_url} target="_blank" rel="external noopener noreferrer">ver</a>
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
								<button
									type="submit"
									class="cursor-pointer rounded-lg bg-success px-4 py-2 text-sm text-white transition-colors hover:bg-[#3a3]"
								>
									Aprovar
								</button>
							</form>
							<form method="POST" action="?/decline" use:enhance>
								<input type="hidden" name="id" value={s.id} />
								<button
									type="submit"
									class="cursor-pointer rounded-lg bg-error px-4 py-2 text-sm text-white transition-colors hover:bg-[#d33]"
								>
									Recusar
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
