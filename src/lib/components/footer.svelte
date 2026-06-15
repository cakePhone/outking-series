<script>
	import LinkIcon, { linkIconPlatforms } from './socials/link-icon.svelte';
</script>

<footer class="flex justify-between bg-[rgba(91,0,161,1)] p-20 pr-40 pl-40">
	<div>
		<img src="/play-to-glory.svg" alt="Path to Glory" />
	</div>
	<div>
		<p class="text-right">
			<span class="text-[32px] leading-[1.2] font-black tracking-normal">OUTKING SERIES</span><br />
			<span
				class="text-[24px] leading-[1.4] font-medium tracking-normal text-[rgba(228,192,255,1)]"
			>
				O maior torneio de Valorant em Portugal
			</span>
		</p>
		<div class="flex gap-2">
			{#each linkIconPlatforms as platform (platform)}
				<LinkIcon {platform} />
			{/each}
		</div>
	</div>
</footer>
