import { teamRepository } from '@/lib/repositories/team.repository';
import {
  createTeamSchema,
  updateTeamSchema,
  teamQuerySchema,
} from '@/lib/validation/team';
import { ZodError } from 'zod';

export class TeamServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 400, details?: unknown) {
    super(message);
    this.name = 'TeamServiceError';
    this.status = status;
    this.details = details;
  }
}

export const teamService = {
  async listTeams(queryParams?: unknown) {
    try {
      const filters = queryParams ? teamQuerySchema.parse(queryParams) : undefined;
      return await teamRepository.findAll(filters);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new TeamServiceError('Invalid query parameters', 400, error.flatten());
      }
      throw error;
    }
  },

  async getTeam(id: string) {
    if (!id) {
      throw new TeamServiceError('Team ID is required', 400);
    }

    const team = await teamRepository.findById(id);
    if (!team) {
      throw new TeamServiceError('Team not found', 404);
    }

    return team;
  },

  async createTeam(input: unknown) {
    try {
      const validated = createTeamSchema.parse(input);

      // Check name uniqueness
      const existingName = await teamRepository.findByName(validated.name);
      if (existingName) {
        throw new TeamServiceError(`Team with name "${validated.name}" already exists`, 400);
      }

      // Check shortName uniqueness
      const existingShort = await teamRepository.findByShortName(validated.shortName);
      if (existingShort) {
        throw new TeamServiceError(
          `Team with short name "${validated.shortName}" already exists`,
          400
        );
      }

      return await teamRepository.create(validated);
    } catch (error) {
      if (error instanceof TeamServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new TeamServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async updateTeam(id: string, input: unknown) {
    if (!id) {
      throw new TeamServiceError('Team ID is required', 400);
    }

    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw new TeamServiceError('Team not found', 404);
    }

    try {
      const validated = updateTeamSchema.parse(input);
      if (Object.keys(validated).length === 0) {
        throw new TeamServiceError('No update data provided', 400);
      }

      // Check name uniqueness if changed
      if (validated.name && validated.name !== existing.name) {
        const duplicate = await teamRepository.findByName(validated.name);
        if (duplicate) {
          throw new TeamServiceError(`Team with name "${validated.name}" already exists`, 400);
        }
      }

      // Check shortName uniqueness if changed
      if (validated.shortName && validated.shortName !== existing.shortName) {
        const duplicate = await teamRepository.findByShortName(validated.shortName);
        if (duplicate) {
          throw new TeamServiceError(
            `Team with short name "${validated.shortName}" already exists`,
            400
          );
        }
      }

      return await teamRepository.update(id, validated);
    } catch (error) {
      if (error instanceof TeamServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new TeamServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async deleteTeam(id: string) {
    if (!id) {
      throw new TeamServiceError('Team ID is required', 400);
    }

    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw new TeamServiceError('Team not found', 404);
    }

    // Check relationship restrictions: matches
    const matchCount = await teamRepository.countMatches(id);
    if (matchCount > 0) {
      throw new TeamServiceError(
        'Cannot delete team with existing match records. Historical match data must be preserved.',
        400
      );
    }

    return await teamRepository.delete(id);
  },
};

