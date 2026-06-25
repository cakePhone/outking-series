import { json } from '@sveltejs/kit';
import { validatePlayerRank } from '$lib/server/riot';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { riotId } = (await request.json()) as { riotId: string };
	if (!riotId) return json({ error: 'Missing riotId' }, { status: 400 });

	const result = await validatePlayerRank(riotId);
	return json(result);
};
