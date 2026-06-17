<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">Dashboard</h1>
	<p class="mb-8 text-[#aaa]">Submissões de equipas para aprovação.</p>

	{#if data.submissions.length === 0}
		<div class="card p-8 text-center text-[#aaa]">Nenhuma submissão encontrada.</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.submissions as s}
				{@const d = s.data}
				<div
					class="card flex flex-col gap-3 p-6"
					class:border-l-4={true}
					class:border-l-[#f44]={s.status === 'declined'}
					class:border-l-[#4f4]={s.status === 'approved'}
					class:border-l-[#5865F2]={s.status === 'pending'}
				>
					<div class="flex items-start justify-between">
						<div>
							<h2 class="text-lg">{d.team_name || 'Sem nome'}</h2>
							<p class="text-sm text-[#aaa]">
								Tag: {d.team_tag} · Criador: {d.creator_riot_id} ({d.creator_role})
							</p>
						</div>
						<span
							class="rounded-full px-3 py-1 text-xs capitalize"
							class:bg-[rgba(88,101,242,0.15)]={s.status === 'pending'}
							class:text-[#5865F2]={s.status === 'pending'}
							class:bg-[rgba(0,255,0,0.1)]={s.status === 'approved'}
							class:text-[#4f4]={s.status === 'approved'}
							class:bg-[rgba(255,0,0,0.1)]={s.status === 'declined'}
							class:text-[#f44]={s.status === 'declined'}
						>
							{s.status === 'pending' ? 'Pendente' : s.status === 'approved' ? 'Aprovado' : 'Recusado'}
						</span>
					</div>

					<div class="grid grid-cols-3 gap-2 text-sm">
						<div>
							<span class="text-[#aaa]">Jogadores:</span>
							{d.players?.length ?? 0}
						</div>
						<div>
							<span class="text-[#aaa]">Staff:</span>
							{d.staff?.length ?? 0}
						</div>
						<div>
							<span class="text-[#aaa]">Logo:</span>
							{#if d.team_logo_url}
								<a href={d.team_logo_url} target="_blank" rel="external noopener noreferrer"
									>ver</a
								>
							{:else}—{/if}
						</div>
					</div>

					{#if d.team_socials}
						<p class="text-sm">
							<span class="text-[#aaa]">Redes:</span> {d.team_socials}
						</p>
					{/if}

					<!-- Players list -->
					<details class="text-sm">
						<summary class="cursor-pointer text-[#aaa]">Jogadores ({d.players?.length ?? 0})</summary>
						<ul class="mt-2 flex flex-col gap-1 pl-4">
							{#each d.players ?? [] as p}
								<li>{p.display_name || '—'} ({p.discord || '—'})</li>
							{/each}
						</ul>
					</details>

					{#if d.staff?.length}
						<details class="text-sm">
							<summary class="cursor-pointer text-[#aaa]">Staff ({d.staff.length})</summary>
							<ul class="mt-2 flex flex-col gap-1 pl-4">
								{#each d.staff as st}
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
									class="cursor-pointer rounded-lg bg-[#4f4] px-4 py-2 text-sm text-white transition-colors hover:bg-[#3a3]"
								>
									Aprovar
								</button>
							</form>
							<form method="POST" action="?/decline" use:enhance>
								<input type="hidden" name="id" value={s.id} />
								<button
									type="submit"
									class="cursor-pointer rounded-lg bg-[#f44] px-4 py-2 text-sm text-white transition-colors hover:bg-[#d33]"
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
