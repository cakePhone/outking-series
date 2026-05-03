<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	let scrollY = $state(0);

	onMount(() => {
		const onScroll = () => {
			scrollY = window.scrollY;
		};
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<nav
	class="card translucent-blur fixed top-4 right-40 left-40 flex h-20 items-center text-xl"
	class:scrolled={scrollY > 0}
>
	<img src="/navbar-logo.svg" alt="OutKing Series Logo" height="40" />
	<div class="vr h-13.5"></div>
	<ul class="lhs flex gap-16">
		<a href={resolve('/about')}>Sobre</a>
		<a href={resolve('/rules')}>Regras</a>
		<a href={resolve('/archive')}>Arquivo</a>
	</ul>
	<a class="mr-5 ml-auto" href={resolve('/login')}>Login</a>
</nav>

<style>
	nav {
		border: 1px solid transparent;
		background-clip: padding-box;
		transition:
			left 0.2s,
			right 0.2s,
			top 0.2s,
			border-radius 0.2s;

		&.scrolled {
			left: 0;
			right: 0;
			top: 0;
			border-radius: 0;
		}

		&::before {
			content: '';
			position: absolute;
			inset: -1px;
			border-radius: 41px;
			padding: 1px;
			background: linear-gradient(
				90deg,
				rgba(94, 94, 94, 1) 0%,
				rgba(94, 94, 94, 0) 50%,
				rgba(94, 94, 94, 1) 100%
			);
			-webkit-mask:
				linear-gradient(#fff 0 0) content-box,
				linear-gradient(#fff 0 0);
			-webkit-mask-composite: xor;
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
