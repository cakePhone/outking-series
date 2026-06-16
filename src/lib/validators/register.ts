import { z } from 'zod';

export const registerSchema = z.object({
	riot_game_name: z.string().min(3).max(16),
	riot_tagline: z.string().min(2).max(5)
});

export type RegisterForm = z.infer<typeof registerSchema>;
