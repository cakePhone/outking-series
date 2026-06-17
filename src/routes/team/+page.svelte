<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>As Minhas Equipas — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-3xl">As Minhas Equipas</h1>
	<p class="mb-8 text-text-muted">Submissões de equipas que fizeste.</p>

	{#if data.submissions.length === 0}
		<div class="card flex flex-col items-center gap-4 p-8 text-center">
			<p class="text-text-muted">Ainda não tens nenhuma equipa registada.</p>
			<a
				href="/register"
				class="rounded-lg bg-primary px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-primary-hover"
			>
				Registar Equipa
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.submissions as s}
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
							<p class="text-sm text-text-muted">Tag: {d.team_tag}</p>
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
								{#each d.players ?? [] as p}
									<br />· {p.display_name || '—'} ({p.discord})
								{/each}
							</p>
							{#if d.staff?.length}
								<p>
									<span class="text-text-muted">Staff ({d.staff.length}):</span>
									{#each d.staff as st}
										<br />· {st.display_name || '—'} — {st.role}
									{/each}
								</p>
							{/if}
							{#if d.team_socials}
								<p><span class="text-text-muted">Redes:</span> {d.team_socials}</p>
							{/if}
						</div>
					</details>
				</div>
			{/each}

			<a
				href="/register"
				class="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white no-underline transition-colors hover:bg-primary-hover"
			>
				+ Nova Equipa
			</a>
		</div>
	{/if}
</div>
