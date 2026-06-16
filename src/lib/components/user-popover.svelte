<script lang="ts">
	import { signOut } from '$lib/auth-client';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import type { DiscordUserData } from '$lib/server/discord';

	interface Props {
		avatarSize?: number;
	}

	let { avatarSize = 40 }: Props = $props();

	let open = $state(false);
	let popoverEl = $state<HTMLDivElement>();

	const discord: DiscordUserData | null = $derived(page.data.discord ?? null);
	const user = $derived(page.data.user ?? null);

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
	<div class="relative" bind:this={popoverEl}>
		<!-- Trigger: avatar button -->
		<button
			class="cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0"
			class:w-10={avatarSize === 40}
			class:h-10={avatarSize === 40}
			onclick={() => (open = !open)}
			aria-label="User menu"
			aria-expanded={open}
		>
			<div class="relative inline-block">
				<img
					src={discord?.avatarUrl ?? `https://cdn.discordapp.com/embed/avatars/0.png`}
					alt={discord?.profile.username ?? 'User'}
					class="relative z-10 block rounded-full"
					style="width: {avatarSize}px; height: {avatarSize}px"
				/>
				{#if discord?.decorationUrl}
					<img
						src={discord.decorationUrl}
						alt=""
						class="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
						style="width: {avatarSize * 1.6}px; height: {avatarSize * 1.6}px"
					/>
				{/if}
			</div>
		</button>

		<!-- Dropdown panel -->
		{#if open}
			<div
				class="card absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden p-0!"
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

				<div class="-mt-10 flex flex-col items-center px-4 pb-4">
					<!-- Avatar (overlaps banner) -->
					<div class="relative mb-2">
						<img
							src={discord?.guildAvatarUrl ??
								discord?.avatarUrl ??
								`https://cdn.discordapp.com/embed/avatars/0.png`}
							alt={discord?.profile.username ?? 'User'}
							class="relative z-10 block rounded-full border-4 border-(--card-bg)"
							style="width: 80px; height: 80px"
						/>
						{#if discord?.decorationUrl}
							<img
								src={discord.decorationUrl}
								alt=""
								class="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
								style="width: 128px; height: 128px"
							/>
						{/if}
					</div>

					<!-- Username -->
					<span class="text-lg font-semibold">
						{discord?.profile.global_name ?? discord?.profile.username ?? 'Unknown'}
					</span>
					{#if discord?.profile.global_name && discord.profile.global_name !== discord.profile.username}
						<span class="text-sm text-[#888]">
							@{discord.profile.username}
						</span>
					{/if}

					<!-- Guild role -->
					<div class="mt-3 w-full border-t border-[rgba(170,170,170,0.2)] pt-3">
						{#if discord?.highestRole}
							<div class="flex items-center gap-2 text-sm">
								<span
									class="inline-block h-3 w-3 rounded-full"
									style="background-color: #{discord.highestRole.color
										.toString(16)
										.padStart(6, '0')}"
								></span>
								{discord.highestRole.name}
							</div>
						{:else if discord?.guildMember}
							<span class="text-sm text-[#888]">Membro do servidor</span>
						{:else}
							<span class="text-sm text-[#888]">Adicione DISCORD_GUILD_ID ao .env</span>
						{/if}
					</div>

					<!-- Logout -->
					<button
						class="mt-4 w-full cursor-pointer rounded-lg border-0 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm transition-colors hover:bg-[rgba(255,255,255,0.14)]"
						onclick={handleLogout}
					>
						Sair
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}
