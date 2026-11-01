import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(1, 'Team name is required').max(100, 'Team name is too long'),
  shortName: z
    .string()
    .trim()
    .min(1, 'Short name is required')
    .max(10, 'Short name must be at most 10 characters')
    .transform((val) => val.toUpperCase()),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const teamQuerySchema = z.object({
  name: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type TeamQueryParams = z.infer<typeof teamQuerySchema>;

