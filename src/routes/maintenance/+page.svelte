<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { signIn, signOut } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import DiscordIcon from '$lib/components/icons/DiscordIcon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let knocks = $state(0);
	let unlockState = $state<'idle' | 'knocking' | 'opening' | 'denied'>('idle');
	let knockTimer: ReturnType<typeof setTimeout> | undefined;

	const KNOCK_WINDOW_MS = 2500;
	const KNOCKS_REQUIRED = 3;

	async function tryUnlock() {
		if (!page.data.unlockKey) {
			unlockState = 'denied';
			return;
		}
		const res = await fetch('/maintenance/unlock', {
			method: 'POST',
			headers: { 'x-roadblock-key': page.data.unlockKey }
		});
		if (res.ok) {
			unlockState = 'opening';
			window.location.href = '/';
		} else {
			unlockState = 'denied';
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === 'o' || e.key === 'O')) {
			unlockState = 'knocking';
			knocks += 1;
			clearTimeout(knockTimer);
			if (knocks >= KNOCKS_REQUIRED) {
				knocks = 0;
				tryUnlock();
			} else {
				knockTimer = setTimeout(() => {
					knocks = 0;
					unlockState = 'idle';
				}, KNOCK_WINDOW_MS);
			}
		}
	}

	async function handleLogin() {
		await signIn.social({ provider: 'discord', callbackURL: '/' });
	}

	async function handleLogout() {
		await signOut();
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Under Maintenance - Login for Early Access</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background">
	<!-- Hazard stripe bands, animated -->
	<div class="stripe-band absolute inset-x-0 top-0 h-16 -skew-y-1 origin-top-left" aria-hidden="true"></div>
	<div class="stripe-band absolute inset-x-0 bottom-0 h-16 -skew-y-1 origin-bottom-left" aria-hidden="true"></div>

	<!-- Faint danger grid over the page -->
	<div class="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
		<div class="grid-bg h-full w-full"></div>
	</div>

	<div class="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
		<div class="roadblock-sign card relative mb-10 rotate-[-2deg] rounded-card p-10 shadow-2xl">
			<span class="stripe-band absolute inset-x-0 top-0 h-3 rounded-t-card" aria-hidden="true"></span>

			<p class="mb-2 text-sm tracking-[0.35em] text-text-muted uppercase">Road block ahead</p>

			<h1 class="heading-flash text-5xl font-black tracking-tight uppercase md:text-6xl">
				Under<br />Maintenance
			</h1>

			<p class="mt-4 text-text-muted">
				The site is closed while we repave the road. Check back soon.
			</p>

			<span class="stripe-band absolute inset-x-0 bottom-0 h-3 rounded-b-card" aria-hidden="true"></span>
		</div>

		{#if !data.loggedIn}
			<div class="flex flex-col items-center gap-3">
				<Button size="lg" variant="default" onclick={handleLogin}>
					<DiscordIcon class="size-6" />
					Early Access: Sign in with Discord
				</Button>
				<p class="text-sm text-text-dim">Access is limited to a short list of early testers.</p>
			</div>
		{:else}
			<div class="flex flex-col items-center gap-3">
				{#if data.userImage}
					<img src={data.userImage} alt="" class="size-14 rounded-full border border-border" />
				{/if}
				<p class="text-text">
					Signed in as <strong>{data.userName}</strong>, but this account has no early access slot.
				</p>
				<Button variant="outline" size="sm" onclick={handleLogout}>Sign out</Button>
			</div>
		{/if}

		<p class="h-8 mt-10 text-sm tracking-[0.3em] text-text-inactive uppercase" aria-live="polite">
			{#if unlockState === 'knocking'}
				Knock knock... ({knocks}/3)
			{:else if unlockState === 'opening'}
				Opening the gate...
			{:else if unlockState === 'denied'}
				Wrong key, the padlock stays.
			{:else}
				Knock 3x to slip past the barricade
			{/if}
		</p>
	</div>
</div>

<style>
	/* Diagonal hazard stripes, theme colored */
	.stripe-band {
		background: repeating-linear-gradient(
			-45deg,
			var(--theme-accent) 0px,
			var(--theme-accent) 18px,
			var(--theme-background) 18px,
			var(--theme-background) 36px
		);
		background-size: 200% 100%;
		animation: stripe-crawl 1.2s linear infinite;
	}

	@keyframes stripe-crawl {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 50.9px 0;
		}
	}

	/* Soft grid texture */
	.grid-bg {
		background-image:
			linear-gradient(var(--theme-text-muted) 1px, transparent 1px),
			linear-gradient(90deg, var(--theme-text-muted) 1px, transparent 1px);
		background-size: 42px 42px;
	}

	/* Flashing road-sign look on the heading */
	.heading-flash {
		color: var(--theme-text);
		text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent) 45%, transparent);
		animation: sign-pulse 2.4s ease-in-out infinite;
	}

	@keyframes sign-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stripe-band,
		.heading-flash {
			animation: none;
		}
	}
</style>
