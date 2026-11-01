import { prisma } from '@/lib/prisma';
import { calculateImpactScore } from '@/lib/impact-score';
import type { PlayerRole } from '@prisma/client';
import type { LeaderboardPlayer } from '@/types/leaderboard';

export interface LeaderboardFilters {
  role?: PlayerRole;
  teamId?: string;
}

export const leaderboardService = {
  async getLeaderboard(filters?: LeaderboardFilters): Promise<LeaderboardPlayer[]> {
    const where: {
      role?: PlayerRole;
      teams?: {
        some: {
          teamId: string;
        };
      };
    } = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.teamId) {
      where.teams = {
        some: {
          teamId: filters.teamId,
        },
      };
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    // Compute impact score for each player
    const scoredPlayers = players.map((player) => {
      const impactScore = calculateImpactScore({
        role: player.role,
        matchesPlayed: player.matchesPlayed,
        totalRuns: player.totalRuns,
        totalWickets: player.totalWickets,
      });

      return {
        id: player.id,
        name: player.name,
        role: player.role,
        matchesPlayed: player.matchesPlayed,
        totalRuns: player.totalRuns,
        totalWickets: player.totalWickets,
        impactScore,
        teams: player.teams.map((t) => ({
          id: t.team.id,
          name: t.team.name,
          shortName: t.team.shortName,
        })),
      };
    });

    // Sort descending by impact score; tie-breaker: totalRuns, then totalWickets
    scoredPlayers.sort((a, b) => {
      if (b.impactScore !== a.impactScore) {
        return b.impactScore - a.impactScore;
      }
      if (b.totalRuns !== a.totalRuns) {
        return b.totalRuns - a.totalRuns;
      }
      return b.totalWickets - a.totalWickets;
    });

    // Assign ranking
    return scoredPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  },
};

