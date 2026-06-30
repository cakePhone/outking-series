<script lang="ts">
	import { onMount } from 'svelte';
	import { signOut, session } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Separator } from '$lib/components/ui/separator';
	import Logo from './Logo.svelte';
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

	const hasBanner = $derived(!!discord?.bannerUrl);
	const accentColor = $derived(discord?.accentColor ?? 'var(--theme-accent)');

	const bgStyle = $derived(() => {
		if (discord?.bannerUrl) {
			return `background-image: url(${discord.bannerUrl}); background-size: cover; background-position: center;`;
		}
		return `background-image: linear-gradient(${accentColor}30, ${accentColor}30);`;
	});
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger aria-label="User menu">
			<Avatar.Root class="size-8 md:size-12">
				<Avatar.Image src={avatarUrl} alt={displayName} />
				<Avatar.Fallback>{initials}</Avatar.Fallback>
			</Avatar.Root>
		</DropdownMenu.Trigger>

		<DropdownMenu.Content align="end" class="w-56 p-0">
			<div class="relative overflow-hidden rounded-[inherit]">
				<!-- Background -->
				<div class="absolute inset-0 bg-card" style={bgStyle}></div>

				<!-- Logo watermark: only when no banner -->
				{#if !hasBanner}
					<div
						class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10"
					>
						<Logo />
					</div>
				{/if}

				<!-- Content -->
				<div class="relative z-10 flex items-center gap-3 p-4 pt-5">
					<Avatar.Root class="size-12 border-2 border-background md:size-16">
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
			</div>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
