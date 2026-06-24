import { json, error } from '@sveltejs/kit';
import { getValidDiscordToken, fetchDiscordUserData } from '$lib/server/discord';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) throw error(401, 'Not authenticated');

	const token = await getValidDiscordToken(event.locals.user.id);
	if (!token) throw error(404, 'No Discord account linked');

	const data = await fetchDiscordUserData(event.locals.user.id, token);
	return json(data);
};
