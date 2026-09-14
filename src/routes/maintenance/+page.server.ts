import { redirect } from '@sveltejs/kit';
import { isAdminUser } from '$lib/server/maintenance';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && (await isAdminUser(event.locals.user.id))) {
		// Admin already signed in when the roadblock went live, skip the map
		redirect(302, '/');
	}

	return {
		loggedIn: event.locals.user != null,
		userName: event.locals.user?.name ?? null,
		userImage: event.locals.user?.image ?? null,
		unlockKey: env.MAINTENANCE_UNLOCK_KEY ?? null
	};
};
