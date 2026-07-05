import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

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
	return resolve(event);
};
