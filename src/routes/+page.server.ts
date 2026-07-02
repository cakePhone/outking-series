import { getPlayerCount } from '$lib/server/player-count';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { playerCount: await getPlayerCount() };
};
