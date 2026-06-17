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
	role: z.string().min(2, 'Cargo obrigatório')
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

	// Roster (5-7: minimum 5 for Valorant, up to 2 substitutes)
	players: z
		.array(playerSchema)
		.min(5, 'Mínimo 5 jogadores para uma equipa de Valorant')
		.max(7, 'Máximo 7 jogadores'),

	// Technical staff
	staff: z.array(staffSchema)
});

export type TeamRegisterForm = z.infer<typeof teamRegisterSchema>;
