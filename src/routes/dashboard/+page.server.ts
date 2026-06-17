import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fetchGuildMember, getValidDiscordToken } from '$lib/server/discord';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(303, '/');

	const adminGuild = env.ADMIN_GUILD_ID;
	if (!adminGuild) throw error(500, 'ADMIN_GUILD_ID not configured');

	const token = await getValidDiscordToken(event.locals.user.id);
	if (!token) throw error(403, 'Acesso restrito à equipa administrativa.');

	const member = await fetchGuildMember(token, adminGuild);
	if (!member) throw error(403, 'Acesso restrito à equipa administrativa.');

	const submissions = await db.select().from(submission).orderBy(desc(submission.createdAt)).all();

	return {
		submissions: submissions.map((s) => ({
			...s,
			data: JSON.parse(s.data)
		}))
	};
};

export const actions: Actions = {
	approve: async (event) => {
		const data = await event.request.formData();
		const id = data.get('id') as string;
		await db.update(submission).set({ status: 'approved' }).where(eq(submission.id, id));
	},
	decline: async (event) => {
		const data = await event.request.formData();
		const id = data.get('id') as string;
		await db.update(submission).set({ status: 'declined' }).where(eq(submission.id, id));
	}
};
