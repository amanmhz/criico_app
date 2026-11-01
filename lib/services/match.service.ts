import { matchRepository } from '@/lib/repositories/match.repository';
import { teamRepository } from '@/lib/repositories/team.repository';
import { playerRepository } from '@/lib/repositories/player.repository';
import { teamPlayerRepository } from '@/lib/repositories/teamPlayer.repository';
import { createMatchSchema, updateMatchSchema } from '@/lib/validation/match';
import { ZodError } from 'zod';

export class MatchServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 400, details?: unknown) {
    super(message);
    this.name = 'MatchServiceError';
    this.status = status;
    this.details = details;
  }
}

export const matchService = {
  async listMatches(filters?: { teamId?: string }) {
    return await matchRepository.findAll(filters);
  },

  async getMatch(id: string) {
    if (!id) {
      throw new MatchServiceError('Match ID is required', 400);
    }

    const match = await matchRepository.findById(id);
    if (!match) {
      throw new MatchServiceError('Match not found', 404);
    }

    return match;
  },

  async createMatch(input: unknown) {
    try {
      const validated = createMatchSchema.parse(input);

      // Verify Team A and Team B exist
      const [teamA, teamB] = await Promise.all([
        teamRepository.findById(validated.teamAId),
        teamRepository.findById(validated.teamBId),
      ]);

      if (!teamA) {
        throw new MatchServiceError('Team A not found', 404);
      }
      if (!teamB) {
        throw new MatchServiceError('Team B not found', 404);
      }

      // Verify each performance's player exists and is assigned to the specified team
      for (const perf of validated.performances) {
        const player = await playerRepository.findById(perf.playerId);
        if (!player) {
          throw new MatchServiceError(`Player with ID "${perf.playerId}" not found`, 404);
        }

        const assignment = await teamPlayerRepository.findAssignment(
          perf.teamId,
          perf.playerId
        );
        if (!assignment) {
          const teamName = perf.teamId === teamA.id ? teamA.name : teamB.name;
          throw new MatchServiceError(
            `Player "${player.name}" is not a member of team "${teamName}". Players must be assigned to the team before recording performances.`,
            400
          );
        }
      }

      return await matchRepository.create(validated);
    } catch (error) {
      if (error instanceof MatchServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new MatchServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async updateMatch(id: string, input: unknown) {
    if (!id) {
      throw new MatchServiceError('Match ID is required', 400);
    }

    const existing = await matchRepository.findById(id);
    if (!existing) {
      throw new MatchServiceError('Match not found', 404);
    }

    try {
      const validated = updateMatchSchema.parse(input);

      const effectiveTeamAId = validated.teamAId || existing.teamAId;
      const effectiveTeamBId = validated.teamBId || existing.teamBId;

      if (effectiveTeamAId === effectiveTeamBId) {
        throw new MatchServiceError('Team A and Team B must be different', 400);
      }

      if (validated.teamAId && validated.teamAId !== existing.teamAId) {
        const teamA = await teamRepository.findById(validated.teamAId);
        if (!teamA) throw new MatchServiceError('Team A not found', 404);
      }

      if (validated.teamBId && validated.teamBId !== existing.teamBId) {
        const teamB = await teamRepository.findById(validated.teamBId);
        if (!teamB) throw new MatchServiceError('Team B not found', 404);
      }

      // If performances are provided, validate them
      if (validated.performances) {
        for (const perf of validated.performances) {
          if (perf.teamId !== effectiveTeamAId && perf.teamId !== effectiveTeamBId) {
            throw new MatchServiceError(
              'Each performance team must be either Team A or Team B of the match',
              400
            );
          }

          const player = await playerRepository.findById(perf.playerId);
          if (!player) {
            throw new MatchServiceError(`Player with ID "${perf.playerId}" not found`, 404);
          }

          const assignment = await teamPlayerRepository.findAssignment(
            perf.teamId,
            perf.playerId
          );
          if (!assignment) {
            throw new MatchServiceError(
              `Player "${player.name}" is not a member of the designated team`,
              400
            );
          }
        }
      }

      return await matchRepository.update(id, validated);
    } catch (error) {
      if (error instanceof MatchServiceError) throw error;
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0]?.message || 'Validation error';
        throw new MatchServiceError(firstIssue, 400, error.flatten());
      }
      throw error;
    }
  },

  async deleteMatch(id: string) {
    if (!id) {
      throw new MatchServiceError('Match ID is required', 400);
    }

    const existing = await matchRepository.findById(id);
    if (!existing) {
      throw new MatchServiceError('Match not found', 404);
    }

    return await matchRepository.delete(id);
  },
};

