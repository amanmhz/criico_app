import { z } from 'zod';

export const addTeamPlayerSchema = z.object({
  playerId: z.string().trim().min(1, 'Player ID is required'),
});

export type AddTeamPlayerInput = z.infer<typeof addTeamPlayerSchema>;

