<script module lang="ts">
	export const linkIconPlatforms = ['x', 'discord', 'twitch'] as const;
	export type LinkIconPlatform = (typeof linkIconPlatforms)[number];
</script>

<script lang="ts">
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import DiscordIcon from '$lib/components/icons/DiscordIcon.svelte';
	import XIcon from '$lib/components/icons/XIcon.svelte';
	import TwitchIcon from '$lib/components/icons/TwitchIcon.svelte';

	interface Props {
		platform: LinkIconPlatform;
	}

	let { platform }: Props = $props();

	const platform_url_map: Record<LinkIconPlatform, string> = {
		x: 'https://x.com/OutKingSeries',
		discord: 'https://discord.gg/outkingseries',
		twitch: 'https://www.twitch.tv/outkingseries'
	};
</script>

<a
	class="card flex aspect-square w-fit items-center justify-center rounded-4xl! p-3!"
	href={platform_url_map[platform] ?? '#'}
	target="_blank"
	rel="external noopener noreferrer"
	aria-label={platform}
>
	{#if platform === 'x'}
		<XIcon class="size-8" />
	{:else if platform === 'discord'}
		<DiscordIcon class="size-8" />
	{:else if platform === 'twitch'}
		<TwitchIcon class="size-8" />
	{:else}
		<CircleHelp class="size-8" />
	{/if}
</a>
