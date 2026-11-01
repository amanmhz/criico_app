import { describe, it, expect, vi } from 'vitest';
import { createMatchSchema } from '@/lib/validation/match';
import { matchService } from '@/lib/services/match.service';
import { teamRepository } from '@/lib/repositories/team.repository';
import { playerRepository } from '@/lib/repositories/player.repository';
import { teamPlayerRepository } from '@/lib/repositories/teamPlayer.repository';

describe('Match Validation Schemas', () => {
  it('prevents Team A and Team B from being identical', () => {
    const result = createMatchSchema.safeParse({
      teamAId: 'team-1',
      teamBId: 'team-1',
      playedAt: new Date().toISOString(),
      performances: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects performances for a team that is not participating in the match', () => {
    const result = createMatchSchema.safeParse({
      teamAId: 'team-1',
      teamBId: 'team-2',
      playedAt: new Date().toISOString(),
      performances: [
        {
          playerId: 'player-1',
          teamId: 'team-3', // neither team-1 nor team-2
          runs: 40,
          wickets: 1,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate performances for the same player in a single match', () => {
    const result = createMatchSchema.safeParse({
      teamAId: 'team-1',
      teamBId: 'team-2',
      playedAt: new Date().toISOString(),
      performances: [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          runs: 20,
          wickets: 0,
        },
        {
          playerId: 'player-1',
          teamId: 'team-1',
          runs: 30,
          wickets: 1,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('validates a valid match payload with valid performances', () => {
    const result = createMatchSchema.safeParse({
      teamAId: 'team-1',
      teamBId: 'team-2',
      playedAt: new Date().toISOString(),
      result: 'Team 1 won by 20 runs',
      performances: [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          runs: 50,
          wickets: 0,
        },
        {
          playerId: 'player-2',
          teamId: 'team-2',
          runs: 25,
          wickets: 2,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('Match Service Layer', () => {
  it('throws 404 when Team A or Team B does not exist', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      matchService.createMatch({
        teamAId: 'non-existent-team',
        teamBId: 'team-2',
        playedAt: new Date(),
        performances: [],
      })
    ).rejects.toThrow('Team A not found');
  });

  it('throws 400 when a performance player is not assigned to the team', async () => {
    vi.spyOn(teamRepository, 'findById').mockImplementation(async (id: string) => ({
      id,
      name: id === 'team-1' ? 'Team 1' : 'Team 2',
      shortName: id === 'team-1' ? 'T1' : 'T2',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
      _count: { players: 0, teamAMatches: 0, teamBMatches: 0 },
    }));

    vi.spyOn(playerRepository, 'findById').mockResolvedValueOnce({
      id: 'player-1',
      name: 'Unassigned Player',
      role: 'BATSMAN',
      basePrice: 1000,
      matchesPlayed: 0,
      totalRuns: 0,
      totalWickets: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      teams: [],
      performances: [],
      _count: { teams: 0, performances: 0 },
    });

    vi.spyOn(teamPlayerRepository, 'findAssignment').mockResolvedValueOnce(null);

    await expect(
      matchService.createMatch({
        teamAId: 'team-1',
        teamBId: 'team-2',
        playedAt: new Date(),
        performances: [
          {
            playerId: 'player-1',
            teamId: 'team-1',
            runs: 10,
            wickets: 0,
          },
        ],
      })
    ).rejects.toThrow(/is not a member of team/);
  });
});

