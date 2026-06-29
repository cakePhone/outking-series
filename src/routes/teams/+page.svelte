<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let expandedSeasons = new SvelteSet<number>();

	// Expand ongoing seasons by default
	$effect(() => {
		expandedSeasons.clear();
		for (const s of data.seasons) {
			if (s.endDate === null) expandedSeasons.add(s.id);
		}
	});

	function toggleSeason(id: number) {
		if (expandedSeasons.has(id)) {
			expandedSeasons.delete(id);
		} else {
			expandedSeasons.add(id);
		}
	}

	function filteredTeams(teams: (typeof data.seasons)[0]['teams']) {
		if (!searchQuery.trim()) return teams;
		const q = searchQuery.toLowerCase();
		return teams.filter((t) => t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q));
	}

	function fmtDate(d: Date | null): string {
		if (d === null) return 'Ongoing';
		return d.toLocaleDateString('pt-PT', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	const roleLabel: Record<string, string> = {
		player: 'Jogador',
		substitute: 'Suplente',
		coach: 'Treinador',
		owner: 'Dono'
	};
</script>

<div class="mx-auto max-w-5xl px-4 pt-24 pb-16">
	<h1 class="mb-10 text-center text-4xl font-bold">Equipas</h1>

	{#if data.seasons.length === 0}
		<p class="text-center text-text-muted">Nenhuma época encontrada.</p>
	{/if}

	{#each data.seasons as s (s.id)}
		{@const isExpanded = expandedSeasons.has(s.id)}
		{@const teams = filteredTeams(s.teams)}

		<!-- Season card (level 0) -->
		<div class="card mb-6 overflow-hidden">
			<button
				class="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-6 py-4 text-left"
				onclick={() => toggleSeason(s.id)}
				aria-expanded={isExpanded}
			>
				<div>
					<h2 class="text-xl font-semibold">{s.title}</h2>
					<p class="text-sm text-text-muted">
						{fmtDate(s.startDate)} - {fmtDate(s.endDate)}
					</p>
				</div>
				<svg
					class="h-5 w-5 transition-transform"
					class:rotate-180={isExpanded}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if isExpanded}
				<div class="border-t border-border px-6 pb-6">
					<!-- Search -->
					<div class="mt-4 mb-6">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Procurar equipa..."
							class="w-full max-w-sm rounded-lg border border-border bg-transparent px-4 py-2 text-sm transition-colors outline-none focus:border-primary"
						/>
					</div>

					{#if teams.length === 0}
						<p class="text-sm text-text-muted">
							{searchQuery ? 'Nenhuma equipa encontrada.' : 'Nenhuma equipa nesta época.'}
						</p>
					{/if}

					<div class="grid gap-4 sm:grid-cols-2">
						{#each teams as team (team.id)}
							<!-- Team card (level 1) -->
							<div class="card bg-section p-4">
								<div class="mb-3 flex items-center gap-3">
									{#if team.logoUrl}
										<img
											src={team.logoUrl}
											alt={team.name}
											class="h-10 w-10 rounded-lg object-cover"
										/>
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-button-ghost text-lg font-bold text-text-muted"
										>
											{team.tag.slice(0, 2).toUpperCase()}
										</div>
									{/if}
									<div>
										<h3 class="font-semibold">{team.name}</h3>
										<span class="text-sm text-text-muted">[{team.tag}]</span>
									</div>
									<div class="ml-auto text-right text-sm text-text-dim">
										<span class="font-semibold text-success">{team.wins}W</span>
										<span class="mx-1">-</span>
										<span class="font-semibold text-error">{team.losses}L</span>
										{#if team.matchesPlayed > 0}
											<div class="text-xs text-text-muted">{team.matchesPlayed} jogos</div>
										{/if}
									</div>
								</div>

								<!-- Roster (inline badges, NOT cards) -->
								<div class="flex flex-wrap gap-1.5">
									{#each team.roster as p (p.playerId)}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-button-ghost px-2 py-0.5 text-xs"
											title="{p.role}: {p.displayName} ({p.riotId})"
										>
											<span class="text-text-dim">{roleLabel[p.role] ?? p.role}:</span>
											<span class="font-medium">{p.displayName}</span>
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
