import { db } from './index';
import { season, team, player, teamSeason, teamRoster, submission } from './schema';
import { eq, and, sql } from 'drizzle-orm';

/** Insert season 0 and backfill existing approved submissions. Idempotent. */
export async function seed(): Promise<void> {
	await seedSeasonZero();
	await backfillApprovedSubmissions();
}

async function seedSeasonZero(): Promise<void> {
	const existing = db.select().from(season).where(eq(season.id, 0)).get();
	if (existing) return;

	// Auto-increment columns won't let us set id=0 via Drizzle's typed API.
	// Use raw SQL for the seed ID.
	db.run(
		sql`INSERT INTO season (id, title, start_date, end_date) VALUES (0, 'Previous Seasons', ${new Date('2024-01-01').getTime()}, ${new Date('2024-12-31').getTime()})`
	);

	console.log('[seed] Season 0 created.');
}

async function backfillApprovedSubmissions(): Promise<void> {
	const subs = db.select().from(submission).where(eq(submission.status, 'approved')).all();

	let count = 0;
	for (const s of subs) {
		const data = JSON.parse(s.data) as {
			team_name: string;
			team_tag: string;
			team_logo_url?: string;
			creator_role: string;
			creator_riot_id: string;
			players: Array<{ discord: string; riot_id: string; display_name: string }>;
			staff: Array<{ discord: string; riot_id: string; display_name: string; role: string }>;
		};

		// Check if this submission was already backfilled
		const teamRecord = db
			.select()
			.from(team)
			.where(and(eq(team.name, data.team_name), eq(team.tag, data.team_tag)))
			.get();
		if (teamRecord) continue;

		// Upsert team
		const teamResult = db
			.insert(team)
			.values({
				name: data.team_name,
				tag: data.team_tag,
				logoUrl: data.team_logo_url || null
			})
			.returning()
			.get();
		if (!teamResult) continue;
		const teamId = teamResult.id;

		// Create team_season for season 0
		db.insert(teamSeason)
			.values({ teamId, seasonId: 0, wins: 0, losses: 0, matchesPlayed: 0 })
			.run();

		// Upsert players and create roster entries
		const allMembers: Array<{
			discord: string;
			riot_id: string;
			display_name: string;
			role: string;
		}> = [...data.players.map((p) => ({ ...p, role: 'player' })), ...data.staff];

		for (const m of allMembers) {
			const playerResult = upsertPlayer(m.riot_id, m.display_name, m.discord);
			db.insert(teamRoster)
				.values({
					teamId,
					seasonId: 0,
					playerId: playerResult.id,
					role: m.role
				})
				.run();
		}

		count++;
	}

	if (count > 0) console.log(`[seed] Backfilled ${count} approved submissions into season 0.`);
}

function upsertPlayer(
	riotId: string,
	displayName: string,
	discord?: string
): { id: number; riotId: string; displayName: string; discord: string | null } {
	const existing = db
		.select()
		.from(player)
		.where(and(eq(player.riotId, riotId), eq(player.displayName, displayName)))
		.get();

	if (existing) return existing;

	return db
		.insert(player)
		.values({ riotId, displayName, discord: discord || null })
		.returning()
		.get()!;
}
