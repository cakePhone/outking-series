import { z } from 'zod';

const playerSchema = z.object({
	discord: z.string().min(2, 'Discord obrigatório'),
	riot_id: z.string().min(3, 'Riot ID obrigatório').max(22),
	display_name: z.string().min(2, 'Nome para casters obrigatório').max(32)
});

const staffSchema = z.object({
	discord: z.string().min(2, 'Discord obrigatório'),
	riot_id: z.string().min(3, 'Riot ID obrigatório').max(22),
	display_name: z.string().min(2, 'Nome para casters obrigatório').max(32),
	role: z.enum(['coach', 'analyst'], { message: 'Seleciona um cargo' })
});

export const teamRegisterSchema = z.object({
	// Creator
	creator_role: z.enum(['owner', 'coach', 'player'], {
		message: 'Seleciona o teu cargo'
	}),
	creator_riot_id: z.string().min(3, 'Riot ID obrigatório').max(22),

	// Team
	team_name: z.string().min(2, 'Nome da equipa obrigatório').max(32),
	team_tag: z.string().min(2, 'Tag obrigatória').max(5),
	team_logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
	team_socials: z.string().optional().or(z.literal('')),

	// Roster (1-7: up to 5 starters + 2 subs)
	players: z
		.array(playerSchema)
		.min(1, 'Adiciona pelo menos 1 jogador')
		.max(7, 'Máximo 7 jogadores'),

	// Substitutes (0-2)
	substitutes: z.array(playerSchema).max(2, 'Máximo 2 suplentes'),

	// Technical staff
	staff: z.array(staffSchema)
});

export type TeamRegisterForm = z.infer<typeof teamRegisterSchema>;
