import { z } from 'zod';

export const playerRoleEnum = z.enum([
  'BATSMAN',
  'BOWLER',
  'ALL_ROUNDER',
  'WICKETKEEPER',
]);

export const createPlayerSchema = z.object({
  name: z.string().trim().min(1, 'Player name is required'),
  role: playerRoleEnum,
  basePrice: z.coerce.number().min(0, 'Base price must be a non-negative number'),
  matchesPlayed: z.coerce
    .number()
    .int('Matches played must be an integer')
    .min(0, 'Matches played must be non-negative')
    .default(0),
  totalRuns: z.coerce
    .number()
    .int('Total runs must be an integer')
    .min(0, 'Total runs must be non-negative')
    .default(0),
  totalWickets: z.coerce
    .number()
    .int('Total wickets must be an integer')
    .min(0, 'Total wickets must be non-negative')
    .default(0),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export const playerQuerySchema = z.object({
  name: z.string().optional(),
  role: playerRoleEnum.optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type PlayerQueryParams = z.infer<typeof playerQuerySchema>;

