import { db } from '$lib/server/db';
import { season, team, teamSeason, teamRoster, player } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const seasons = db.select().from(season).orderBy(desc(season.startDate)).all();

	const result = seasons.map((s) => {
		const tsRows = db
			.select({
				teamSeasonId: teamSeason.id,
				wins: teamSeason.wins,
				losses: teamSeason.losses,
				matchesPlayed: teamSeason.matchesPlayed,
				teamId: team.id,
				teamName: team.name,
				teamTag: team.tag,
				teamLogoUrl: team.logoUrl,
				teamCreatedAt: team.createdAt
			})
			.from(teamSeason)
			.innerJoin(team, eq(teamSeason.teamId, team.id))
			.where(eq(teamSeason.seasonId, s.id))
			.orderBy(desc(teamSeason.matchesPlayed), desc(teamSeason.wins))
			.all();

		const teams = tsRows.map((ts) => {
			const rosterRows = db
				.select({
					playerId: player.id,
					riotId: player.riotId,
					displayName: player.displayName,
					discord: player.discord,
					role: teamRoster.role
				})
				.from(teamRoster)
				.innerJoin(player, eq(teamRoster.playerId, player.id))
				.where(eq(teamRoster.teamId, ts.teamId))
				.all();

			return {
				id: ts.teamId,
				name: ts.teamName,
				tag: ts.teamTag,
				logoUrl: ts.teamLogoUrl,
				wins: ts.wins,
				losses: ts.losses,
				matchesPlayed: ts.matchesPlayed,
				roster: rosterRows
			};
		});

		return {
			id: s.id,
			title: s.title,
			startDate: s.startDate,
			endDate: s.endDate,
			teams
		};
	});

	return { seasons: result };
};
