import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submission, team, player, season, teamSeason, teamRoster } from '$lib/server/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
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

		// Fetch the submission first for the data
		const sub = db.select().from(submission).where(eq(submission.id, id)).get();
		if (!sub) throw error(404, 'Submission not found');

		await db.update(submission).set({ status: 'approved' }).where(eq(submission.id, id));

		// Upsert team + players + season linkage
		await approveSubmissionToRoster(sub);
	},
	decline: async (event) => {
		const data = await event.request.formData();
		const id = data.get('id') as string;
		await db.update(submission).set({ status: 'declined' }).where(eq(submission.id, id));
	}
};

type SubmissionRow = typeof submission.$inferSelect;

async function approveSubmissionToRoster(sub: SubmissionRow): Promise<void> {
	const d = JSON.parse(sub.data) as {
		team_name: string;
		team_tag: string;
		team_logo_url?: string;
		creator_role: string;
		creator_riot_id: string;
		players: Array<{ discord: string; riot_id: string; display_name: string }>;
		staff: Array<{ discord: string; riot_id: string; display_name: string; role: string }>;
	};

	// Upsert team (by name + tag)
	let teamRecord = db
		.select()
		.from(team)
		.where(and(eq(team.name, d.team_name), eq(team.tag, d.team_tag)))
		.get();

	if (!teamRecord) {
		teamRecord = db
			.insert(team)
			.values({ name: d.team_name, tag: d.team_tag, logoUrl: d.team_logo_url || null })
			.returning()
			.get()!;
	}

	// Find or create the current ongoing season
	let currentSeason = db.select().from(season).where(isNull(season.endDate)).get();

	if (!currentSeason) {
		currentSeason = db
			.insert(season)
			.values({
				title: 'Current Season',
				startDate: new Date(),
				endDate: null
			})
			.returning()
			.get()!;
	}

	// Upsert team_season
	const existingTeamSeason = db
		.select()
		.from(teamSeason)
		.where(and(eq(teamSeason.teamId, teamRecord.id), eq(teamSeason.seasonId, currentSeason.id)))
		.get();

	if (!existingTeamSeason) {
		db.insert(teamSeason)
			.values({
				teamId: teamRecord.id,
				seasonId: currentSeason.id,
				wins: 0,
				losses: 0,
				matchesPlayed: 0
			})
			.run();
	}

	// Upsert players + roster entries
	const allMembers: Array<{
		discord: string;
		riot_id: string;
		display_name: string;
		role: string;
	}> = [...d.players.map((p) => ({ ...p, role: 'player' })), ...d.staff];

	for (const m of allMembers) {
		let playerRecord = db
			.select()
			.from(player)
			.where(and(eq(player.riotId, m.riot_id), eq(player.displayName, m.display_name)))
			.get();

		if (!playerRecord) {
			playerRecord = db
				.insert(player)
				.values({ riotId: m.riot_id, displayName: m.display_name, discord: m.discord || null })
				.returning()
				.get()!;
		}

		const existingRoster = db
			.select()
			.from(teamRoster)
			.where(
				and(
					eq(teamRoster.teamId, teamRecord!.id),
					eq(teamRoster.seasonId, currentSeason.id),
					eq(teamRoster.playerId, playerRecord.id)
				)
			)
			.get();

		if (!existingRoster) {
			db.insert(teamRoster)
				.values({
					teamId: teamRecord!.id,
					seasonId: currentSeason.id,
					playerId: playerRecord.id,
					role: m.role
				})
				.run();
		}
	}
}
