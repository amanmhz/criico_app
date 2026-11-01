import { playerRepository } from '@/lib/repositories/player.repository';
import {
  createPlayerSchema,
  updatePlayerSchema,
  playerQuerySchema,
} from '@/lib/validation/player';
import { ZodError } from 'zod';

export class PlayerServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 400, details?: unknown) {
    super(message);
    this.name = 'PlayerServiceError';
    this.status = status;
    this.details = details;
  }
}

export const playerService = {
  async listPlayers(queryParams?: unknown) {
    try {
      const filters = queryParams ? playerQuerySchema.parse(queryParams) : undefined;
      return await playerRepository.findAll(filters);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new PlayerServiceError('Invalid query parameters', 400, error.flatten());
      }
      throw error;
    }
  },

  async getPlayer(id: string) {
    if (!id) {
      throw new PlayerServiceError('Player ID is required', 400);
    }

    const player = await playerRepository.findById(id);
    if (!player) {
      throw new PlayerServiceError('Player not found', 404);
    }

    return player;
  },

  async createPlayer(input: unknown) {
    try {
      const validated = createPlayerSchema.parse(input);
      return await playerRepository.create(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new PlayerServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async updatePlayer(id: string, input: unknown) {
    if (!id) {
      throw new PlayerServiceError('Player ID is required', 400);
    }

    // Verify player exists
    const existing = await playerRepository.findById(id);
    if (!existing) {
      throw new PlayerServiceError('Player not found', 404);
    }

    try {
      const validated = updatePlayerSchema.parse(input);
      if (Object.keys(validated).length === 0) {
        throw new PlayerServiceError('No update data provided', 400);
      }
      return await playerRepository.update(id, validated);
    } catch (error) {
      if (error instanceof PlayerServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new PlayerServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async deletePlayer(id: string) {
    if (!id) {
      throw new PlayerServiceError('Player ID is required', 400);
    }

    const existing = await playerRepository.findById(id);
    if (!existing) {
      throw new PlayerServiceError('Player not found', 404);
    }

    // Check relationship restrictions: matches / performances
    const perfCount = await playerRepository.countPerformances(id);
    if (perfCount > 0) {
      throw new PlayerServiceError(
        'Cannot delete player who has recorded match performances. Historical data must be preserved.',
        400
      );
    }

    return await playerRepository.delete(id);
  },
};
