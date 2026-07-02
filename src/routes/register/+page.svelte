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
	import {
		page_title_register,
		register_title,
		register_desc,
		register_not_member_title,
		register_not_member_desc,
		register_join_server,
		register_step_creator,
		register_step_team,
		register_step_players,
		register_step_staff,
		register_step_review,
		register_step0_heading,
		register_field_discord,
		register_field_riot_id,
		register_placeholder_riot_id,
		register_field_role,
		register_select_role,
		register_role_owner,
		register_role_coach,
		register_role_player,
		register_checking_rank,
		register_step1_heading,
		register_field_team_name,
		register_placeholder_team_name,
		register_field_team_tag,
		register_placeholder_team_tag,
		register_field_logo_url,
		register_field_socials,
		register_placeholder_socials,
		register_step2_heading,
		register_step2_desc,
		register_player_slot,
		register_placeholder_discord,
		register_placeholder_riot_id_player,
		register_placeholder_display_name,
		register_add_player,
		register_step3_heading,
		register_step3_desc,
		register_staff_slot,
		register_placeholder_role,
		register_add_staff,
		register_step4_heading,
		register_review_creator,
		register_review_team,
		register_review_players,
		register_review_staff,
		register_label_discord,
		register_label_riot_id,
		register_label_role,
		register_label_name,
		register_label_tag,
		register_label_logo,
		register_label_socials,
		register_button_back,
		register_button_next,
		register_button_submit,
		rank_error_invalid_format,
		rank_error_not_found,
		rank_error_unranked,
		rank_error_rank_too_low,
		rank_error_generic,
		rank_error_network
	} from '$lib/paraglide/messages';

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

	const roles: { value: string; label: () => string }[] = [
		{ value: 'owner', label: register_role_owner },
		{ value: 'coach', label: register_role_coach },
		{ value: 'player', label: register_role_player }
	];

	let step = $state(0);
	let creatorRankError = $state<string | null>(null);
	let checkingCreatorRank = $state(false);

	const stepLabels = [
		register_step_creator,
		register_step_team,
		register_step_players,
		register_step_staff,
		register_step_review
	];

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
				if (!res.ok) {
					creatorRankError = rank_error_generic();
					return;
				}
				const result = await res.json();
				if (!result.passed) {
					switch (result.reason) {
						case 'invalid_format':
							creatorRankError = rank_error_invalid_format();
							break;
						case 'not_found':
							creatorRankError = rank_error_not_found();
							break;
						case 'unranked':
							creatorRankError = rank_error_unranked();
							break;
						case 'rank_too_low':
							creatorRankError = rank_error_rank_too_low({ rank: result.rank });
							break;
					}
				} else {
					creatorRankError = null;
				}
			} catch {
				creatorRankError = rank_error_network();
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
	<title>{page_title_register()}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pt-24 pb-16">
	<h1 class="mb-2 text-center text-3xl">{register_title()}</h1>
	<p class="mb-8 text-center text-text-muted">
		{register_desc()}
	</p>

	{#if !data.isMember}
		<Alert.Root>
			<DiscordIcon class="size-12 text-primary" />
			<Alert.Title>{register_not_member_title()}</Alert.Title>
			<Alert.Description>
				{register_not_member_desc()}
			</Alert.Description>
			<Alert.Action>
				<Button href={data.inviteUrl} target="_blank" rel="external noopener noreferrer">
					{register_join_server()}
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
					{label()}
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
						<h2 class="mb-6 text-xl">{register_step0_heading()}</h2>

						<Field.FieldGroup>
							<Field.Field data-disabled>
								<Field.FieldLabel for="creator_discord">{register_field_discord()}</Field.FieldLabel
								>
								<Input id="creator_discord" value={data.userDiscord} disabled />
							</Field.Field>

							<Field.Field
								data-invalid={$errors.creator_riot_id || creatorRankError ? true : undefined}
							>
								<Field.FieldLabel for="creator_riot_id">
									{register_field_riot_id()} <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="creator_riot_id"
									name="creator_riot_id"
									bind:value={$formData.creator_riot_id}
									placeholder={register_placeholder_riot_id()}
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
									<Field.FieldDescription>{register_checking_rank()}</Field.FieldDescription>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.creator_role ? true : undefined}>
								<Field.FieldLabel for="creator_role">
									{register_field_role()} <span class="text-error">*</span>
								</Field.FieldLabel>
								<input type="hidden" name="creator_role" value={$formData.creator_role} />
								<Select.Root
									type="single"
									bind:value={$formData.creator_role}
									onValueChange={() => {
										validateField('creator_role');
										checkCreatorRank();
									}}
								>
									<Select.Trigger>
										{roles.find((r) => r.value === $formData.creator_role)?.label() ??
											register_select_role()}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each roles as r}
												<Select.Item value={r.value} label={r.label()} />
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
						<h2 class="mb-6 text-xl">{register_step1_heading()}</h2>

						<Field.FieldGroup>
							<Field.Field data-invalid={$errors.team_name ? true : undefined}>
								<Field.FieldLabel for="team_name">
									{register_field_team_name()} <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="team_name"
									name="team_name"
									bind:value={$formData.team_name}
									placeholder={register_placeholder_team_name()}
									aria-invalid={$errors.team_name ? true : undefined}
									oninput={() => validateField('team_name')}
								/>
								{#if $errors.team_name}
									<Field.FieldError>{$errors.team_name}</Field.FieldError>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.team_tag ? true : undefined}>
								<Field.FieldLabel for="team_tag">
									{register_field_team_tag()} <span class="text-error">*</span>
								</Field.FieldLabel>
								<Input
									id="team_tag"
									name="team_tag"
									bind:value={$formData.team_tag}
									placeholder={register_placeholder_team_tag()}
									maxlength={5}
									aria-invalid={$errors.team_tag ? true : undefined}
									oninput={() => validateField('team_tag')}
								/>
								{#if $errors.team_tag}
									<Field.FieldError>{$errors.team_tag}</Field.FieldError>
								{/if}
							</Field.Field>

							<Field.Field data-invalid={$errors.team_logo_url ? true : undefined}>
								<Field.FieldLabel for="team_logo_url">{register_field_logo_url()}</Field.FieldLabel>
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
								<Field.FieldLabel for="team_socials">{register_field_socials()}</Field.FieldLabel>
								<Input
									id="team_socials"
									name="team_socials"
									bind:value={$formData.team_socials}
									placeholder={register_placeholder_socials()}
								/>
							</Field.Field>
						</Field.FieldGroup>
					{/if}

					<!-- Step 2: Players -->
					{#if step === 2}
						<h2 class="mb-6 text-xl">
							{register_step2_heading()} <span class="text-error">*</span>
						</h2>
						<p class="mb-4 text-sm text-text-muted">
							{register_step2_desc()}
						</p>

						<Field.FieldGroup>
							{#each $formData.players as _, i}
								<div class={i > 0 ? 'border-t border-border-subtle pt-6' : ''}>
									<div class="mb-3 flex items-center justify-between">
										<Field.FieldLabel>{register_player_slot({ n: i + 1 })}</Field.FieldLabel>
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
											placeholder={register_placeholder_discord()}
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
											placeholder={register_placeholder_riot_id_player()}
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
											placeholder={register_placeholder_display_name()}
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
								+ {register_add_player()}
							</Button>
						{/if}
					{/if}

					<!-- Step 3: Staff -->
					{#if step === 3}
						<h2 class="mb-6 text-xl">{register_step3_heading()}</h2>
						<p class="mb-4 text-sm text-text-muted">{register_step3_desc()}</p>

						<Field.FieldGroup>
							{#each $formData.staff as _, i}
								<div class="rounded-lg bg-section p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-text-muted">{register_staff_slot({ n: i + 1 })}</span>
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
											placeholder={register_placeholder_discord()}
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
											placeholder={register_placeholder_riot_id_player()}
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
											placeholder={register_placeholder_display_name()}
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
											placeholder={register_placeholder_role()}
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
							+ {register_add_staff()}
						</Button>
					{/if}

					<!-- Step 4: Review -->
					{#if step === 4}
						<h2 class="mb-6 text-xl">{register_step4_heading()}</h2>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">{register_review_creator()}</h3>
							<p><strong>{register_label_discord()}:</strong> {data.userDiscord}</p>
							<p><strong>{register_label_riot_id()}:</strong> {$formData.creator_riot_id || '—'}</p>
							<p>
								<strong>{register_label_role()}:</strong>
								{roles.find((r) => r.value === $formData.creator_role)?.label() ?? '—'}
							</p>
						</div>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">{register_review_team()}</h3>
							<p><strong>{register_label_name()}:</strong> {$formData.team_name || '—'}</p>
							<p><strong>{register_label_tag()}:</strong> {$formData.team_tag || '—'}</p>
							{#if $formData.team_logo_url}
								<p><strong>{register_label_logo()}:</strong> {$formData.team_logo_url}</p>
							{/if}
							{#if $formData.team_socials}
								<p><strong>{register_label_socials()}:</strong> {$formData.team_socials}</p>
							{/if}
						</div>

						<div class="mb-4 rounded-lg bg-section p-4">
							<h3 class="mb-2 text-sm text-text-muted">
								{register_review_players({ n: $formData.players.length })}
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
									{register_review_staff({ n: $formData.staff.length })}
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
								← {register_button_back()}
							</Button>
						{:else}
							<div></div>
						{/if}

						{#if step < 4}
							<Button type="button" variant="default" disabled={stepBlocked} onclick={nextStep}>
								{register_button_next()}
							</Button>
						{:else}
							<Button type="submit" variant="default">{register_button_submit()}</Button>
						{/if}
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
