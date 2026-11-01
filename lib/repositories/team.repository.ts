import { prisma } from '@/lib/prisma';
import type { CreateTeamInput, UpdateTeamInput } from '@/lib/validation/team';

export const teamRepository = {
  async findAll(filters?: { name?: string }) {
    const where: {
      name?: { contains: string; mode: 'insensitive' };
    } = {};

    if (filters?.name && filters.name.trim().length > 0) {
      where.name = {
        contains: filters.name.trim(),
        mode: 'insensitive',
      };
    }

    return prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            players: true,
            teamAMatches: true,
            teamBMatches: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            player: true,
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        _count: {
          select: {
            players: true,
            teamAMatches: true,
            teamBMatches: true,
          },
        },
      },
    });
  },

  async findByName(name: string) {
    return prisma.team.findUnique({
      where: { name },
    });
  },

  async findByShortName(shortName: string) {
    return prisma.team.findUnique({
      where: { shortName },
    });
  },

  async create(data: CreateTeamInput) {
    return prisma.team.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        description: data.description ?? null,
      },
    });
  },

  async update(id: string, data: UpdateTeamInput) {
    return prisma.team.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.shortName && { shortName: data.shortName }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  },

  async countMatches(id: string) {
    const countA = await prisma.match.count({ where: { teamAId: id } });
    const countB = await prisma.match.count({ where: { teamBId: id } });
    return countA + countB;
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      // Remove team assignments first
      await tx.teamPlayer.deleteMany({
        where: { teamId: id },
      });
      return tx.team.delete({
        where: { id },
      });
    });
  },
};

