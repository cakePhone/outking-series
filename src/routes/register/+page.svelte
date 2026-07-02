<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { teamRegisterSchema } from '$lib/validators/team-register';
	import X from '@lucide/svelte/icons/x';
	import DiscordIcon from '$lib/components/icons/DiscordIcon.svelte';
	import type { PageProps } from './$types';
	import type { TeamRegisterForm } from '$lib/validators/team-register';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import * as Field from '$lib/components/ui/field';

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

	let step = $state(0);
	let creatorRankError = $state<string | null>(null);
	let checkingCreatorRank = $state(false);

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
			{ discord: '', riot_id: '', display_name: '', role: '' }
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

	// Debounced Riot rank check (when role is 'player' or 'coach')
	let rankTimer: ReturnType<typeof setTimeout>;
	async function checkCreatorRank() {
		clearTimeout(rankTimer);
		if (
			($formData.creator_role !== 'player' && $formData.creator_role !== 'coach') ||
			!$formData.creator_riot_id
		) {
			creatorRankError = null;
			checkingCreatorRank = false;
			return;
		}
		rankTimer = setTimeout(async () => {
			checkingCreatorRank = true;
			creatorRankError = null;
			try {
				const res = await fetch('/api/riot/check-rank', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ riotId: $formData.creator_riot_id })
				});
				const result = await res.json();
				if (!result.passed) {
					switch (result.reason) {
						case 'invalid_format':
							creatorRankError = 'Formato invalido. Usa: Nome#Tag';
							break;
						case 'not_found':
							creatorRankError = 'Riot ID nao encontrado. Verifica o nome e a tag.';
							break;
						case 'unranked':
							creatorRankError = 'Ainda nao tens rank competitivo.';
							break;
						case 'rank_too_low':
							creatorRankError = `Rank atual: ${result.rank}. Minimo exigido: Ascendente 3.`;
							break;
					}
				}
			} catch {
				creatorRankError = null;
			} finally {
				checkingCreatorRank = false;
			}
		}, 600);
	}

	const stepFields: Record<number, (keyof TeamRegisterForm)[]> = {
		0: ['creator_riot_id', 'creator_role'],
		1: ['team_name', 'team_tag'],
		2: ['players'],
		3: ['staff'],
		4: []
	};

	// Debounced validation: re-validates a field 300ms after the user stops typing
	const timers: Record<string, ReturnType<typeof setTimeout>> = {};
	function validateField(field: string) {
		if (timers[field]) clearTimeout(timers[field]);
		timers[field] = setTimeout(() => validate(field, { update: true }), 300);
	}

	// Is the current step blocking advancement?
	const stepBlocked = $derived.by(() => {
		if (checkingCreatorRank) return true;
		if (step === 0 && creatorRankError) return true;

		// Block on empty required fields (before any validation has run)
		if (step === 0) {
			if (!$formData.creator_riot_id.trim() || !$formData.creator_role) return true;
		}
		if (step === 1) {
			if (!$formData.team_name.trim() || !$formData.team_tag.trim()) return true;
		}

		const fields = stepFields[step] ?? [];
		return fields.some((f) => $errors[f] != null);
	});

	function nextStep() {
		step++;
	}
</script>

<svelte:head>
	<title>Registo de Equipa — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-center text-3xl">Registo de Equipa</h1>
	<p class="mb-8 text-center text-text-muted">
		Inscreve a tua equipa para participar nos torneios da OutKing Series.
	</p>

	{#if !data.isMember}
		<Alert.Root>
			<DiscordIcon class="size-12 text-primary" />
			<Alert.Title>Não és membro</Alert.Title>
			<Alert.Description>
				Parece que ainda não fazes parte do servidor da Outking, apenas membros do servidor podem
				participar.
			</Alert.Description>
			<Alert.Action>
				<Button href={data.inviteUrl} target="_blank" rel="external noopener noreferrer">
					Entrar no Servidor
				</Button>
			</Alert.Action>
		</Alert.Root>
	{:else}
		<!-- Step progress -->
		<div class="mb-8 flex gap-1">
			{#each stepLabels as label, i}
				<Button
					variant={i <= step ? 'default' : 'secondary'}
					size="xs"
					class="flex-1"
					onclick={() => {
						// Always allow going back; only allow forward if current step is clear
						if (i <= step || !stepBlocked) step = i;
					}}
				>
					{label}
				</Button>
			{/each}
		</div>

		<Card.Root>
			<Card.Content class="p-8">
				<form method="POST" use:enhance>
					{#if $flashMessage}
						<Alert.Root
							variant={$flashMessage.type === 'error' ? 'destructive' : 'default'}
							class="mb-6"
						>
							<Alert.Description>{$flashMessage.text}</Alert.Description>
						</Alert.Root>
					{/if}

					<!-- Step 0: Creator -->
					{#if step === 0}
						<h2 class="mb-6 text-xl">Quem cria a equipa</h2>

						<Field.FieldGroup>
							<Field.Field data-disabled>
								<Field.FieldLabel for="creator_discord">Discord</Field.FieldLabel>
								<Input id="creator_discord" value={data.userDiscord} disabled />
							</Field.Field>

							<Field.Field
								data-invalid={$errors.creator_riot_id || creatorRankError ? true : undefined}
							>
								<Field.FieldLabel for="creator_riot_id">
									Riot ID (Nome#Tag) <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="creator_riot_id"
									name="creator_riot_id"
									bind:value={$formData.creator_riot_id}
									placeholder="Ex: OutKing#1234"
									aria-invalid={$errors.creator_riot_id || creatorRankError ? true : undefined}
									oninput={() => {
										validateField('creator_riot_id');
										checkCreatorRank();
									}}
								/>
								{#if $errors.creator_riot_id}
									<Field.FieldError>{$errors.creator_riot_id}</Field.FieldError>
								{/if}
								{#if creatorRankError}
									<Field.FieldError>{creatorRankError}</Field.FieldError>
								{/if}
								{#if checkingCreatorRank}
									<Field.FieldDescription>A verificar rank...</Field.FieldDescription>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.creator_role ? true : undefined}>
								<Field.FieldLabel for="creator_role">
									Cargo na equipa <span class="text-error">*</span>
								</Field.FieldLabel>
								<input type="hidden" name="creator_role" value={$formData.creator_role} />
								<Select.Root
									type="single"
									bind:value={$formData.creator_role}
									onchange={() => {
										validateField('creator_role');
										checkCreatorRank();
									}}
								>
									<Select.Trigger>
										{roles.find((r) => r.value === $formData.creator_role)?.label ?? 'Seleciona...'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each roles as r}
												<Select.Item value={r.value} label={r.label} />
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								{#if $errors.creator_role}
									<Field.FieldError>{$errors.creator_role}</Field.FieldError>
								{/if}
							</Field.Field>
						</Field.FieldGroup>
					{/if}

					<!-- Step 1: Team info -->
					{#if step === 1}
						<h2 class="mb-6 text-xl">Sobre a equipa</h2>

						<Field.FieldGroup>
							<Field.Field data-invalid={$errors.team_name ? true : undefined}>
								<Field.FieldLabel for="team_name">
									Nome da equipa <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="team_name"
									name="team_name"
									bind:value={$formData.team_name}
									placeholder="Ex: OutKing Dragons"
									aria-invalid={$errors.team_name ? true : undefined}
									oninput={() => validateField('team_name')}
								/>
								{#if $errors.team_name}
									<Field.FieldError>{$errors.team_name}</Field.FieldError>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.team_tag ? true : undefined}>
								<Field.FieldLabel for="team_tag">
									Tag (2-5 carateres) <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="team_tag"
									name="team_tag"
									bind:value={$formData.team_tag}
									placeholder="Ex: OKD"
									maxlength={5}
									aria-invalid={$errors.team_tag ? true : undefined}
									oninput={() => validateField('team_tag')}
								/>
								{#if $errors.team_tag}
									<Field.FieldError>{$errors.team_tag}</Field.FieldError>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.team_logo_url ? true : undefined}>
								<Field.FieldLabel for="team_logo_url">Logo (URL)</Field.FieldLabel>
								<Input
									id="team_logo_url"
									type="url"
									name="team_logo_url"
									bind:value={$formData.team_logo_url}
									placeholder="https://..."
									aria-invalid={$errors.team_logo_url ? true : undefined}
									oninput={() => validateField('team_logo_url')}
								/>
								{#if $errors.team_logo_url}
									<Field.FieldError>{$errors.team_logo_url}</Field.FieldError>
								{/if}
							</Field.Field>

							<Field.Field>
								<Field.FieldLabel for="team_socials">Redes sociais (opcional)</Field.FieldLabel>
								<Input
									id="team_socials"
									name="team_socials"
									bind:value={$formData.team_socials}
									placeholder="Ex: @outking no X, /outking no Discord"
								/>
							</Field.Field>
						</Field.FieldGroup>
					{/if}

					<!-- Step 2: Players -->
					{#if step === 2}
						<h2 class="mb-6 text-xl">Jogadores <span class="text-error">*</span></h2>
						<p class="mb-4 text-sm text-text-muted">
							Adiciona os jogadores da equipa (até 7, incluindo suplentes).
						</p>

						<Field.FieldGroup>
							{#each $formData.players as _, i}
								<div class={i > 0 ? 'border-t border-border-subtle pt-6' : ''}>
									<div class="mb-3 flex items-center justify-between">
										<Field.FieldLabel>Jogador {i + 1}</Field.FieldLabel>
										{#if $formData.players.length > 5}
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onclick={() => removePlayer(i)}
											>
												<X />
											</Button>
										{/if}
									</div>

									<Field.Field data-invalid={$errors.players?.[i]?.discord ? true : undefined}>
										<Input
											name="players[{i}].discord"
											bind:value={$formData.players[i].discord}
											placeholder="Discord (Ex: @username) *"
											aria-invalid={$errors.players?.[i]?.discord ? true : undefined}
											oninput={() => validateField('players')}
										/>
										{#if $errors.players?.[i]?.discord}
											<Field.FieldError>{$errors.players[i].discord}</Field.FieldError>
										{/if}
									</Field.Field>

									<Field.Field data-invalid={$errors.players?.[i]?.riot_id ? true : undefined}>
										<Input
											name="players[{i}].riot_id"
											bind:value={$formData.players[i].riot_id}
											placeholder="Riot ID (Ex: Nome#Tag) *"
											aria-invalid={$errors.players?.[i]?.riot_id ? true : undefined}
											oninput={() => validateField('players')}
										/>
										{#if $errors.players?.[i]?.riot_id}
											<Field.FieldError>{$errors.players[i].riot_id}</Field.FieldError>
										{/if}
									</Field.Field>

									<Field.Field data-invalid={$errors.players?.[i]?.display_name ? true : undefined}>
										<Input
											name="players[{i}].display_name"
											bind:value={$formData.players[i].display_name}
											placeholder="Nome para os casters *"
											aria-invalid={$errors.players?.[i]?.display_name ? true : undefined}
											oninput={() => validateField('players')}
										/>
										{#if $errors.players?.[i]?.display_name}
											<Field.FieldError>{$errors.players[i].display_name}</Field.FieldError>
										{/if}
									</Field.Field>
								</div>
							{/each}
						</Field.FieldGroup>

						{#if $errors.players?._errors}
							<span class="mb-2 block text-sm text-error">
								{$errors.players._errors.join(', ')}
							</span>
						{/if}

						{#if $formData.players.length < 7}
							<Button type="button" variant="outline" class="mt-4 w-full" onclick={addPlayer}>
								+ Adicionar jogador
							</Button>
						{/if}
					{/if}

					<!-- Step 3: Staff -->
					{#if step === 3}
						<h2 class="mb-6 text-xl">Equipa Técnica</h2>
						<p class="mb-4 text-sm text-text-muted">Adiciona coach e/ou analista (opcional).</p>

						<Field.FieldGroup>
							{#each $formData.staff as _, i}
								<div class="rounded-lg bg-section p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-text-muted">Staff {i + 1}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onclick={() => removeStaff(i)}
										>
											<X />
										</Button>
									</div>

									<Field.Field data-invalid={$errors.staff?.[i]?.discord ? true : undefined}>
										<Input
											name="staff[{i}].discord"
											bind:value={$formData.staff[i].discord}
											placeholder="Discord (Ex: @username) *"
											aria-invalid={$errors.staff?.[i]?.discord ? true : undefined}
											oninput={() => validateField('staff')}
										/>
										{#if $errors.staff?.[i]?.discord}
											<Field.FieldError>{$errors.staff[i].discord}</Field.FieldError>
										{/if}
									</Field.Field>

									<Field.Field data-invalid={$errors.staff?.[i]?.riot_id ? true : undefined}>
										<Input
											name="staff[{i}].riot_id"
											bind:value={$formData.staff[i].riot_id}
											placeholder="Riot ID (Ex: Nome#Tag) *"
											aria-invalid={$errors.staff?.[i]?.riot_id ? true : undefined}
											oninput={() => validateField('staff')}
										/>
										{#if $errors.staff?.[i]?.riot_id}
											<Field.FieldError>{$errors.staff[i].riot_id}</Field.FieldError>
										{/if}
									</Field.Field>

									<Field.Field data-invalid={$errors.staff?.[i]?.display_name ? true : undefined}>
										<Input
											name="staff[{i}].display_name"
											bind:value={$formData.staff[i].display_name}
											placeholder="Nome para os casters *"
											aria-invalid={$errors.staff?.[i]?.display_name ? true : undefined}
											oninput={() => validateField('staff')}
										/>
										{#if $errors.staff?.[i]?.display_name}
											<Field.FieldError>{$errors.staff[i].display_name}</Field.FieldError>
										{/if}
									</Field.Field>

									<Field.Field data-invalid={$errors.staff?.[i]?.role ? true : undefined}>
										<Input
											name="staff[{i}].role"
											bind:value={$formData.staff[i].role}
											placeholder="Cargo *"
											aria-invalid={$errors.staff?.[i]?.role ? true : undefined}
											oninput={() => validateField('staff')}
										/>
										{#if $errors.staff?.[i]?.role}
											<Field.FieldError>{$errors.staff[i].role}</Field.FieldError>
										{/if}
									</Field.Field>
								</div>
							{/each}
						</Field.FieldGroup>

						<Button type="button" variant="outline" class="mt-4 w-full" onclick={addStaff}>
							+ Adicionar staff
						</Button>
					{/if}

					<!-- Step 4: Review -->
					{#if step === 4}
						<h2 class="mb-6 text-xl">Rever inscrição</h2>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">Quem cria</h3>
							<p><strong>Discord:</strong> {data.userDiscord}</p>
							<p><strong>Riot ID:</strong> {$formData.creator_riot_id || '—'}</p>
							<p>
								<strong>Cargo:</strong>
								{roles.find((r) => r.value === $formData.creator_role)?.label ?? '—'}
							</p>
						</div>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">Equipa</h3>
							<p><strong>Nome:</strong> {$formData.team_name || '—'}</p>
							<p><strong>Tag:</strong> {$formData.team_tag || '—'}</p>
							{#if $formData.team_logo_url}
								<p><strong>Logo:</strong> {$formData.team_logo_url}</p>
							{/if}
							{#if $formData.team_socials}
								<p><strong>Redes:</strong> {$formData.team_socials}</p>
							{/if}
						</div>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">
								Jogadores ({$formData.players.length})
							</h3>
							{#each $formData.players as p, i}
								<p class="text-sm">
									{i + 1}. {p.display_name || '—'} ({p.discord || '—'})
								</p>
							{/each}
						</div>

						{#if $formData.staff.length > 0}
							<div class="mb-4 rounded-lg bg-section p-4">
								<h3 class="mb-2 text-sm text-text-muted">
									Equipa Técnica ({$formData.staff.length})
								</h3>
								{#each $formData.staff as st, i}
									<p class="text-sm">
										{i + 1}. {st.display_name || '—'} — {st.role || '—'}
									</p>
								{/each}
							</div>
						{/if}
					{/if}

					<!-- Navigation -->
					<div class="mt-8 flex justify-between">
						{#if step > 0}
							<Button type="button" variant="outline" onclick={() => (step = step - 1)}>
								← Anterior
							</Button>
						{:else}
							<div></div>
						{/if}

						{#if step < 4}
							<Button type="button" variant="default" disabled={stepBlocked} onclick={nextStep}>
								Seguinte
							</Button>
						{:else}
							<Button type="submit" variant="default">Submeter Inscrição</Button>
						{/if}
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
