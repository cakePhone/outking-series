import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { teamRegisterSchema } from '$lib/validators/team-register';
import { isGuildMember } from '$lib/server/discord';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import { validatePlayers } from '$lib/server/riot';
import {
	register_flash_validation,
	register_flash_not_member,
	register_flash_rank_fail,
	rank_error_invalid_format,
	rank_error_not_found,
	rank_error_unranked,
	rank_error_rank_too_low,
	rank_error_generic
} from '$lib/paraglide/messages';
import type { Actions, PageServerLoad } from './$types';

// Cache: userId -> { isMember, timestamp }
const memberCache = new Map<string, { isMember: boolean; ts: number }>();
const MEMBER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(303, '/');

	const discordUsername = event.locals.user.name ?? '';

	const form = await superValidate(zod4(teamRegisterSchema), {
		defaults: {
			creator_riot_id: '',
			team_name: '',
			team_tag: '',
			team_logo_url: '',
			team_socials: '',
			players: [
				{ discord: '', riot_id: '', display_name: '' },
				{ discord: '', riot_id: '', display_name: '' },
				{ discord: '', riot_id: '', display_name: '' },
				{ discord: '', riot_id: '', display_name: '' },
				{ discord: '', riot_id: '', display_name: '' }
			],
			staff: []
		}
	});

	const cached = memberCache.get(event.locals.user.id);
	let member: boolean;
	if (cached?.isMember && Date.now() - cached.ts < MEMBER_CACHE_TTL) {
		member = true;
	} else {
		member = await isGuildMember(event.locals.user.id);
		memberCache.set(event.locals.user.id, { isMember: member, ts: Date.now() });
	}

	return {
		form,
		isMember: member,
		inviteUrl: env.DISCORD_INVITE_URL ?? '#',
		userDiscord: discordUsername
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) throw redirect(303, '/');

		const form = await superValidate(event, zod4(teamRegisterSchema), {
			dataType: 'json'
		});

		if (!form.valid) {
			return message(form, {
				type: 'error',
				text: register_flash_validation()
			});
		}

		const member = await isGuildMember(event.locals.user.id);
		if (!member) {
			const url = env.DISCORD_INVITE_URL ?? '#';
			return message(form, {
				type: 'error',
				text: register_flash_not_member({ url })
			});
		}

		// ---- Rank validation via Riot API ----

		// Collect all player Riot IDs that need validation
		const playerIds: { field: string; riotId: string }[] = [];

		if (form.data.creator_role === 'player' && form.data.creator_riot_id) {
			playerIds.push({ field: 'creator_riot_id', riotId: form.data.creator_riot_id });
		}

		for (let i = 0; i < form.data.players.length; i++) {
			const player = form.data.players[i];
			if (player.riot_id) {
				playerIds.push({ field: `players[${i}].riot_id`, riotId: player.riot_id });
			}
		}

		const rankResults = await validatePlayers(playerIds.map((p) => p.riotId));

		let rankBlocked = false;
		for (let i = 0; i < rankResults.length; i++) {
			const r = rankResults[i];
			if (r.passed) continue;

			const field = playerIds[i].field;
			let msg: string;
			switch (r.reason) {
				case 'invalid_format':
					msg = rank_error_invalid_format();
					break;
				case 'not_found':
					msg = rank_error_not_found();
					break;
				case 'unranked':
					msg = rank_error_unranked();
					break;
				case 'rank_too_low':
					msg = rank_error_rank_too_low({ rank: r.rank ?? '' });
					break;
				default:
					msg = rank_error_generic();
			}
			// setError paths are runtime-validated by superforms; cast needed for dynamic indices
			setError(form, field as never, msg);
			rankBlocked = true;
		}

		if (rankBlocked) {
			return message(form, {
				type: 'error',
				text: register_flash_rank_fail()
			});
		}

		// Save to database
		await db.insert(submission).values({
			userId: event.locals.user.id,
			data: JSON.stringify(form.data)
		});

		throw redirect(303, '/team');
	}
};
