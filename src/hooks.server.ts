import { auth } from '$lib/server/auth';
import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { isAdminUser, MAINTENANCE_COOKIE, MAINTENANCE_COOKIE_VALUE } from '$lib/server/maintenance';

export const handle: Handle = async ({ event, resolve }) => {
	const { request, url } = event;
	const baseURL = auth.options.baseURL ?? url.origin;
	const basePath = auth.options.basePath ?? '/api/auth';
	const authURL = new URL(basePath, baseURL);

	if (url.pathname.startsWith(authURL.pathname)) {
		return auth.handler(request);
	}

	const session = await auth.api.getSession({ headers: request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	// Maintenance gate: production only, dev never gets blocked
	if (!dev) {
		const onMaintenancePage = url.pathname === '/maintenance' || url.pathname.startsWith('/maintenance/');
		const cleared = event.cookies.get(MAINTENANCE_COOKIE) === MAINTENANCE_COOKIE_VALUE;

		if (!onMaintenancePage && !cleared) {
			if (event.locals.user && (await isAdminUser(event.locals.user.id))) {
				event.cookies.set(MAINTENANCE_COOKIE, MAINTENANCE_COOKIE_VALUE, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: !dev,
					maxAge: 60 * 60 * 24 * 7
				});
			} else {
				redirect(302, '/maintenance');
			}
		}
	}

	return resolve(event);
};
