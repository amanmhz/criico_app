import { prisma } from '@/lib/prisma';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validation/match';

export const matchRepository = {
  async findAll(filters?: { teamId?: string }) {
    const where: {
      OR?: [{ teamAId: string }, { teamBId: string }];
    } = {};

    if (filters?.teamId) {
      where.OR = [{ teamAId: filters.teamId }, { teamBId: filters.teamId }];
    }

    return prisma.match.findMany({
      where,
      include: {
        teamA: true,
        teamB: true,
        _count: {
          select: {
            performances: true,
          },
        },
      },
      orderBy: {
        playedAt: 'desc',
      },
    });
  },

  async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        teamA: true,
        teamB: true,
        performances: {
          include: {
            player: true,
            team: true,
          },
          orderBy: [
            { runs: 'desc' },
            { wickets: 'desc' },
          ],
        },
      },
    });
  },

  async create(data: CreateMatchInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the match
      const match = await tx.match.create({
        data: {
          teamAId: data.teamAId,
          teamBId: data.teamBId,
          playedAt: data.playedAt,
          result: data.result ?? null,
        },
      });

      // 2. Create performances and update player career stats
      if (data.performances && data.performances.length > 0) {
        for (const perf of data.performances) {
          await tx.playerPerformance.create({
            data: {
              matchId: match.id,
              playerId: perf.playerId,
              teamId: perf.teamId,
              runs: perf.runs,
              wickets: perf.wickets,
            },
          });

          // Update player stats atomically
          await tx.player.update({
            where: { id: perf.playerId },
            data: {
              matchesPlayed: { increment: 1 },
              totalRuns: { increment: perf.runs },
              totalWickets: { increment: perf.wickets },
            },
          });
        }
      }

      return match;
    });
  },

  async update(id: string, data: UpdateMatchInput) {
    return prisma.$transaction(async (tx) => {
      const currentMatch = await tx.match.findUnique({
        where: { id },
        include: { performances: true },
      });

      if (!currentMatch) {
        throw new Error('Match not found');
      }

      // If performances are provided in the update, recalculate stats
      if (data.performances !== undefined) {
        // 1. Revert previous stats for all existing performances
        for (const oldPerf of currentMatch.performances) {
          await tx.player.update({
            where: { id: oldPerf.playerId },
            data: {
              matchesPlayed: { decrement: 1 },
              totalRuns: { decrement: oldPerf.runs },
              totalWickets: { decrement: oldPerf.wickets },
            },
          });
        }

        // 2. Remove existing performances
        await tx.playerPerformance.deleteMany({
          where: { matchId: id },
        });

        // 3. Insert new performances and increment new stats
        for (const newPerf of data.performances) {
          await tx.playerPerformance.create({
            data: {
              matchId: id,
              playerId: newPerf.playerId,
              teamId: newPerf.teamId,
              runs: newPerf.runs,
              wickets: newPerf.wickets,
            },
          });

          await tx.player.update({
            where: { id: newPerf.playerId },
            data: {
              matchesPlayed: { increment: 1 },
              totalRuns: { increment: newPerf.runs },
              totalWickets: { increment: newPerf.wickets },
            },
          });
        }
      }

      // 4. Update match fields
      return tx.match.update({
        where: { id },
        data: {
          ...(data.teamAId && { teamAId: data.teamAId }),
          ...(data.teamBId && { teamBId: data.teamBId }),
          ...(data.playedAt && { playedAt: data.playedAt }),
          ...(data.result !== undefined && { result: data.result }),
        },
      });
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id },
        include: { performances: true },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // 1. Revert player statistics
      for (const perf of match.performances) {
        await tx.player.update({
          where: { id: perf.playerId },
          data: {
            matchesPlayed: { decrement: 1 },
            totalRuns: { decrement: perf.runs },
            totalWickets: { decrement: perf.wickets },
          },
        });
      }

      // 2. Delete performances
      await tx.playerPerformance.deleteMany({
        where: { matchId: id },
      });

      // 3. Delete match
      return tx.match.delete({
        where: { id },
      });
    });
  },
};

