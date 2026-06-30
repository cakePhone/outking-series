<script lang="ts">
	import { onMount } from 'svelte';
	import { signOut, session } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Separator } from '$lib/components/ui/separator';
	import type { DiscordUserData } from '$lib/server/discord';

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

	const avatarUrl = $derived(
		discord?.guildAvatarUrl ??
			discord?.avatarUrl ??
			'https://cdn.discordapp.com/embed/avatars/0.png'
	);
	const displayName = $derived(discord?.profile.global_name ?? discord?.profile.username ?? 'User');
	const username = $derived(discord?.profile.username ?? 'unknown');
	const initials = $derived(displayName.slice(0, 2).toUpperCase());
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="cursor-pointer appearance-none border-0 bg-transparent p-0"
			aria-label="User menu"
		>
			<Avatar.Root class="size-12">
				<Avatar.Image src={avatarUrl} alt={displayName} />
				<Avatar.Fallback>{initials}</Avatar.Fallback>
			</Avatar.Root>
		</DropdownMenu.Trigger>

		<DropdownMenu.Content align="end" class="w-56 overflow-hidden p-0">
			<!-- Banner header -->
			<div
				class="h-20 w-full bg-cover bg-center"
				style={discord?.bannerUrl
					? `background-image: url(${discord.bannerUrl}); background-color: ${discord.accentColor ?? '#000'}`
					: `background-color: ${discord?.accentColor ?? 'var(--theme-accent)'}`}
			></div>

			<!-- Profile section: avatar overlapping banner -->
			<div class="-mt-5 flex items-center gap-3 px-4 pb-3">
				<Avatar.Root class="size-16 border-4 border-background">
					<Avatar.Image src={avatarUrl} alt={displayName} />
					<Avatar.Fallback>{initials}</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex flex-col">
					<span class="text-sm font-semibold">{displayName}</span>
					{#if discord?.profile.global_name && discord.profile.global_name !== discord.profile.username}
						<span class="text-xs text-muted-foreground">@{username}</span>
					{/if}
				</div>
			</div>

			<Separator />

			<DropdownMenu.Group>
				<DropdownMenu.Item onclick={handleLogout}>Sair</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
