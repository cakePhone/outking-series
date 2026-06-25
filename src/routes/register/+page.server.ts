import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { teamRegisterSchema } from '$lib/validators/team-register';
import { isGuildMember } from '$lib/server/discord';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import { validatePlayers } from '$lib/server/riot';
import type { Actions, PageServerLoad } from './$types';

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
			players: [{ discord: '', riot_id: '', display_name: '' }],
			staff: []
		}
	});

	const member = await isGuildMember(event.locals.user.id);

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
				text: 'Por favor corrige os erros no formulário.'
			});
		}

		const member = await isGuildMember(event.locals.user.id);
		if (!member) {
			const url = env.DISCORD_INVITE_URL ?? '#';
			return message(form, {
				type: 'error',
				text: `Parece que ainda não fazes parte do servidor da Outking. Entra primeiro: ${url}`
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
					msg = 'Formato inválido. Usa: Nome#Tag';
					break;
				case 'not_found':
					msg = 'Riot ID não encontrado. Verifica o nome e a tag.';
					break;
				case 'unranked':
					msg = 'Este jogador ainda não tem rank competitivo.';
					break;
				case 'rank_too_low':
					msg = `Rank atual: ${r.rank}. Mínimo exigido: Ascendente 3.`;
					break;
				default:
					msg = 'Erro ao validar o rank.';
			}
			// setError paths are runtime-validated by superforms; cast needed for dynamic indices
			setError(form, field as never, msg);
			rankBlocked = true;
		}

		if (rankBlocked) {
			return message(form, {
				type: 'error',
				text: 'Alguns jogadores não cumprem os requisitos de rank (Ascendente 3 ou superior).'
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
