import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { teamRegisterSchema } from '$lib/validators/team-register';
import { isGuildMember } from '$lib/server/discord';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { submission } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) throw redirect(303, '/');

	const parentData = await event.parent();
	const discordUsername = parentData.discord?.profile.username ?? event.locals.user.name ?? '';

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

		// Save to database
		await db.insert(submission).values({
			userId: event.locals.user.id,
			data: JSON.stringify(form.data)
		});

		return message(form, {
			type: 'success',
			text: 'Equipa registada com sucesso! A tua inscrição será revista em breve.'
		});
	}
};
