import { z } from 'zod';

export const performanceSchema = z.object({
  playerId: z.string().trim().min(1, 'Player ID is required'),
  teamId: z.string().trim().min(1, 'Team ID is required'),
  runs: z.coerce.number().int('Runs must be an integer').min(0, 'Runs must be non-negative').default(0),
  wickets: z.coerce.number().int('Wickets must be an integer').min(0, 'Wickets must be non-negative').default(0),
});

export const createMatchSchema = z
  .object({
    teamAId: z.string().trim().min(1, 'Team A is required'),
    teamBId: z.string().trim().min(1, 'Team B is required'),
    playedAt: z.coerce.date(),
    result: z.string().trim().max(200, 'Result description too long').optional().nullable(),
    performances: z.array(performanceSchema).default([]),
  })
  .refine((data) => data.teamAId !== data.teamBId, {
    message: 'Team A and Team B must be different',
    path: ['teamBId'],
  })
  .refine(
    (data) => {
      // Validate that all performance team IDs belong to either teamA or teamB
      return data.performances.every(
        (p) => p.teamId === data.teamAId || p.teamId === data.teamBId
      );
    },
    {
      message: 'Each player performance must belong to either Team A or Team B',
      path: ['performances'],
    }
  )
  .refine(
    (data) => {
      // Validate no duplicate player in performances for the same match
      const playerIds = data.performances.map((p) => p.playerId);
      const uniquePlayerIds = new Set(playerIds);
      return uniquePlayerIds.size === playerIds.length;
    },
    {
      message: 'A player cannot have duplicate performance entries in a single match',
      path: ['performances'],
    }
  );

export const updateMatchSchema = z
  .object({
    teamAId: z.string().trim().min(1).optional(),
    teamBId: z.string().trim().min(1).optional(),
    playedAt: z.coerce.date().optional(),
    result: z.string().trim().max(200).optional().nullable(),
    performances: z.array(performanceSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.teamAId && data.teamBId) {
        return data.teamAId !== data.teamBId;
      }
      return true;
    },
    {
      message: 'Team A and Team B must be different',
      path: ['teamBId'],
    }
  );

export type PerformanceInput = z.infer<typeof performanceSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;

