<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { signIn, signOut, useSession } from '$lib/auth-client';
	import UserPopover from './user-popover.svelte';

	let scrollY = $state(0);
	let menuOpen = $state(false);
	let isMobile = $state(false);

	const session = useSession();

	async function handleLogin() {
		await signIn.social({ provider: 'discord' });
	}

	async function handleLogout() {
		await signOut();
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}

	// On mobile: scrolled when menu is closed (unified top bar).
	// On desktop: scrolled when page is scrolled past 10px.
	let scrolled = $derived(isMobile || scrollY > 10);

	$effect(() => {
		if (menuOpen) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});

	onMount(() => {
		const mql = window.matchMedia('(max-width: 639px)');
		isMobile = mql.matches;

		const onResize = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mql.addEventListener('change', onResize);

		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					scrollY = window.scrollY;
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			mql.removeEventListener('change', onResize);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!--
	Single navbar that adapts:
	- Mobile (default): scrolled look — top-0, full-width, no border-radius
	  Shows: logo | login | hamburger
	- Desktop (sm+): pill-shaped, offset from edges
	  Shows: logo | nav links | login
	  class:scrolled triggers on scroll
-->
<nav
	class="card translucent-blur fixed top-4 right-2 left-2 z-50 flex h-15 items-center rounded-[40px] border border-transparent bg-clip-padding p-4 text-base transition-all duration-200 sm:right-8 sm:left-8 md:right-10 md:left-10 md:h-20 md:p-6 md:text-xl lg:right-20 lg:left-20"
	class:scrolled
>
	<a href={resolve('/')}>
		<img src="/navbar-logo.svg" alt="OutKing Series Logo" class="h-8 md:h-12" />
	</a>

	<!-- Divider + nav links: visible only on desktop -->
	<div class="vr mx-13 hidden h-8 border-l border-border-strong sm:block md:h-12"></div>
	<ul class="lhs hidden gap-16 sm:flex md:gap-8">
		<a href={resolve('/teams')}>Equipas</a>
		<a href={resolve('/events')}>Eventos</a>
		<a href={resolve('/rules')}>Regras</a>
	</ul>

	{#if !menuOpen}
		<div class="ml-auto flex items-center gap-2 sm:mr-0">
			{#if $session.data?.user}
				<UserPopover />
			{:else}
				<button
					class="cursor-pointer appearance-none border-0 bg-transparent p-0"
					onclick={handleLogin}>Login</button
				>
			{/if}
		</div>
	{/if}

	<!-- Hamburger: visible only on mobile, switches to X when menu is open -->
	<button
		class="flex aspect-square cursor-pointer items-center justify-center rounded-4xl! border-0 p-2.5! sm:hidden"
		class:ml-auto={menuOpen}
		onclick={toggleMenu}
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={menuOpen}
	>
		<Icon icon={menuOpen ? 'mdi:close' : 'mdi:menu'} height="28" />
	</button>
</nav>

<!-- Mobile fullscreen overlay: appears below the navbar -->
{#if menuOpen}
	<div
		class="translucent-blur fixed top-15 right-0 bottom-0 left-0 z-40 flex flex-col items-center justify-center gap-10 sm:hidden"
		onclick={(e) => {
			if (e.target === e.currentTarget) closeMenu();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') closeMenu();
		}}
		role="dialog"
		aria-modal="true"
		aria-label="Navigation menu"
		tabindex="-1"
	>
		<nav class="flex flex-col items-center gap-8 text-3xl">
			<a href={resolve('/about')} onclick={closeMenu}>Sobre</a>
			<a href={resolve('/rules')} onclick={closeMenu}>Regras</a>
			<a href={resolve('/archive')} onclick={closeMenu}>Arquivo</a>
			{#if $session.data?.user}
				<span class="mt-4">{$session.data.user.name}</span>
				<button
					class="mt-10 cursor-pointer appearance-none border-0 bg-transparent p-0"
					onclick={() => {
						handleLogout();
						closeMenu();
					}}>Sair</button
				>
			{:else}
				<button
					class="mt-10 cursor-pointer appearance-none border-0 bg-transparent p-0"
					onclick={() => {
						handleLogin();
						closeMenu();
					}}>Login</button
				>
			{/if}
		</nav>
	</div>
{/if}

<style>
	nav {
		&.scrolled {
			left: 0;
			right: 0;
			top: 0;
			border-radius: 0;
		}

		&::before {
			content: '';
			position: absolute;
			border-radius: inherit;
			inset: -1px;
			padding: 1px;
			background: linear-gradient(
				90deg,
				var(--theme-gradient-start) 0%,
				var(--theme-gradient-end) 50%,
				var(--theme-gradient-start) 100%
			);
			mask:
				linear-gradient(#fff 0 0) content-box,
				linear-gradient(#fff 0 0);
			mask-composite: xor;
			mask-composite: exclude;
			pointer-events: none;
			transition:
				border-radius 0.2s,
				background 0.2s;
		}

		&.scrolled::before {
			background: rgba(0, 0, 0, 0);
		}
	}
</style>
