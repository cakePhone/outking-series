import { db } from '$lib/server/db';
import { player } from '$lib/server/db/schema';
import { ne } from 'drizzle-orm';

let cachedCount: number | null = null;

export function invalidatePlayerCount() {
	cachedCount = null;
}

export async function getPlayerCount(): Promise<number> {
	if (cachedCount !== null) return cachedCount;

	const rows = await db
		.select({ discord: player.discord })
		.from(player)
		.where(ne(player.discord, ''));

	const unique = new Set(rows.map((r) => r.discord?.toLowerCase()).filter(Boolean));
	cachedCount = unique.size;
	return cachedCount;
}
