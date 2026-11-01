import { prisma } from '@/lib/prisma';

export const teamPlayerRepository = {
  async findByTeam(teamId: string) {
    return prisma.teamPlayer.findMany({
      where: { teamId },
      include: {
        player: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  },

  async findAvailablePlayers(teamId: string) {
    // Find all players not assigned to this team
    return prisma.player.findMany({
      where: {
        teams: {
          none: {
            teamId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async findAssignment(teamId: string, playerId: string) {
    return prisma.teamPlayer.findUnique({
      where: {
        teamId_playerId: {
          teamId,
          playerId,
        },
      },
    });
  },

  async add(teamId: string, playerId: string) {
    return prisma.teamPlayer.create({
      data: {
        teamId,
        playerId,
      },
      include: {
        player: true,
      },
    });
  },

  async remove(teamId: string, playerId: string) {
    return prisma.teamPlayer.delete({
      where: {
        teamId_playerId: {
          teamId,
          playerId,
        },
      },
    });
  },
};

