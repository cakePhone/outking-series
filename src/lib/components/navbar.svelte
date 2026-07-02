<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { signIn, signOut, session } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet';
	import UserPopover from './user-popover.svelte';
	import Logo from './Logo.svelte';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		nav_teams,
		nav_events,
		nav_rules,
		nav_about,
		nav_archive,
		nav_login
	} from '$lib/paraglide/messages';

	let scrollY = $state(0);
	let menuOpen = $state(false);
	let isMobile = $state(false);

	async function handleLogin() {
		await signIn.social({ provider: 'discord' });
	}

	async function handleLogout() {
		await signOut();
	}

	function closeMenu() {
		menuOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}

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

<nav
	class="card translucent-blur fixed top-4 right-2 left-2 z-50 flex h-15 items-center rounded-card border border-transparent bg-clip-padding p-4 text-base transition-all duration-200 sm:right-8 sm:left-8 md:right-10 md:left-10 md:h-20 md:p-6 md:text-xl lg:right-20 lg:left-20"
	class:scrolled
>
	<a href={resolve('/')} class="h-8 text-white md:h-12" aria-label="OutKing Series home">
		<Logo />
	</a>

	<Separator orientation="vertical" class="mx-10 hidden sm:block" />
	<ul class="lhs hidden gap-8 sm:flex">
		<a href={resolve('/teams')}>{nav_teams()}</a>
		<a href={resolve('/events')}>{nav_events()}</a>
		<a href={resolve('/rules')}>{nav_rules()}</a>
	</ul>

	<div class="ml-auto flex items-center gap-2 sm:-mr-3">
		{#if $session.data?.user}
			<UserPopover />
		{:else}
			<Button variant="ghost" onclick={handleLogin}>{nav_login()}</Button>
		{/if}
	</div>

	<!-- Mobile hamburger: opens Sheet -->
	<Button
		variant="ghost"
		size="icon"
		class="sm:hidden {menuOpen ? 'ml-auto' : ''}"
		onclick={() => (menuOpen = !menuOpen)}
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
	>
		{#if menuOpen}
			<XIcon />
		{:else}
			<MenuIcon />
		{/if}
	</Button>
</nav>

<!-- Mobile Sheet navigation -->
<Sheet.Root bind:open={menuOpen}>
	<Sheet.Portal>
		<Sheet.Overlay class="sm:hidden" />
		<Sheet.Content
			side="top"
			class="flex flex-col items-center gap-8 pt-20 pb-12 text-xl sm:hidden"
		>
			<Sheet.Header class="sr-only">
				<Sheet.Title>Navigation menu</Sheet.Title>
				<Sheet.Description>Site navigation links</Sheet.Description>
			</Sheet.Header>
			<a href={resolve('/about')} onclick={closeMenu}>{nav_about()}</a>
			<a href={resolve('/rules')} onclick={closeMenu}>{nav_rules()}</a>
			<a href={resolve('/archive')} onclick={closeMenu}>{nav_archive()}</a>
		</Sheet.Content>
	</Sheet.Portal>
</Sheet.Root>

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
