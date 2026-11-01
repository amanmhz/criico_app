import { describe, it, expect, vi } from 'vitest';
import { teamPlayerService } from '@/lib/services/teamPlayer.service';
import { teamRepository } from '@/lib/repositories/team.repository';
import { playerRepository } from '@/lib/repositories/player.repository';
import { teamPlayerRepository } from '@/lib/repositories/teamPlayer.repository';

describe('Team Player Management Layer', () => {
  it('throws 404 if team does not exist when adding player', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      teamPlayerService.addPlayerToTeam('invalid-team', { playerId: 'p1' })
    ).rejects.toThrow('Team not found');
  });

  it('throws 404 if player does not exist when adding player to team', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce({
      id: 't1',
      name: 'Team 1',
      shortName: 'T1',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
      _count: { players: 0, teamAMatches: 0, teamBMatches: 0 },
    });
    vi.spyOn(playerRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      teamPlayerService.addPlayerToTeam('t1', { playerId: 'invalid-player' })
    ).rejects.toThrow('Player not found');
  });

  it('prevents duplicate assignment of player to the same team', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce({
      id: 't1',
      name: 'Team 1',
      shortName: 'T1',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
      _count: { players: 1, teamAMatches: 0, teamBMatches: 0 },
    });
    vi.spyOn(playerRepository, 'findById').mockResolvedValueOnce({
      id: 'p1',
      name: 'MS Dhoni',
      role: 'WICKETKEEPER',
      basePrice: 50000,
      matchesPlayed: 350,
      totalRuns: 10773,
      totalWickets: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      teams: [],
      performances: [],
      _count: { teams: 1, performances: 0 },
    });
    vi.spyOn(teamPlayerRepository, 'findAssignment').mockResolvedValueOnce({
      id: 'tp1',
      teamId: 't1',
      playerId: 'p1',
      joinedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(
      teamPlayerService.addPlayerToTeam('t1', { playerId: 'p1' })
    ).rejects.toThrow('Player "MS Dhoni" is already assigned to this team');
  });

  it('throws 404 when removing a player that is not assigned to the team', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce({
      id: 't1',
      name: 'Team 1',
      shortName: 'T1',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
      _count: { players: 0, teamAMatches: 0, teamBMatches: 0 },
    });
    vi.spyOn(teamPlayerRepository, 'findAssignment').mockResolvedValueOnce(null);

    await expect(
      teamPlayerService.removePlayerFromTeam('t1', 'p1')
    ).rejects.toThrow('Player is not currently assigned to this team');
  });
});

