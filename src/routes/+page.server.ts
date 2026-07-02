import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select({ data: submission.data }).from(submission);

	const discordTags = new Set<string>();
	for (const row of rows) {
		try {
			const parsed = JSON.parse(row.data);
			for (const player of parsed.players ?? []) {
				const tag = player.discord?.trim().toLowerCase();
				if (tag) discordTags.add(tag);
			}
		} catch {
			// Skip malformed JSON
		}
	}

	return { playerCount: discordTags.size };
};
