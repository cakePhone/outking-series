import { db } from '$lib/server/db';
import { player } from '$lib/server/db/schema';
import { ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({ discord: player.discord })
		.from(player)
		.where(ne(player.discord, ''));

	const unique = new Set(rows.map((r) => r.discord?.toLowerCase()).filter(Boolean));
	return { playerCount: unique.size };
};
