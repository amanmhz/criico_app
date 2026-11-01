import { describe, it, expect, vi } from 'vitest';
import { createTeamSchema } from '@/lib/validation/team';
import { teamService } from '@/lib/services/team.service';
import { teamRepository } from '@/lib/repositories/team.repository';

describe('Team Validation Schemas', () => {
  it('validates and transforms team input', () => {
    const valid = {
      name: 'Chennai Super Kings',
      shortName: 'csk',
      description: 'Defending champions',
    };
    const result = createTeamSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Chennai Super Kings');
      expect(result.data.shortName).toBe('CSK'); // Transformed to uppercase
    }
  });

  it('rejects missing or empty team name', () => {
    const result = createTeamSchema.safeParse({
      name: '',
      shortName: 'MI',
    });
    expect(result.success).toBe(false);
  });

  it('rejects shortName exceeding 10 characters', () => {
    const result = createTeamSchema.safeParse({
      name: 'Royal Challengers Bengaluru',
      shortName: 'VERYLONGCODE123',
    });
    expect(result.success).toBe(false);
  });
});

describe('Team Service Layer', () => {
  it('throws 400 when creating team with duplicate name', async () => {
    vi.spyOn(teamRepository, 'findByName').mockResolvedValueOnce({
      id: 't1',
      name: 'Mumbai Indians',
      shortName: 'MI',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      teamService.createTeam({
        name: 'Mumbai Indians',
        shortName: 'MI2',
      })
    ).rejects.toThrow('Team with name "Mumbai Indians" already exists');
  });

  it('throws 400 when creating team with duplicate shortName', async () => {
    vi.spyOn(teamRepository, 'findByName').mockResolvedValueOnce(null);
    vi.spyOn(teamRepository, 'findByShortName').mockResolvedValueOnce({
      id: 't1',
      name: 'Old Team',
      shortName: 'MI',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      teamService.createTeam({
        name: 'New Team',
        shortName: 'MI',
      })
    ).rejects.toThrow('Team with short name "MI" already exists');
  });

  it('throws error when deleting a team with existing match history', async () => {
    vi.spyOn(teamRepository, 'findById').mockResolvedValueOnce({
      id: 't1',
      name: 'Team with Matches',
      shortName: 'TWM',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      players: [],
      _count: { players: 5, teamAMatches: 2, teamBMatches: 1 },
    });

    vi.spyOn(teamRepository, 'countMatches').mockResolvedValueOnce(3);

    await expect(teamService.deleteTeam('t1')).rejects.toThrow(
      'Cannot delete team with existing match records'
    );
  });
});
