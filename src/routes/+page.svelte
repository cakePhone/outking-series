<script lang="ts">
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import HistorySection from '$lib/components/landing/HistorySection.svelte';
	import UpdatesSection from '$lib/components/landing/UpdatesSection.svelte';
	import WhySection from '$lib/components/landing/WhySection.svelte';
	import CTASection from '$lib/components/landing/CTASection.svelte';
	import { page_title } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{page_title()}</title>
</svelte:head>

<HeroSection playerCount={data.playerCount} />
<HistorySection />
<UpdatesSection />
<WhySection />
<CTASection />
