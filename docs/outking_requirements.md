# OutKing: Compiled Requirements

## Identity and Accounts

1. Players authenticate with email + password (`pass_hash` in DB; sessions/verification later at auth phase).
2. Nicks are case-sensitive, deliberately; impersonation risk accepted for the small community (possible future registration guard for confusable glyphs `[Il1|0O]`, app-side).
3. Emails are stored lowercase-text with case-insensitive uniqueness enforced by a unique expression index on `lower(email)`.
4. Soft delete on players (`deleted_at`); no hard deletes. A player "deleting" must not destroy content authored by or interacted with by other users.

## Teams and Rosters

5. Teams have a unique 3-char tag, a name, and a rank. Team tag is case-sensitive unique for now.
6. Teams are created by players; the creator is the captain. Ownership transfer, if ever needed, is an UPDATE on `created_by`, not a new table.
7. Off-season flexibility: players join/leave teams freely as records in `team_member` (roster history with `joined_at`/`left_at`); anti-abuse relies on moderation and rules, not schema friction.
8. Teams may retire (`retired_at`); retirement must not precede creation.
9. Team rank is a snapshot maintained by the points system, never user-editable; the ranking system itself is unresolved and needs a design meeting.
10. Team tags/brands are mutable via a future admin dashboard; archive (`retired_at`) rather than delete.

## Matches

11. Matches never draw. `match_result` is strictly `team_a_won | team_b_won`.
12. Match states: `pending | in_progress | completed | cancelled`, defaulting to `pending`.
13. Planned matches are normal rows: teams, dates, and points are nullable until played; the same row is updated in place when the match happens. No separate planned-match table.
14. A match's teams must be distinct; teams may be NULL (TBD) until confirmed.
15. A completed match must have: `match_end`, a result, and both point snapshots. A pending match must have no `match_end`. `match_end > match_start` when both exist.
16. Winner consistency is expressed point-wise: result `team_a_won` iff `points_b.end_points > points_a.end_points`.
17. Points per match are a per-team snapshot composite (`team_points`: `start_points`, `end_points`), columns `points_a`/`points_b`. `end_points` is written only by the points-award system (to be designed), which also awards rank.
18. Matches may belong to a tournament (nullable FK) but this is optional; Hub/off-season matches stand alone.
19. Match metadata planned: `vod_url`. No player-submitted match details if the Riot API is approved (application pending; disputes design deferred until the ingestion path is known).
20. No per-map/series (BO1/BO3) modeling yet; deferred until a client pass.

## Match Player Stats

21. Per-player-per-match stats: kills, deaths, assists, first_bloods, clutches, plants, defuses (smallint), headshot rate as fraction (`hs_rate` 0..1).
22. The stats row's team must match one of the two playing teams. No FK can express it, so it is enforced by a gate trigger (`stats_team_is_playing`), the chosen pattern: triggers as the single gate everyone respects.
23. Stats PK is the natural pair `(id_player, id_match)`; stats also carry `id_team`.

## Tournaments

24. Tournaments have dates for qualifiers, group stage, and playoffs, ordered and bounded: stage dates ascend, nothing outlives the tournament end, end is after start.
25. Minimum teams to start (2 or more) and maximum capacity; max >= min.
26. Tournaments are categorized by a mutable lookup table (`tournament_category`), editable by the future admin dashboard.
27. Tournaments get an announcement post (1:1 with post, RESTRICT); no separate generic `event` entity exists: gatherings and LAN parties were reduced to plain posts.
28. Tournaments have a visibility flag, default hidden, flipped live by the admins.
29. Tournaments may carry a prize pool.
30. Enrollment is many-to-many via `team_enrollment` with `enrolled_at`, CASCADE (join record dies with either side).
31. Enrollment approval flow: status `pending/accepted/rejected` (+ optionally check-in).
32. The tournament records each team's `rank_at_enrollment` for seeding/audit, since live rank decays with inactivity.
33. Tournament live-ranking scope vs a global ladder is OPEN: if the client wants a season/scope-scoped ladder, `rank` should move from `team` to a `team_rank(team, scope, points)` shape. Decide before any decay or audit logic locks in.

## Community and Content

34. Players post (`content text not null`, raw Markdown/HTML source; rendering, sanitization, excerpting, and any future tsvector search live app-side). Posts have soft delete and `updated_at`.
35. Posts may survive author deletion (`posted_by` nullable, SET NULL) - displaying an orphaned post is a legal state.
36. Comments require both an author and a parent post (NOT NULL, RESTRICT): nobody may delete a row another player's data depends on. Comments support replies (self-FK `reply_to`, RESTRICT, nullable), soft delete, and `updated_at`.
37. Likes: both posts and comments are likeable via two concrete join tables (NOT polymorphic): `player_like_post` and `player_like_comment`, each with `liked_at`, unique pair. No UPDATEs ever touch them.
38. Posts are taggable many-to-many; `tag` is a plain text-keyword table.
39. Following: players follow teams to receive about-the-team notifications; player-to-player following was rejected (community builds on Discord).
40. Notifications to a player keep a title, content, `notified_at`, an identity ID, and approach a future `read_at` (no `updated_at`).

## Moderation

41. Players may block other players (no self-block). Blocks are append-only facts, not mutable rows.
42. Players may report other players (self-report prevented) and comments, with a reason. Reports are a moderation queue: they carry `status` (`open/resolved/dismissed`) plus who and when resolved them. Report facts are append-only; status lives alongside, not via mutation of the report identity.
43. Admin-level sanctions exist (`player_sanction`: issued_by, type, reason, start/end) distinct from player blocks. Sanction details to review next session.

## Profiles and Cosmetic Data

44. Players have an in-game role and region; a rank tier is planned as either the numeric Riot API tier (preferred) or a mutable lookup table, never an enum (Riot changes tiers across patches).
45. Assets (avatars/logos/banners) are URL-addressed by the ID convention: `/players/{id}/avatar_file`, same for all other assets. No asset table unless per-asset metadata becomes needed.
46. Badges are a fixed small catalog (`smallint` identity id, unique name), admin-mutable; archive rather than delete. Everything runs in Portugal, so no cross-region modeling anywhere.
47. Everything lives in a single Postgres schema (`public`), database `outking`; the generated SQL from the pgModeler model (`docs/db_model/outking.dbm`) is the v1 baseline, with the ORM handling everything past it.

## System / Architecture Rules

48. One source of truth in the DB. Triggers enforce what FKs cannot: `updated_at` stamping via `set_updated_at` (BEFORE UPDATE only, not INSERT; column default handles inserts) on all mutable tables: player, team, match, tournament, post, comment, team_member. badge/tournament_category get them when the admin dashboard starts writing.
49. Liked/flagged/blocked facts are immutable: no UPDATE statements against join tables, even where technically possible, sanctioned app-side.
50. Before v1 freeze: export pgModeler SQL, load into scratch Postgres, run a deliberate-violation test battery (duplicate email case-variant, completed match with NULL points, delete tournament with matches, insert comment with missing author), and verify generated FK/index names match every table's `customidxs` expectations. Commit each step with the co-author trailer and Watson tags, checking working status before every commit.
