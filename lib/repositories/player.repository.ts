import { prisma } from '@/lib/prisma';
import type { PlayerRole } from '@prisma/client';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validation/player';

export const playerRepository = {
  async findAll(filters?: { name?: string; role?: PlayerRole }) {
    const where: {
      name?: { contains: string; mode: 'insensitive' };
      role?: PlayerRole;
    } = {};

    if (filters?.name && filters.name.trim().length > 0) {
      where.name = {
        contains: filters.name.trim(),
        mode: 'insensitive',
      };
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    return prisma.player.findMany({
      where,
      include: {
        _count: {
          select: {
            teams: true,
            performances: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async findById(id: string) {
    return prisma.player.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true,
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        performances: {
          include: {
            match: true,
            team: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            teams: true,
            performances: true,
          },
        },
      },
    });
  },

  async create(data: CreatePlayerInput) {
    return prisma.player.create({
      data: {
        name: data.name,
        role: data.role,
        basePrice: data.basePrice,
        matchesPlayed: data.matchesPlayed ?? 0,
        totalRuns: data.totalRuns ?? 0,
        totalWickets: data.totalWickets ?? 0,
      },
    });
  },

  async update(id: string, data: UpdatePlayerInput) {
    return prisma.player.update({
      where: { id },
      data,
    });
  },

  async countPerformances(id: string) {
    return prisma.playerPerformance.count({
      where: { playerId: id },
    });
  },

  async delete(id: string) {
    // Delete team assignments first in a transaction, then delete player
    return prisma.$transaction(async (tx) => {
      await tx.teamPlayer.deleteMany({
        where: { playerId: id },
      });
      return tx.player.delete({
        where: { id },
      });
    });
  },
};

