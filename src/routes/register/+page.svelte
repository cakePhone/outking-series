<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { registerSchema } from '$lib/validators/register';
	import Icon from '@iconify/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const {
		form,
		errors,
		enhance,
		message: flashMessage
	} = superForm(data.form, {
		validators: zod4(registerSchema)
	});
</script>

<svelte:head>
	<title>Registo — OutKing Series</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 pt-24 pb-16">
	<h1 class="mb-2 text-center text-3xl">Registo de Jogador</h1>
	<p class="mb-8 text-center text-[#aaa]">
		Regista-te como jogador para participar nos torneios da OutKing Series.
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
		<form method="POST" use:enhance class="card flex flex-col gap-5 p-8">
			{#if $flashMessage}
				<div
					class="rounded-lg p-3 text-sm"
					class:bg-[rgba(0,255,0,0.1)]={$flashMessage.type === 'success'}
					class:text-[#4f4]={$flashMessage.type === 'success'}
					class:bg-[rgba(255,0,0,0.1)]={$flashMessage.type === 'error'}
					class:text-[#f44]={$flashMessage.type === 'error'}
				>
					{$flashMessage.text}
				</div>
			{/if}

			<label class="flex flex-col gap-1">
				<span class="text-sm text-[#aaa]">Nome no jogo (Riot ID)</span>
				<input
					type="text"
					name="riot_game_name"
					bind:value={$form.riot_game_name}
					placeholder="Ex: OutKing"
					class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
				/>
				{#if $errors.riot_game_name}
					<span class="text-sm text-[#f44]">{$errors.riot_game_name}</span>
				{/if}
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-sm text-[#aaa]">Tagline</span>
				<input
					type="text"
					name="riot_tagline"
					bind:value={$form.riot_tagline}
					placeholder="Ex: 1234"
					class="rounded-lg border border-[rgba(170,170,170,0.3)] bg-transparent px-4 py-3 transition-colors outline-none focus:border-[#5865F2]"
				/>
				{#if $errors.riot_tagline}
					<span class="text-sm text-[#f44]">{$errors.riot_tagline}</span>
				{/if}
			</label>

			<button
				type="submit"
				class="mt-2 cursor-pointer rounded-lg bg-[#5865F2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#4752C4]"
			>
				Submeter Registo
			</button>
		</form>
	{/if}
</div>
