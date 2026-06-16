import {
	getDiscordAccessToken,
	fetchDiscordUserData,
	type DiscordUserData
} from '$lib/server/discord';

export const load = async ({ locals }: { locals: App.Locals }) => {
	const user = locals.user ?? null;
	let discord: DiscordUserData | null = null;

	if (user) {
		const token = await getDiscordAccessToken(user.id);
		if (token) {
			try {
				discord = await fetchDiscordUserData(user.id, token);
			} catch {
				// Discord API might be down — just show basic user info
			}
		}
	}

	return { user, discord };
};
