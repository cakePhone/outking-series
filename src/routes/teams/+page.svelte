<script lang="ts">
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let expandedSeasons = $state<string[]>(
		data.seasons.filter((s) => s.endDate === null).map((s) => s.id.toString())
	);

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

	<Tooltip.Provider delayDuration={500}>
		<Accordion.Root type="multiple" bind:value={expandedSeasons}>
			{#each data.seasons as s (s.id)}
				{@const teams = filteredTeams(s.teams)}

				<Accordion.Item value={s.id.toString()}>
					<Accordion.Trigger>
						<div>
							<h2 class="text-xl font-semibold">{s.title}</h2>
							<p class="text-sm text-text-muted">
								{fmtDate(s.startDate)} - {fmtDate(s.endDate)}
							</p>
						</div>
					</Accordion.Trigger>
					<Accordion.Content>
						<!-- Search -->
						<div class="mt-4 mb-6">
							<Input bind:value={searchQuery} placeholder="Procurar equipa..." class="max-w-sm" />
						</div>

						{#if teams.length === 0}
							<p class="text-sm text-text-muted">
								{searchQuery ? 'Nenhuma equipa encontrada.' : 'Nenhuma equipa nesta época.'}
							</p>
						{/if}

						<div class="grid gap-4 sm:grid-cols-2">
							{#each teams as team (team.id)}
								<Card.Root>
									<Card.Content>
										<div class="mb-3 flex items-center gap-3">
											<Avatar.Root class="size-10 rounded-lg">
												{#if team.logoUrl}
													<Avatar.Image src={team.logoUrl} alt={team.name} />
												{/if}
												<Avatar.Fallback>
													{team.tag.slice(0, 2).toUpperCase()}
												</Avatar.Fallback>
											</Avatar.Root>
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

										<!-- Roster -->
										<div class="flex flex-wrap gap-1.5">
											{#each team.roster as p (p.playerId)}
												<Tooltip.Root>
													<Tooltip.Trigger>
														<Badge variant="secondary">
															<span class="text-text-dim">{roleLabel[p.role] ?? p.role}:</span>
															<span class="font-medium">{p.displayName}</span>
														</Badge>
													</Tooltip.Trigger>
													<Tooltip.Content>
														{p.role}: {p.displayName} ({p.riotId})
													</Tooltip.Content>
												</Tooltip.Root>
											{/each}
										</div>
									</Card.Content>
								</Card.Root>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</Tooltip.Provider>
</div>
