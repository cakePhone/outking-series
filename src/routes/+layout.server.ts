import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	return {
		user: locals.user ?? null,
		maintenance: url.pathname === '/maintenance' || url.pathname.startsWith('/maintenance/')
	};
};
