import { env } from '$env/dynamic/private';
import { MAINTENANCE_COOKIE, MAINTENANCE_COOKIE_VALUE } from '$lib/server/maintenance';
import type { RequestHandler } from './$types';

/**
 * Keybind unlock for staff during a prod maintenance window.
 * The knock sequence is checked client side, this endpoint only clears the
 * roadblock when the shared key matches. It is a locked door, not a vault:
 * anyone who wants the key can pull it from the page bundle, which is fine
 * since the keybind itself ships in the same bundle.
 */
export const POST: RequestHandler = async (event) => {
	const expected = env.MAINTENANCE_UNLOCK_KEY;
	if (!expected || event.request.headers.get('x-roadblock-key') !== expected) {
		return new Response('No entry', { status: 403 });
	}

	event.cookies.set(MAINTENANCE_COOKIE, MAINTENANCE_COOKIE_VALUE, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 60 * 60 * 2
	});

	return new Response(null, { status: 204 });
};
