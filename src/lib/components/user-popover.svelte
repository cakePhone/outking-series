<script lang="ts">
	import { onMount } from 'svelte';
	import { signOut, session } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import type { DiscordUserData } from '$lib/server/discord';

	let open = $state(false);
	let popoverEl = $state<HTMLDivElement>();
	let discord = $state<DiscordUserData | null>(null);

	const user = $derived($session.data?.user ?? null);

	onMount(() => {
		if (!user) return;
		fetch('/api/discord/me')
			.then((r) => r.json())
			.then((d) => (discord = d))
			.catch(() => {});
	});

	async function handleLogout() {
		await signOut();
		await invalidateAll();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}

	$effect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (popoverEl && !popoverEl.contains(e.target as Node)) open = false;
		};
		// Small delay so the same click that opened it doesn't close it
		const id = setTimeout(() => document.addEventListener('click', close), 0);
		return () => {
			clearTimeout(id);
			document.removeEventListener('click', close);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if user}
	<div class="relative h-12 w-12" bind:this={popoverEl}>
		<!-- Trigger: avatar button -->
		<button
			class="cursor-pointer border-0 bg-transparent"
			onclick={() => (open = !open)}
			aria-label="User menu"
			aria-expanded={open}
		>
			<div class="relative">
				<img
					src={discord?.avatarUrl ?? `https://cdn.discordapp.com/embed/avatars/0.png`}
					alt={discord?.profile.username ?? 'User'}
					class="h-full w-full rounded-full"
				/>
				{#if discord?.decorationUrl}
					<img
						src={discord.decorationUrl}
						alt=""
						class="pointer-events-none absolute top-1/2 left-1/2 z-20 min-h-[120%] min-w-[120%] -translate-x-1/2 -translate-y-1/2"
					/>
				{/if}
			</div>
		</button>

		<!-- Dropdown panel -->
		{#if open}
			<div
				class="card absolute top-full right-0 z-50 w-56 overflow-hidden rounded-xl"
				role="menu"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => {
					if (e.key === 'Escape') open = false;
				}}
			>
				<!-- Banner header -->
				{#if discord?.bannerUrl}
					<div
						class="h-20 w-full bg-cover bg-center"
						style="background-image: url({discord.bannerUrl})"
					></div>
				{/if}

				<div class="-mt-5 flex items-center gap-2 px-4">
					<!-- Avatar (overlaps banner) -->
					<div class="relative w-20 flex-none">
						<img
							src={discord?.guildAvatarUrl ??
								discord?.avatarUrl ??
								`https://cdn.discordapp.com/embed/avatars/0.png`}
							alt={discord?.profile.username ?? 'User'}
							class="aspect-square w-full rounded-full border-4 border-(--card-bg)"
						/>
						{#if discord?.decorationUrl}
							<img
								src={discord.decorationUrl}
								alt=""
								class="pointer-events-none absolute top-1/2 left-1/2 min-h-[120%] min-w-[120%] -translate-x-1/2 -translate-y-1/2"
							/>
						{/if}
					</div>

					<!-- Username -->
					<div class="m-0 mt-5 flex flex-col text-center">
						<span class="text-lg font-semibold">
							{discord?.profile.global_name ?? discord?.profile.username ?? 'Unknown'}
						</span>
						{#if discord?.profile.global_name && discord.profile.global_name !== discord.profile.username}
							<span class="text-sm text-text-dim">
								@{discord.profile.username}
							</span>
						{/if}
					</div>
				</div>
				<!-- Logout -->
				<button
					class="mt-4 w-full cursor-pointer border-0 bg-button-ghost px-4 py-2 text-sm transition-colors hover:bg-button-ghost-hover"
					onclick={handleLogout}
				>
					Sair
				</button>
			</div>
		{/if}
	</div>
{/if}
