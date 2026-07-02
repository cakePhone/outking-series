import { i18n } from '$lib/paraglide/runtime';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = i18n.handle();
