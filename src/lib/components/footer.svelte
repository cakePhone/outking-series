<script>
	import LinkIcon, { linkIconPlatforms } from './socials/link-icon.svelte';
</script>

<footer
	class="flex flex-col justify-between gap-8 bg-[rgba(91,0,161,1)] p-10 sm:flex-row sm:p-20 sm:pr-40 sm:pl-40"
>
	<div>
		<img src="/play-to-glory.svg" alt="Path to Glory" class="min-w-36.5" />
	</div>
	<div class="flex flex-col gap-4">
		<p class="sm:text-right">
			<span class="text-[32px] leading-[1.2] font-black tracking-normal">OUTKING SERIES</span><br />
			<span
				class="text-[24px] leading-[1.4] font-medium tracking-normal text-[rgba(228,192,255,1)]"
			>
				O maior torneio de Valorant em Portugal
			</span>
		</p>
		<div class="flex gap-4">
			{#each linkIconPlatforms as platform (platform)}
				<LinkIcon {platform} />
			{/each}
		</div>
	</div>
</footer>
