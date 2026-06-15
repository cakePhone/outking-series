<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';

	let scrollY = $state(0);
	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}

	$effect(() => {
		if (menuOpen) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});

	onMount(() => {
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
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Desktop navbar: visible sm (640px) and above -->
<nav
	class="card translucent-blur fixed top-4 right-4 left-4 hidden h-15 items-center p-0 text-base sm:flex md:right-20 md:left-20 md:h-20 md:text-xl"
	class:scrolled={scrollY > 10}
>
	<img src="/navbar-logo.svg" alt="OutKing Series Logo" class="h-8 md:h-12" />
	<div class="vr h-8 md:h-12"></div>
	<ul class="lhs flex gap-16 md:gap-8">
		<a href={resolve('/about')}>Sobre</a>
		<a href={resolve('/rules')}>Regras</a>
		<a href={resolve('/archive')}>Arquivo</a>
	</ul>
	<a class="mr-5 ml-auto" href={resolve('/login')}>Login</a>
</nav>

<!-- Mobile hamburger button: hidden sm and above -->
<button
	class="card fixed top-4 right-4 z-50 flex aspect-square cursor-pointer items-center justify-center rounded-4xl! border-0 p-2.5! sm:hidden"
	onclick={toggleMenu}
	aria-label={menuOpen ? 'Close menu' : 'Open menu'}
	aria-expanded={menuOpen}
>
	<Icon icon={menuOpen ? 'mdi:close' : 'mdi:menu'} height="28" />
</button>

<!-- Mobile fullscreen overlay -->
{#if menuOpen}
	<div
		class="translucent-blur fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 sm:hidden"
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
		<nav class="flex flex-col items-center gap-8 text-2xl">
			<a href={resolve('/about')} onclick={closeMenu}>Sobre</a>
			<a href={resolve('/rules')} onclick={closeMenu}>Regras</a>
			<a href={resolve('/archive')} onclick={closeMenu}>Arquivo</a>
			<a class="mt-10" href={resolve('/login')} onclick={closeMenu}>Login</a>
		</nav>
	</div>
{/if}

<style>
	nav {
		border: 1px solid transparent;
		background-clip: padding-box;
		transition:
			left 0.2s,
			right 0.2s,
			top 0.2s,
			border-radius 0.2s;

		border-radius: 40px;

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
				rgba(94, 94, 94, 1) 0%,
				rgba(94, 94, 94, 0) 50%,
				rgba(94, 94, 94, 1) 100%
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

		& .vr {
			border-left: 1px solid rgba(170, 170, 170, 0.75);
			margin-inline: 52px;
		}
	}
</style>
