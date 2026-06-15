<script module lang="ts">
	export const linkIconPlatforms = ['x', 'discord', 'twitch'] as const;
	export type LinkIconPlatform = (typeof linkIconPlatforms)[number];
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		platform: LinkIconPlatform;
	}

	let { platform }: Props = $props();

	const platform_icon_map: Record<LinkIconPlatform, string> = {
		x: 'ri:twitter-x-fill',
		discord: 'ic:baseline-discord',
		twitch: 'mdi:twitch'
	};

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
>
	<Icon icon={platform_icon_map[platform] ?? 'mdi:question-mark'} height="32" />
</a>
