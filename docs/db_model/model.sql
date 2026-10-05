-- ** Database generated with pgModeler (PostgreSQL Database Modeler).
-- ** pgModeler version: 1.2.3
-- ** PostgreSQL version: 18.0
-- ** Project Site: pgmodeler.io
-- ** Model Author: ---

-- ** Database creation must be performed outside a multi lined SQL file. 
-- ** These commands were put in this file only as a convenience.

-- object: outking | type: DATABASE --
-- DROP DATABASE IF EXISTS outking;
CREATE DATABASE outking;
-- ddl-end --


SET check_function_bodies = false;
-- ddl-end --

SET search_path TO pg_catalog,public;
-- ddl-end --

-- object: public.post | type: TABLE --
-- DROP TABLE IF EXISTS public.post CASCADE;
CREATE TABLE public.post (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	content text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	deleted_at timestamptz,
	posted_by bigint NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	visible boolean NOT NULL DEFAULT false,
	CONSTRAINT post_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.post OWNER TO postgres;
-- ddl-end --

-- object: public.badge | type: TABLE --
-- DROP TABLE IF EXISTS public.badge CASCADE;
CREATE TABLE public.badge (
	id smallint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	name text NOT NULL,
	awarded_from bigint,
	CONSTRAINT badge_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.badge OWNER TO postgres;
-- ddl-end --

-- object: public.team | type: TABLE --
-- DROP TABLE IF EXISTS public.team CASCADE;
CREATE TABLE public.team (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	name text NOT NULL,
	tag char(3) NOT NULL,
	rank bigint NOT NULL DEFAULT 0,
	created_at timestamptz NOT NULL DEFAULT now(),
	retired_at timestamptz DEFAULT NULL,
	created_by bigint NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT team_pk PRIMARY KEY (id),
	CONSTRAINT team_has_unique_acronym UNIQUE (tag),
	CONSTRAINT retired_at_validity CHECK (retired_at IS NULL OR retired_at >= created_at),
	CONSTRAINT team_rank_not_below_zero CHECK (rank >= 0)
);
-- ddl-end --
ALTER TABLE public.team OWNER TO postgres;
-- ddl-end --

-- object: public.player_role | type: TYPE --
-- DROP TYPE IF EXISTS public.player_role CASCADE;
CREATE TYPE public.player_role AS
ENUM ('user','moderator','administrator');
-- ddl-end --
ALTER TYPE public.player_role OWNER TO postgres;
-- ddl-end --

-- object: public.match_result | type: TYPE --
-- DROP TYPE IF EXISTS public.match_result CASCADE;
CREATE TYPE public.match_result AS
ENUM ('team_a_won','team_b_won');
-- ddl-end --
ALTER TYPE public.match_result OWNER TO postgres;
-- ddl-end --

-- object: public.team_points | type: TYPE --
-- DROP TYPE IF EXISTS public.team_points CASCADE;
CREATE TYPE public.team_points AS
(
 start_points bigint,
 end_points bigint
);
-- ddl-end --
ALTER TYPE public.team_points OWNER TO postgres;
-- ddl-end --
COMMENT ON TYPE public.team_points IS E'A structure that holds per team points at the start and end of a match.';
-- ddl-end --

-- object: public.match_state | type: TYPE --
-- DROP TYPE IF EXISTS public.match_state CASCADE;
CREATE TYPE public.match_state AS
ENUM ('cancelled','pending','in_progress','completed');
-- ddl-end --
ALTER TYPE public.match_state OWNER TO postgres;
-- ddl-end --

-- object: public.tag | type: TABLE --
-- DROP TABLE IF EXISTS public.tag CASCADE;
CREATE TABLE public.tag (
	name text NOT NULL,
	CONSTRAINT tag_pk PRIMARY KEY (name)
);
-- ddl-end --
ALTER TABLE public.tag OWNER TO postgres;
-- ddl-end --

-- object: public.tournament | type: TABLE --
-- DROP TABLE IF EXISTS public.tournament CASCADE;
CREATE TABLE public.tournament (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	title text NOT NULL,
	category bigint NOT NULL,
	start_date date NOT NULL DEFAULT CURRENT_DATE,
	end_date date NOT NULL,
	min_teams smallint NOT NULL DEFAULT 2,
	max_teams smallint NOT NULL,
	qualifiers_end_date date NOT NULL,
	group_stage_end_date date NOT NULL,
	play_off_end_date date NOT NULL,
	referenced_post bigint NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	visible boolean NOT NULL DEFAULT false,
	prize_pool bigint,
	CONSTRAINT tournament_pk PRIMARY KEY (id),
	CONSTRAINT end_date_after_start_date CHECK (end_date > start_date),
	CONSTRAINT correct_stage_date_order CHECK (qualifiers_end_date < group_stage_end_date AND group_stage_end_date < play_off_end_date),
	CONSTRAINT two_min_teams CHECK (min_teams >= 2),
	CONSTRAINT max_teams_bigger_than_min CHECK (max_teams >= min_teams),
	CONSTRAINT qualifiers_cant_outlive_tournament CHECK (qualifiers_end_date <= end_date)
);
-- ddl-end --
COMMENT ON COLUMN public.tournament.min_teams IS E'The amount of teams required for the tournament to start.';
-- ddl-end --
COMMENT ON COLUMN public.tournament.max_teams IS E'The maximum teams allowed to join the tournament';
-- ddl-end --
COMMENT ON CONSTRAINT qualifiers_cant_outlive_tournament ON public.tournament IS E'This check also prevents all other stage end dates from outliving the tournament, as they must happen after qualifiers.';
-- ddl-end --
ALTER TABLE public.tournament OWNER TO postgres;
-- ddl-end --

-- object: public.post_tag | type: TABLE --
-- DROP TABLE IF EXISTS public.post_tag CASCADE;
CREATE TABLE public.post_tag (
	id_post bigint NOT NULL,
	name_tag text NOT NULL,
	CONSTRAINT post_tag_pk PRIMARY KEY (id_post,name_tag)
);
-- ddl-end --

-- object: post_fk | type: CONSTRAINT --
-- ALTER TABLE public.post_tag DROP CONSTRAINT IF EXISTS post_fk CASCADE;
ALTER TABLE public.post_tag ADD CONSTRAINT post_fk FOREIGN KEY (id_post)
REFERENCES public.post (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: tag_fk | type: CONSTRAINT --
-- ALTER TABLE public.post_tag DROP CONSTRAINT IF EXISTS tag_fk CASCADE;
ALTER TABLE public.post_tag ADD CONSTRAINT tag_fk FOREIGN KEY (name_tag)
REFERENCES public.tag (name) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.comment | type: TABLE --
-- DROP TABLE IF EXISTS public.comment CASCADE;
CREATE TABLE public.comment (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	content text NOT NULL,
	commented_at timestamptz NOT NULL DEFAULT now(),
	deleted_at timestamptz,
	commented_by bigint NOT NULL,
	on_post bigint NOT NULL,
	reply_to bigint DEFAULT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT comment_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.comment OWNER TO postgres;
-- ddl-end --

-- object: post_fk | type: CONSTRAINT --
-- ALTER TABLE public.comment DROP CONSTRAINT IF EXISTS post_fk CASCADE;
ALTER TABLE public.comment ADD CONSTRAINT post_fk FOREIGN KEY (on_post)
REFERENCES public.post (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: post_fk | type: CONSTRAINT --
-- ALTER TABLE public.tournament DROP CONSTRAINT IF EXISTS post_fk CASCADE;
ALTER TABLE public.tournament ADD CONSTRAINT post_fk FOREIGN KEY (referenced_post)
REFERENCES public.post (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: tournament_uq | type: CONSTRAINT --
-- ALTER TABLE public.tournament DROP CONSTRAINT IF EXISTS tournament_uq CASCADE;
ALTER TABLE public.tournament ADD CONSTRAINT tournament_uq UNIQUE (referenced_post);
-- ddl-end --

-- object: public.match | type: TABLE --
-- DROP TABLE IF EXISTS public.match CASCADE;
CREATE TABLE public.match (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	state public.match_state NOT NULL DEFAULT 'pending',
	match_start timestamptz,
	match_end timestamptz,
	points_a public.team_points,
	points_b public.team_points,
	team_a bigint,
	team_b bigint,
	match_result public.match_result,
	vod_url text,
	played_for_tournament bigint,
	CONSTRAINT match_pk PRIMARY KEY (id),
	CONSTRAINT team_a_diff_team_b CHECK (team_a <> team_b),
	CONSTRAINT valid_match_winner CHECK ((match_result = 'team_a_won') = (points_a.end_points > points_b.end_points)),
	CONSTRAINT completed_means_end_exists CHECK (state <> 'completed' OR match_end IS NOT NULL),
	CONSTRAINT pending_state_match_end_null CHECK (state <> 'pending' OR match_end IS NULL),
	CONSTRAINT state_is_not_completed_or_match_is_valid CHECK (state <> 'completed' OR (match_result IS NOT NULL AND points_a IS NOT NULL AND points_b IS NOT NULL)),
	CONSTRAINT end_after_start CHECK (match_end > match_start),
	CONSTRAINT match_data_filled_after_completion CHECK (state = 'completed' OR (match_result IS NULL AND points_a IS NULL AND points_b IS NULL)),
	CONSTRAINT in_progress_match_started CHECK (state <> 'in_progress' OR match_start IS NOT NULL)
);
-- ddl-end --
COMMENT ON COLUMN public.match.team_a IS E'If team is NULL, match is planned and team has yet to be decided.';
-- ddl-end --
COMMENT ON COLUMN public.match.team_b IS E'If team is NULL, match is planned and team has yet to be decided.';
-- ddl-end --
ALTER TABLE public.match OWNER TO postgres;
-- ddl-end --

-- object: tournament_fk | type: CONSTRAINT --
-- ALTER TABLE public.match DROP CONSTRAINT IF EXISTS tournament_fk CASCADE;
ALTER TABLE public.match ADD CONSTRAINT tournament_fk FOREIGN KEY (played_for_tournament)
REFERENCES public.tournament (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public.team_enrollment | type: TABLE --
-- DROP TABLE IF EXISTS public.team_enrollment CASCADE;
CREATE TABLE public.team_enrollment (
	id_team bigint NOT NULL,
	id_tournament bigint NOT NULL,
	enrolled_at timestamptz NOT NULL,
	status public.enrollment_status NOT NULL DEFAULT 'pending',
	rank_at_enrollment bigint NOT NULL,
	CONSTRAINT team_enrollment_pk PRIMARY KEY (id_team,id_tournament),
	CONSTRAINT rank_not_below_0 CHECK (rank_at_enrollment >= 0)
);
-- ddl-end --

-- object: team_fk | type: CONSTRAINT --
-- ALTER TABLE public.team_enrollment DROP CONSTRAINT IF EXISTS team_fk CASCADE;
ALTER TABLE public.team_enrollment ADD CONSTRAINT team_fk FOREIGN KEY (id_team)
REFERENCES public.team (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: tournament_fk | type: CONSTRAINT --
-- ALTER TABLE public.team_enrollment DROP CONSTRAINT IF EXISTS tournament_fk CASCADE;
ALTER TABLE public.team_enrollment ADD CONSTRAINT tournament_fk FOREIGN KEY (id_tournament)
REFERENCES public.tournament (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: public.match_player_stats | type: TABLE --
-- DROP TABLE IF EXISTS public.match_player_stats CASCADE;
CREATE TABLE public.match_player_stats (
	id_player bigint NOT NULL,
	id_match bigint NOT NULL,
	id_team bigint NOT NULL,
	kills smallint NOT NULL,
	deaths smallint NOT NULL,
	assists smallint NOT NULL,
	hs_rate float NOT NULL,
	first_bloods smallint NOT NULL,
	clutches smallint NOT NULL,
	plants smallint NOT NULL,
	defuses smallint NOT NULL,
	rank smallint,
	CONSTRAINT match_player_stats_pk PRIMARY KEY (id_match,id_player),
	CONSTRAINT hs_rate_check CHECK (hs_rate BETWEEN 0 AND 1)
);
-- ddl-end --
COMMENT ON COLUMN public.match_player_stats.rank IS E'The player''s rank when the match ocurred.';
-- ddl-end --
ALTER TABLE public.match_player_stats OWNER TO postgres;
-- ddl-end --

-- object: match_fk | type: CONSTRAINT --
-- ALTER TABLE public.match_player_stats DROP CONSTRAINT IF EXISTS match_fk CASCADE;
ALTER TABLE public.match_player_stats ADD CONSTRAINT match_fk FOREIGN KEY (id_match)
REFERENCES public.match (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: public.tournament_category | type: TABLE --
-- DROP TABLE IF EXISTS public.tournament_category CASCADE;
CREATE TABLE public.tournament_category (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	title text NOT NULL,
	CONSTRAINT tournament_cat_unique_title UNIQUE (title),
	CONSTRAINT tournament_category_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.tournament_category OWNER TO postgres;
-- ddl-end --

-- object: tournament_category_fk | type: CONSTRAINT --
-- ALTER TABLE public.tournament DROP CONSTRAINT IF EXISTS tournament_category_fk CASCADE;
ALTER TABLE public.tournament ADD CONSTRAINT tournament_category_fk FOREIGN KEY (category)
REFERENCES public.tournament_category (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: team_fk | type: CONSTRAINT --
-- ALTER TABLE public.match_player_stats DROP CONSTRAINT IF EXISTS team_fk CASCADE;
ALTER TABLE public.match_player_stats ADD CONSTRAINT team_fk FOREIGN KEY (id_team)
REFERENCES public.team (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.team_member | type: TABLE --
-- DROP TABLE IF EXISTS public.team_member CASCADE;
CREATE TABLE public.team_member (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	joined_at timestamptz NOT NULL DEFAULT now(),
	left_at timestamptz DEFAULT NULL,
	id_player bigint NOT NULL,
	id_team bigint NOT NULL,
	CONSTRAINT team_member_pk PRIMARY KEY (id),
	CONSTRAINT left_after_join CHECK (left_at > joined_at)
);
-- ddl-end --
ALTER TABLE public.team_member OWNER TO postgres;
-- ddl-end --

-- object: team_fk | type: CONSTRAINT --
-- ALTER TABLE public.team_member DROP CONSTRAINT IF EXISTS team_fk CASCADE;
ALTER TABLE public.team_member ADD CONSTRAINT team_fk FOREIGN KEY (id_team)
REFERENCES public.team (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.set_updated_at | type: FUNCTION --
-- DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.set_updated_at ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE 
	RETURNS NULL ON NULL INPUT
	SECURITY INVOKER
	PARALLEL SAFE
	COST 1
	AS 
$function$
BEGIN
	NEW.updated_at := now();
	RETURN NEW;
END;
$function$;
-- ddl-end --
ALTER FUNCTION public.set_updated_at() OWNER TO postgres;
-- ddl-end --

-- object: public.player_blocks | type: TABLE --
-- DROP TABLE IF EXISTS public.player_blocks CASCADE;
CREATE TABLE public.player_blocks (
	blocked_at timestamptz NOT NULL DEFAULT now(),
	blocked_by bigint NOT NULL,
	blocked_player bigint NOT NULL,
	CONSTRAINT player_blocks_pk PRIMARY KEY (blocked_by,blocked_player),
	CONSTRAINT player_cant_block_self CHECK (blocked_by <> blocked_player)
);
-- ddl-end --
ALTER TABLE public.player_blocks OWNER TO postgres;
-- ddl-end --

-- object: public.report_status | type: TYPE --
-- DROP TYPE IF EXISTS public.report_status CASCADE;
CREATE TYPE public.report_status AS
ENUM ('open','resolved','dismissed');
-- ddl-end --
ALTER TYPE public.report_status OWNER TO postgres;
-- ddl-end --

-- object: public.notification | type: TABLE --
-- DROP TABLE IF EXISTS public.notification CASCADE;
CREATE TABLE public.notification (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	title text NOT NULL,
	content text NOT NULL,
	notified_at timestamptz NOT NULL DEFAULT now(),
	read_at timestamptz DEFAULT NULL,
	recipient bigint NOT NULL,
	CONSTRAINT notification_pk PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.notification OWNER TO postgres;
-- ddl-end --

-- object: public.stats_team_is_playing | type: FUNCTION --
-- DROP FUNCTION IF EXISTS public.stats_team_is_playing() CASCADE;
CREATE OR REPLACE FUNCTION public.stats_team_is_playing ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE 
	CALLED ON NULL INPUT
	SECURITY INVOKER
	PARALLEL UNSAFE
	COST 1
	AS 
$function$
BEGIN
	IF NEW.id_team <> ALL (SELECT team_a, team_b FROM match WHERE id = NEW.id_match) THEN
	RAISE EXCEPTION 'stats team % does not belong to match %', NEW.id_team, NEW.id_match;
	END IF;
	RETURN NEW;
END;

$function$;
-- ddl-end --
ALTER FUNCTION public.stats_team_is_playing() OWNER TO postgres;
-- ddl-end --

-- object: trg_stats_team_is_playing | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_stats_team_is_playing ON public.match_player_stats CASCADE;
CREATE OR REPLACE TRIGGER trg_stats_team_is_playing
	BEFORE INSERT OR UPDATE OF id_match,id_team
	ON public.match_player_stats
	FOR EACH ROW
	EXECUTE PROCEDURE public.stats_team_is_playing();
-- ddl-end --

-- object: trg_match_updated | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_match_updated ON public.match CASCADE;
CREATE OR REPLACE TRIGGER trg_match_updated
	BEFORE UPDATE OF id,state,match_start,match_end,points_a,points_b,team_a,team_b,match_result,played_for_tournament,vod_url
	ON public.match
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: trg_tournament_updated | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_tournament_updated ON public.tournament CASCADE;
CREATE OR REPLACE TRIGGER trg_tournament_updated
	BEFORE UPDATE OF id,title,category,start_date,end_date,min_teams,max_teams,qualifiers_end_date,group_stage_end_date,play_off_end_date,referenced_post,updated_at,visible,prize_pool
	ON public.tournament
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: public.game_roles | type: TYPE --
-- DROP TYPE IF EXISTS public.game_roles CASCADE;
CREATE TYPE public.game_roles AS
ENUM ('duelist','controller','initiator','sentinel');
-- ddl-end --
ALTER TYPE public.game_roles OWNER TO postgres;
-- ddl-end --

-- object: public.player_reports | type: TABLE --
-- DROP TABLE IF EXISTS public.player_reports CASCADE;
CREATE TABLE public.player_reports (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	reported_by bigint NOT NULL,
	reported_player bigint NOT NULL,
	reported_at timestamptz NOT NULL DEFAULT now(),
	reason text NOT NULL,
	status public.report_status NOT NULL DEFAULT 'open',
	resolved_by bigint,
	resolved_at timestamptz,
	id_post bigint,
	id_comment bigint,
	CONSTRAINT player_cant_report_self CHECK (reported_by <> reported_player),
	CONSTRAINT player_reports_pk PRIMARY KEY (id),
	CONSTRAINT status_resolution_valid CHECK ((status = 'open') <> (resolved_by IS NOT NULL AND resolved_at IS NOT NULL))
);
-- ddl-end --
ALTER TABLE public.player_reports OWNER TO postgres;
-- ddl-end --

-- object: public.sanction | type: TYPE --
-- DROP TYPE IF EXISTS public.sanction CASCADE;
CREATE TYPE public.sanction AS
ENUM ('mute','suspend','ban');
-- ddl-end --
ALTER TYPE public.sanction OWNER TO postgres;
-- ddl-end --

-- object: public.ingame_region | type: TYPE --
-- DROP TYPE IF EXISTS public.ingame_region CASCADE;
CREATE TYPE public.ingame_region AS
ENUM ('emea','america','asia');
-- ddl-end --
ALTER TYPE public.ingame_region OWNER TO postgres;
-- ddl-end --

-- object: public.player_sanction | type: TABLE --
-- DROP TABLE IF EXISTS public.player_sanction CASCADE;
CREATE TABLE public.player_sanction (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ,
	type public.sanction NOT NULL,
	reason text NOT NULL,
	issued_by bigint NOT NULL,
	sanctioned_player bigint NOT NULL,
	starts_at timestamptz NOT NULL DEFAULT now(),
	ends_at timestamptz,
	CONSTRAINT player_sanction_pk PRIMARY KEY (id),
	CONSTRAINT valid_ends_at CHECK (ends_at IS NULL OR ends_at > starts_at)
);
-- ddl-end --
ALTER TABLE public.player_sanction OWNER TO postgres;
-- ddl-end --

-- object: public.player | type: TABLE --
-- DROP TABLE IF EXISTS public.player CASCADE;
CREATE TABLE public.player (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT BY 1 START WITH 0 ),
	nick text,
	display_name text NOT NULL,
	email text NOT NULL,
	pass_hash text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	deleted_at timestamptz,
	role public.player_role NOT NULL DEFAULT 'user',
	main_ingame_role public.game_roles NOT NULL,
	region public.ingame_region NOT NULL,
	ranked_tier smallint,
	CONSTRAINT player_pk PRIMARY KEY (id),
	CONSTRAINT player_has_unique_email UNIQUE (email),
	CONSTRAINT player_has_unique_nick UNIQUE (nick)
);
-- ddl-end --
ALTER TABLE public.player OWNER TO postgres;
-- ddl-end --

-- object: trg_player_updated_at | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_player_updated_at ON public.player CASCADE;
CREATE OR REPLACE TRIGGER trg_player_updated_at
	BEFORE UPDATE OF updated_at,id,nick,display_name,email,pass_hash,created_at,deleted_at,role,main_ingame_role,region,ranked_tier
	ON public.player
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: player_email_index | type: INDEX --
-- DROP INDEX IF EXISTS public.player_email_index CASCADE;
CREATE UNIQUE INDEX player_email_index ON public.player
USING btree
(
	(lower(email))
);
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_sanction DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_sanction ADD CONSTRAINT player_fk FOREIGN KEY (sanctioned_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: tournament_fk | type: CONSTRAINT --
-- ALTER TABLE public.badge DROP CONSTRAINT IF EXISTS tournament_fk CASCADE;
ALTER TABLE public.badge ADD CONSTRAINT tournament_fk FOREIGN KEY (awarded_from)
REFERENCES public.tournament (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public.player_badge | type: TABLE --
-- DROP TABLE IF EXISTS public.player_badge CASCADE;
CREATE TABLE public.player_badge (
	id_player bigint NOT NULL,
	id_badge smallint NOT NULL,
	CONSTRAINT player_badge_pk PRIMARY KEY (id_player,id_badge)
);
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_badge DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_badge ADD CONSTRAINT player_fk FOREIGN KEY (id_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: badge_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_badge DROP CONSTRAINT IF EXISTS badge_fk CASCADE;
ALTER TABLE public.player_badge ADD CONSTRAINT badge_fk FOREIGN KEY (id_badge)
REFERENCES public.badge (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.team DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.team ADD CONSTRAINT player_fk FOREIGN KEY (created_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.post DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.post ADD CONSTRAINT player_fk FOREIGN KEY (posted_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.comment DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.comment ADD CONSTRAINT player_fk FOREIGN KEY (commented_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.match_player_stats DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.match_player_stats ADD CONSTRAINT player_fk FOREIGN KEY (id_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: public.player_like_post | type: TABLE --
-- DROP TABLE IF EXISTS public.player_like_post CASCADE;
CREATE TABLE public.player_like_post (
	liked_post bigint NOT NULL,
	liked_by bigint NOT NULL,
	liked_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT player_like_post_pk PRIMARY KEY (liked_post,liked_by)
);
-- ddl-end --

-- object: post_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_like_post DROP CONSTRAINT IF EXISTS post_fk CASCADE;
ALTER TABLE public.player_like_post ADD CONSTRAINT post_fk FOREIGN KEY (liked_post)
REFERENCES public.post (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_like_post DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_like_post ADD CONSTRAINT player_fk FOREIGN KEY (liked_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.team_member DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.team_member ADD CONSTRAINT player_fk FOREIGN KEY (id_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.player_like_comment | type: TABLE --
-- DROP TABLE IF EXISTS public.player_like_comment CASCADE;
CREATE TABLE public.player_like_comment (
	liked_by bigint NOT NULL,
	liked_comment bigint NOT NULL,
	liked_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT player_like_comment_pk PRIMARY KEY (liked_by,liked_comment)
);
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_like_comment DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_like_comment ADD CONSTRAINT player_fk FOREIGN KEY (liked_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: comment_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_like_comment DROP CONSTRAINT IF EXISTS comment_fk CASCADE;
ALTER TABLE public.player_like_comment ADD CONSTRAINT comment_fk FOREIGN KEY (liked_comment)
REFERENCES public.comment (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_blocks DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_blocks ADD CONSTRAINT player_fk FOREIGN KEY (blocked_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk1 | type: CONSTRAINT --
-- ALTER TABLE public.player_blocks DROP CONSTRAINT IF EXISTS player_fk1 CASCADE;
ALTER TABLE public.player_blocks ADD CONSTRAINT player_fk1 FOREIGN KEY (blocked_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_reports DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_reports ADD CONSTRAINT player_fk FOREIGN KEY (reported_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk1 | type: CONSTRAINT --
-- ALTER TABLE public.player_reports DROP CONSTRAINT IF EXISTS player_fk1 CASCADE;
ALTER TABLE public.player_reports ADD CONSTRAINT player_fk1 FOREIGN KEY (reported_player)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.notification DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.notification ADD CONSTRAINT player_fk FOREIGN KEY (recipient)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: public.player_follows | type: TABLE --
-- DROP TABLE IF EXISTS public.player_follows CASCADE;
CREATE TABLE public.player_follows (
	follower bigint NOT NULL,
	followed_team bigint NOT NULL,
	CONSTRAINT player_follows_pk PRIMARY KEY (follower,followed_team)
);
-- ddl-end --

-- object: player_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_follows DROP CONSTRAINT IF EXISTS player_fk CASCADE;
ALTER TABLE public.player_follows ADD CONSTRAINT player_fk FOREIGN KEY (follower)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: team_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_follows DROP CONSTRAINT IF EXISTS team_fk CASCADE;
ALTER TABLE public.player_follows ADD CONSTRAINT team_fk FOREIGN KEY (followed_team)
REFERENCES public.team (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk2 | type: CONSTRAINT --
-- ALTER TABLE public.player_reports DROP CONSTRAINT IF EXISTS player_fk2 CASCADE;
ALTER TABLE public.player_reports ADD CONSTRAINT player_fk2 FOREIGN KEY (resolved_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: player_fk1 | type: CONSTRAINT --
-- ALTER TABLE public.player_sanction DROP CONSTRAINT IF EXISTS player_fk1 CASCADE;
ALTER TABLE public.player_sanction ADD CONSTRAINT player_fk1 FOREIGN KEY (issued_by)
REFERENCES public.player (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: trg_post_updated | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_post_updated ON public.post CASCADE;
CREATE OR REPLACE TRIGGER trg_post_updated
	BEFORE UPDATE OF id,content,created_at,deleted_at,posted_by,updated_at,visible
	ON public.post
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: trg_team_updated | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_team_updated ON public.team CASCADE;
CREATE OR REPLACE TRIGGER trg_team_updated
	BEFORE UPDATE OF id,name,tag,rank,created_at,retired_at,created_by
	ON public.team
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: trg_comment_updated | type: TRIGGER --
-- DROP TRIGGER IF EXISTS trg_comment_updated ON public.comment CASCADE;
CREATE OR REPLACE TRIGGER trg_comment_updated
	BEFORE UPDATE OF id,content,commented_at,deleted_at,commented_by,on_post,reply_to,updated_at
	ON public.comment
	FOR EACH ROW
	EXECUTE PROCEDURE public.set_updated_at();
-- ddl-end --

-- object: unique_join_player_team_triple | type: CONSTRAINT --
-- ALTER TABLE public.team_member DROP CONSTRAINT IF EXISTS unique_join_player_team_triple CASCADE;
ALTER TABLE public.team_member ADD CONSTRAINT unique_join_player_team_triple UNIQUE (joined_at,id_player,id_team);
-- ddl-end --

-- object: post_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_reports DROP CONSTRAINT IF EXISTS post_fk CASCADE;
ALTER TABLE public.player_reports ADD CONSTRAINT post_fk FOREIGN KEY (id_post)
REFERENCES public.post (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: comment_fk | type: CONSTRAINT --
-- ALTER TABLE public.player_reports DROP CONSTRAINT IF EXISTS comment_fk CASCADE;
ALTER TABLE public.player_reports ADD CONSTRAINT comment_fk FOREIGN KEY (id_comment)
REFERENCES public.comment (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: public.enrollment_status | type: TYPE --
-- DROP TYPE IF EXISTS public.enrollment_status CASCADE;
CREATE TYPE public.enrollment_status AS
ENUM ('pending','rejected','accepted');
-- ddl-end --
ALTER TYPE public.enrollment_status OWNER TO postgres;
-- ddl-end --

-- object: unread_notif_idx | type: INDEX --
-- DROP INDEX IF EXISTS public.unread_notif_idx CASCADE;
CREATE INDEX unread_notif_idx ON public.notification
USING btree
(
	recipient
)
WHERE (read_at IS NULL);
-- ddl-end --

-- object: index_lower_tag_names | type: INDEX --
-- DROP INDEX IF EXISTS public.index_lower_tag_names CASCADE;
CREATE UNIQUE INDEX index_lower_tag_names ON public.tag
USING btree
(
	(lower(name))
);
-- ddl-end --

-- object: reply_fk | type: CONSTRAINT --
-- ALTER TABLE public.comment DROP CONSTRAINT IF EXISTS reply_fk CASCADE;
ALTER TABLE public.comment ADD CONSTRAINT reply_fk FOREIGN KEY (reply_to)
REFERENCES public.comment (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE NO ACTION;
-- ddl-end --

-- object: team_a_fk | type: CONSTRAINT --
-- ALTER TABLE public.match DROP CONSTRAINT IF EXISTS team_a_fk CASCADE;
ALTER TABLE public.match ADD CONSTRAINT team_a_fk FOREIGN KEY (team_a)
REFERENCES public.team (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE NO ACTION;
-- ddl-end --

-- object: team_b_fk | type: CONSTRAINT --
-- ALTER TABLE public.match DROP CONSTRAINT IF EXISTS team_b_fk CASCADE;
ALTER TABLE public.match ADD CONSTRAINT team_b_fk FOREIGN KEY (team_b)
REFERENCES public.team (id) MATCH SIMPLE
ON DELETE RESTRICT ON UPDATE NO ACTION;
-- ddl-end --


