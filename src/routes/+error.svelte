<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { error_404_title, error_404_desc, error_back_home } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{error_404_title()}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
	<h1 class="text-8xl font-black text-primary">404</h1>
	<p class="max-w-md text-lg text-text-dim">
		{error_404_desc()}
	</p>
	<Button href="/">{error_back_home()}</Button>
</div>
