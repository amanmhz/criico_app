import { teamPlayerRepository } from '@/lib/repositories/teamPlayer.repository';
import { teamRepository } from '@/lib/repositories/team.repository';
import { playerRepository } from '@/lib/repositories/player.repository';
import { addTeamPlayerSchema } from '@/lib/validation/teamPlayer';
import { ZodError } from 'zod';

export class TeamPlayerServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 400, details?: unknown) {
    super(message);
    this.name = 'TeamPlayerServiceError';
    this.status = status;
    this.details = details;
  }
}

export const teamPlayerService = {
  async listTeamPlayers(teamId: string) {
    if (!teamId) {
      throw new TeamPlayerServiceError('Team ID is required', 400);
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new TeamPlayerServiceError('Team not found', 404);
    }

    return await teamPlayerRepository.findByTeam(teamId);
  },

  async listAvailablePlayers(teamId: string) {
    if (!teamId) {
      throw new TeamPlayerServiceError('Team ID is required', 400);
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new TeamPlayerServiceError('Team not found', 404);
    }

    return await teamPlayerRepository.findAvailablePlayers(teamId);
  },

  async addPlayerToTeam(teamId: string, input: unknown) {
    if (!teamId) {
      throw new TeamPlayerServiceError('Team ID is required', 400);
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new TeamPlayerServiceError('Team not found', 404);
    }

    try {
      const { playerId } = addTeamPlayerSchema.parse(input);

      // Verify player exists
      const player = await playerRepository.findById(playerId);
      if (!player) {
        throw new TeamPlayerServiceError('Player not found', 404);
      }

      // Check if duplicate assignment
      const existingAssignment = await teamPlayerRepository.findAssignment(teamId, playerId);
      if (existingAssignment) {
        throw new TeamPlayerServiceError(
          `Player "${player.name}" is already assigned to this team`,
          400
        );
      }

      return await teamPlayerRepository.add(teamId, playerId);
    } catch (error) {
      if (error instanceof TeamPlayerServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new TeamPlayerServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async removePlayerFromTeam(teamId: string, playerId: string) {
    if (!teamId || !playerId) {
      throw new TeamPlayerServiceError('Both teamId and playerId are required', 400);
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new TeamPlayerServiceError('Team not found', 404);
    }

    const assignment = await teamPlayerRepository.findAssignment(teamId, playerId);
    if (!assignment) {
      throw new TeamPlayerServiceError('Player is not currently assigned to this team', 404);
    }

    // Safely remove assignment without deleting player record
    return await teamPlayerRepository.remove(teamId, playerId);
  },
};

