import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const submission = sqliteTable('submission', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').notNull(),
	status: text('status').notNull().default('pending'),
	data: text('data').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

// ----- Seasons & Teams -----

export const season = sqliteTable('season', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	startDate: integer('start_date', { mode: 'timestamp_ms' }).notNull(),
	endDate: integer('end_date', { mode: 'timestamp_ms' }) // null = ongoing
});

export const team = sqliteTable('team', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	tag: text('tag').notNull(),
	logoUrl: text('logo_url'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export const player = sqliteTable('player', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	riotPuuid: text('riot_puuid'),
	riotId: text('riot_id').notNull(),
	displayName: text('display_name').notNull(),
	discord: text('discord')
});

export const teamSeason = sqliteTable(
	'team_season',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		teamId: integer('team_id')
			.notNull()
			.references(() => team.id, { onDelete: 'cascade' }),
		seasonId: integer('season_id')
			.notNull()
			.references(() => season.id, { onDelete: 'cascade' }),
		wins: integer('wins').notNull().default(0),
		losses: integer('losses').notNull().default(0),
		matchesPlayed: integer('matches_played').notNull().default(0)
	},
	(table) => [index('team_season_unique').on(table.teamId, table.seasonId)]
);

export const teamRoster = sqliteTable(
	'team_roster',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		teamId: integer('team_id')
			.notNull()
			.references(() => team.id, { onDelete: 'cascade' }),
		seasonId: integer('season_id')
			.notNull()
			.references(() => season.id, { onDelete: 'cascade' }),
		playerId: integer('player_id')
			.notNull()
			.references(() => player.id, { onDelete: 'cascade' }),
		role: text('role').notNull() // 'owner' | 'coach' | 'player' | 'substitute'
	},
	(table) => [index('team_roster_team_season').on(table.teamId, table.seasonId)]
);

// ----- Matches (future) -----

export const match = sqliteTable(
	'match',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		seasonId: integer('season_id')
			.notNull()
			.references(() => season.id, { onDelete: 'cascade' }),
		teamAId: integer('team_a_id')
			.notNull()
			.references(() => team.id),
		teamBId: integer('team_b_id')
			.notNull()
			.references(() => team.id),
		winnerTeamId: integer('winner_team_id').references(() => team.id),
		round: integer('round'),
		bracketPosition: integer('bracket_position'),
		playedAt: integer('played_at', { mode: 'timestamp_ms' })
	},
	(table) => [index('match_season_idx').on(table.seasonId)]
);

export const matchPlayer = sqliteTable(
	'match_player',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		matchId: integer('match_id')
			.notNull()
			.references(() => match.id, { onDelete: 'cascade' }),
		playerId: integer('player_id')
			.notNull()
			.references(() => player.id, { onDelete: 'cascade' }),
		kills: integer('kills').default(0),
		deaths: integer('deaths').default(0),
		assists: integer('assists').default(0),
		acs: integer('acs').default(0)
	},
	(table) => [index('match_player_match_idx').on(table.matchId)]
);

// ----- Drizzle relations -----

export const seasonRelations = relations(season, ({ many }) => ({
	teamSeasons: many(teamSeason)
}));

export const teamRelations = relations(team, ({ many }) => ({
	teamSeasons: many(teamSeason),
	teamRosters: many(teamRoster)
}));

export const playerRelations = relations(player, ({ many }) => ({
	teamRosters: many(teamRoster),
	matchPlayers: many(matchPlayer)
}));

export const teamSeasonRelations = relations(teamSeason, ({ one }) => ({
	team: one(team, { fields: [teamSeason.teamId], references: [team.id] }),
	season: one(season, { fields: [teamSeason.seasonId], references: [season.id] })
}));

export const teamRosterRelations = relations(teamRoster, ({ one }) => ({
	team: one(team, { fields: [teamRoster.teamId], references: [team.id] }),
	season: one(season, { fields: [teamRoster.seasonId], references: [season.id] }),
	player: one(player, { fields: [teamRoster.playerId], references: [player.id] })
}));

export const matchRelations = relations(match, ({ one, many }) => ({
	season: one(season, { fields: [match.seasonId], references: [season.id] }),
	teamA: one(team, { fields: [match.teamAId], references: [team.id] }),
	teamB: one(team, { fields: [match.teamBId], references: [team.id] }),
	winner: one(team, { fields: [match.winnerTeamId], references: [team.id] }),
	matchPlayers: many(matchPlayer)
}));

export const matchPlayerRelations = relations(matchPlayer, ({ one }) => ({
	match: one(match, { fields: [matchPlayer.matchId], references: [match.id] }),
	player: one(player, { fields: [matchPlayer.playerId], references: [player.id] })
}));

export * from './auth.schema';
