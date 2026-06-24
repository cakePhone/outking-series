import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { seed } from '$lib/server/db/seed';

let seeded = false;

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Run seed once on first request
	if (!seeded) {
		seeded = true;
		seed().catch((e) => console.error('[seed] Failed:', e));
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
