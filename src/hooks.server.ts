import { createI18n } from '@inlang/paraglide-sveltekit';
import * as runtime from '$lib/paraglide/runtime';
import type { Handle } from '@sveltejs/kit';

const { handle: i18n } = createI18n(runtime, {
	disableAsyncLocalStorage: true
});

export const handle: Handle = async ({ event, resolve }) => {
	const response = await i18n({ event, resolve });
	if (!response) return resolve(event);
	return response;
};
