import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(303, '/');

	const subs = await db
		.select()
		.from(submission)
		.where(eq(submission.userId, event.locals.user.id))
		.orderBy(desc(submission.createdAt))
		.all();

	return {
		submissions: subs.map((s) => ({
			...s,
			data: JSON.parse(s.data)
		}))
	};
};
