<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { teamRegisterSchema } from '$lib/validators/team-register';
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';
	import type { TeamRegisterForm } from '$lib/validators/team-register';

	let { data }: PageProps = $props();

	const {
		form: formData,
		errors,
		enhance,
		message: flashMessage,
		validate
	} = superForm(data.form, {
		validators: zod4(teamRegisterSchema),
		dataType: 'json'
	});

	const roles: { value: string; label: string }[] = [
		{ value: 'owner', label: 'Dono' },
		{ value: 'coach', label: 'Coach' },
		{ value: 'player', label: 'Jogador' }
	];

	const staffRoles: { value: string; label: string }[] = [
		{ value: 'coach', label: 'Coach' },
		{ value: 'analyst', label: 'Analista' }
	];

	let step = $state(0);

	const stepLabels = ['Criador', 'Equipa', 'Jogadores', 'Equipa Técnica', 'Rever'];

	function addPlayer() {
		$formData.players = [...$formData.players, { discord: '', riot_id: '', display_name: '' }];
	}

	function removePlayer(i: number) {
		$formData.players = $formData.players.filter((_, idx) => idx !== i);
	}

	function addStaff() {
		$formData.staff = [
			...$formData.staff,
			{ discord: '', riot_id: '', display_name: '', role: 'coach' as const }
		];
	}

	function removeStaff(i: number) {
		$formData.staff = $formData.staff.filter((_, idx) => idx !== i);
	}

	// Pre-fill first player slot when creator selects "Jogador"
	$effect(() => {
		const first = $formData.players[0];
		if (
			$formData.creator_role === 'player' &&
			first &&
			!first.discord &&
			!first.riot_id &&
			!first.display_name
		) {
			first.discord = data.userDiscord;
			first.riot_id = $formData.creator_riot_id;
		}
	});

	const stepFields: Record<number, (keyof TeamRegisterForm)[]> = {
		0: ['creator_riot_id', 'creator_role'],
		1: ['team_name', 'team_tag'],
		2: ['players'],
		3: [],
		4: []
	};

	async function nextStep() {
		const fields = stepFields[step];
		if (fields?.length) {
			for (const field of fields) {
				await validate(field, { update: true });
			}
			if (fields.some((f) => $errors[f])) return;
		}
		step++;
	}
</script>

<svelte:head>
	<title>Registo de Equipa — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-center text-3xl">Registo de Equipa</h1>
	<p class="mb-8 text-center text-[#aaa]">
		Inscreve a tua equipa para participar nos torneios da OutKing Series.
	</p>

	{#if !data.isMember}
		<div class="card flex flex-col items-center gap-4 p-8 text-center">
			<Icon icon="mdi:discord" height="48" class="text-[#5865F2]" />
			<p class="text-lg">
				Parece que ainda não fazes parte do servidor da Outking, apenas membros do servidor podem
				participar:
			</p>
			<a
				href={data.inviteUrl}
				target="_blank"
				rel="external noopener noreferrer"
				class="rounded-lg bg-[#5865F2] px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-[#4752C4]"
			>
				Entrar no Servidor
			</a>
		</div>
	{:else}
		<!-- Step progress -->
		<div class="mb-8 flex gap-1">
			{#each stepLabels as label, i}
				<button
					class="flex-1 cursor-pointer rounded-full border-0 px-2 py-2 text-center text-xs transition-colors"
					class:bg-[#5865F2]={i <= step}
					class:text-white={i <= step}
					class:bg-[rgba(255,255,255,0.06)]={i > step}
					class:text-[#666]={i > step}
					onclick={async () => {
						if (i > step) {
							for (let s = step; s < i; s++) {
								const fields = stepFields[s];
								if (fields?.length) {
									for (const field of fields) {
										await validate(field, { update: true });
									}
									if (fields.some((f) => $errors[f])) return;
								}
							}
						}
						step = i;
					}}
				>
					{label}
				</button>
			{/each}
		</div>

		<form method="POST" use:enhance class="card p-8">
			{#if $flashMessage}
				<div
					class="mb-6 rounded-lg p-3 text-sm"
					class:bg-[rgba(0,255,0,0.1)]={$flashMessage.type === 'success'}
					class:text-[#4f4]={$flashMessage.type === 'success'}
					class:bg-[rgba(255,0,0,0.1)]={$flashMessage.type === 'error'}
					class:text-[#f44]={$flashMessage.type === 'error'}
				>
					{$flashMessage.text}
				</div>
			{/if}

			<!-- Step 0: Creator -->
			{#if step === 0}
				<h2 class="mb-6 text-xl">Quem cria a equipa</h2>

				<div class="mb-4 flex flex-col gap-1">
					<span class="text-sm text-[#aaa]">Discord</span>
					<input
						type="text"
						value={data.userDiscord}
						disabled
						class="rounded-lg border border-[rgba(170,170,170,0.15)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-[#888] outline-none"
					/>
				</div>

				<label class="mb-4 flex flex-col gap-1">
					<span class="text-sm text-[#aaa]"
						>Riot ID (Nome#Tag) <span class="text-[#f44]">*</span></span
					>
					<input
						type="text"
						name="creator_riot_id"
						bind:value={$formData.creator_riot_id}
						placeholder="Ex: OutKing#1234"
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
					/>
					{#if $errors.creator_riot_id}
						<span class="text-sm text-[#f44]">{$errors.creator_riot_id}</span>
					{/if}
				</label>

				<label class="flex flex-col gap-1">
					<span class="text-sm text-[#aaa]">Cargo na equipa <span class="text-[#f44]">*</span></span
					>
					<select
						name="creator_role"
						bind:value={$formData.creator_role}
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
					>
						<option value="">Seleciona...</option>
						{#each roles as r}
							<option value={r.value}>{r.label}</option>
						{/each}
					</select>
					{#if $errors.creator_role}
						<span class="text-sm text-[#f44]">{$errors.creator_role}</span>
					{/if}
				</label>
			{/if}

			<!-- Step 1: Team info -->
			{#if step === 1}
				<h2 class="mb-6 text-xl">Sobre a equipa</h2>

				<label class="mb-4 flex flex-col gap-1">
					<span class="text-sm text-[#aaa]">Nome da equipa <span class="text-[#f44]">*</span></span>
					<input
						type="text"
						name="team_name"
						bind:value={$formData.team_name}
						placeholder="Ex: OutKing Dragons"
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
					/>
					{#if $errors.team_name}
						<span class="text-sm text-[#f44]">{$errors.team_name}</span>
					{/if}
				</label>

				<label class="mb-4 flex flex-col gap-1">
					<span class="text-sm text-[#aaa]"
						>Tag (2-5 carateres) <span class="text-[#f44]">*</span></span
					>
					<input
						type="text"
						name="team_tag"
						bind:value={$formData.team_tag}
						placeholder="Ex: OKD"
						maxlength="5"
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 uppercase transition-colors outline-none focus:border-[#5865F2]"
					/>
					{#if $errors.team_tag}
						<span class="text-sm text-[#f44]">{$errors.team_tag}</span>
					{/if}
				</label>

				<label class="mb-4 flex flex-col gap-1">
					<span class="text-sm text-[#aaa]">Logo (URL)</span>
					<input
						type="url"
						name="team_logo_url"
						bind:value={$formData.team_logo_url}
						placeholder="https://..."
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
					/>
					{#if $errors.team_logo_url}
						<span class="text-sm text-[#f44]">{$errors.team_logo_url}</span>
					{/if}
				</label>

				<label class="flex flex-col gap-1">
					<span class="text-sm text-[#aaa]">Redes sociais (opcional)</span>
					<input
						type="text"
						name="team_socials"
						bind:value={$formData.team_socials}
						placeholder="Ex: @outking no X, /outking no Discord"
						class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
					/>
				</label>
			{/if}

			<!-- Step 2: Players -->
			{#if step === 2}
				<h2 class="mb-6 text-xl">Jogadores <span class="text-[#f44]">*</span></h2>
				<p class="mb-4 text-sm text-[#aaa]">
					Adiciona os jogadores da equipa (até 7, incluindo suplentes).
				</p>

				{#each $formData.players as _, i}
					<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm text-[#aaa]">Jogador {i + 1}</span>
							{#if $formData.players.length > 1}
								<button
									type="button"
									class="cursor-pointer border-0 bg-transparent p-1 text-[#f44]"
									onclick={() => removePlayer(i)}
								>
									<Icon icon="mdi:close" height="18" />
								</button>
							{/if}
						</div>
						<input
							type="text"
							name="players[{i}].discord"
							bind:value={$formData.players[i].discord}
							placeholder="Discord (Ex: @username) *"
							class="mb-1 w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.players?.[i]?.discord}
							<span class="mb-2 block text-sm text-[#f44]">{$errors.players[i].discord}</span>
						{/if}
						<input
							type="text"
							name="players[{i}].riot_id"
							bind:value={$formData.players[i].riot_id}
							placeholder="Riot ID (Ex: Nome#Tag) *"
							class="mb-1 w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.players?.[i]?.riot_id}
							<span class="mb-2 block text-sm text-[#f44]">{$errors.players[i].riot_id}</span>
						{/if}
						<input
							type="text"
							name="players[{i}].display_name"
							bind:value={$formData.players[i].display_name}
							placeholder="Nome para os casters *"
							class="w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.players?.[i]?.display_name}
							<span class="block text-sm text-[#f44]">{$errors.players[i].display_name}</span>
						{/if}
					</div>
				{/each}

				{#if $errors.players?._errors}
					<span class="mb-2 block text-sm text-[#f44]">
						{$errors.players._errors.join(', ')}
					</span>
				{/if}

				{#if $formData.players.length < 7}
					<button
						type="button"
						class="cursor-pointer rounded-lg border border-dashed border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm text-[#aaa] transition-colors hover:border-[#5865F2] hover:text-[#5865F2]"
						onclick={addPlayer}
					>
						+ Adicionar jogador
					</button>
				{/if}
			{/if}

			<!-- Step 3: Staff -->
			{#if step === 3}
				<h2 class="mb-6 text-xl">Equipa Técnica</h2>
				<p class="mb-4 text-sm text-[#aaa]">Adiciona coach e/ou analista (opcional).</p>

				{#each $formData.staff as _, i}
					<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm text-[#aaa]">Staff {i + 1}</span>
							<button
								type="button"
								class="cursor-pointer border-0 bg-transparent p-1 text-[#f44]"
								onclick={() => removeStaff(i)}
							>
								<Icon icon="mdi:close" height="18" />
							</button>
						</div>
						<input
							type="text"
							name="staff[{i}].discord"
							bind:value={$formData.staff[i].discord}
							placeholder="Discord (Ex: @username) *"
							class="mb-1 w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.staff?.[i]?.discord}
							<span class="mb-2 block text-sm text-[#f44]">{$errors.staff[i].discord}</span>
						{/if}
						<input
							type="text"
							name="staff[{i}].riot_id"
							bind:value={$formData.staff[i].riot_id}
							placeholder="Riot ID (Ex: Nome#Tag) *"
							class="mb-1 w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.staff?.[i]?.riot_id}
							<span class="mb-2 block text-sm text-[#f44]">{$errors.staff[i].riot_id}</span>
						{/if}
						<input
							type="text"
							name="staff[{i}].display_name"
							bind:value={$formData.staff[i].display_name}
							placeholder="Nome para os casters *"
							class="mb-1 w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						/>
						{#if $errors.staff?.[i]?.display_name}
							<span class="mb-2 block text-sm text-[#f44]">{$errors.staff[i].display_name}</span>
						{/if}
						<select
							name="staff[{i}].role"
							bind:value={$formData.staff[i].role}
							class="w-full rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm transition-colors outline-none focus:border-[#5865F2]"
						>
							<option value="">Cargo... *</option>
							{#each staffRoles as r}
								<option value={r.value}>{r.label}</option>
							{/each}
						</select>
						{#if $errors.staff?.[i]?.role}
							<span class="block text-sm text-[#f44]">{$errors.staff[i].role}</span>
						{/if}
					</div>
				{/each}

				<button
					type="button"
					class="cursor-pointer rounded-lg border border-dashed border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 text-sm text-[#aaa] transition-colors hover:border-[#5865F2] hover:text-[#5865F2]"
					onclick={addStaff}
				>
					+ Adicionar staff
				</button>
			{/if}

			<!-- Step 4: Review -->
			{#if step === 4}
				<h2 class="mb-6 text-xl">Rever inscrição</h2>

				<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
					<h3 class="mb-2 text-sm text-[#aaa]">Quem cria</h3>
					<p><strong>Discord:</strong> {data.userDiscord}</p>
					<p><strong>Riot ID:</strong> {$formData.creator_riot_id || '—'}</p>
					<p>
						<strong>Cargo:</strong>
						{roles.find((r) => r.value === $formData.creator_role)?.label ?? '—'}
					</p>
				</div>

				<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
					<h3 class="mb-2 text-sm text-[#aaa]">Equipa</h3>
					<p><strong>Nome:</strong> {$formData.team_name || '—'}</p>
					<p><strong>Tag:</strong> {$formData.team_tag || '—'}</p>
					{#if $formData.team_logo_url}
						<p><strong>Logo:</strong> {$formData.team_logo_url}</p>
					{/if}
					{#if $formData.team_socials}
						<p><strong>Redes:</strong> {$formData.team_socials}</p>
					{/if}
				</div>

				<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
					<h3 class="mb-2 text-sm text-[#aaa]">
						Jogadores ({$formData.players.length})
					</h3>
					{#each $formData.players as p, i}
						<p class="text-sm">
							{i + 1}. {p.display_name || '—'} ({p.discord || '—'})
						</p>
					{/each}
				</div>

				{#if $formData.staff.length > 0}
					<div class="mb-4 rounded-lg bg-[rgba(255,255,255,0.03)] p-4">
						<h3 class="mb-2 text-sm text-[#aaa]">
							Equipa Técnica ({$formData.staff.length})
						</h3>
						{#each $formData.staff as st, i}
							<p class="text-sm">
								{i + 1}. {st.display_name || '—'} — {staffRoles.find((r) => r.value === st.role)
									?.label ?? '—'}
							</p>
						{/each}
					</div>
				{/if}
			{/if}

			<!-- Navigation -->
			<div class="mt-8 flex justify-between">
				{#if step > 0}
					<button
						type="button"
						class="cursor-pointer rounded-lg border-0 bg-[rgba(255,255,255,0.08)] px-6 py-3 text-sm transition-colors hover:bg-[rgba(255,255,255,0.14)]"
						onclick={() => (step = step - 1)}
					>
						← Anterior
					</button>
				{:else}
					<div></div>
				{/if}

				{#if step < 4}
					<button
						type="button"
						class="cursor-pointer rounded-lg bg-[#5865F2] px-6 py-3 text-sm transition-colors hover:bg-[#4752C4]"
						onclick={nextStep}
					>
						Seguinte →
					</button>
				{:else}
					<button
						type="submit"
						class="cursor-pointer rounded-lg bg-[#5865F2] px-8 py-3 font-semibold transition-colors hover:bg-[#4752C4]"
					>
						Submeter Inscrição
					</button>
				{/if}
			</div>
		</form>
	{/if}
</div>
