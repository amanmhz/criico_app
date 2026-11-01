import { describe, it, expect, vi } from 'vitest';
import {
  createPlayerSchema,
  updatePlayerSchema,
} from '@/lib/validation/player';
import { playerService, PlayerServiceError } from '@/lib/services/player.service';
import { playerRepository } from '@/lib/repositories/player.repository';

describe('Player Validation Schemas', () => {
  it('validates a valid player creation payload', () => {
    const valid = {
      name: 'Sachin Tendulkar',
      role: 'BATSMAN',
      basePrice: 50000,
      matchesPlayed: 463,
      totalRuns: 18426,
      totalWickets: 154,
    };
    const result = createPlayerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Sachin Tendulkar');
      expect(result.data.role).toBe('BATSMAN');
    }
  });

  it('rejects missing name or empty name', () => {
    const result = createPlayerSchema.safeParse({
      name: '   ',
      role: 'BOWLER',
      basePrice: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid player role', () => {
    const result = createPlayerSchema.safeParse({
      name: 'Jasprit Bumrah',
      role: 'COACH',
      basePrice: 20000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative base price and negative stats', () => {
    const result = createPlayerSchema.safeParse({
      name: 'Jasprit Bumrah',
      role: 'BOWLER',
      basePrice: -500,
      matchesPlayed: -2,
    });
    expect(result.success).toBe(false);
  });

  it('allows partial updates with valid fields', () => {
    const result = updatePlayerSchema.safeParse({
      totalRuns: 500,
    });
    expect(result.success).toBe(true);
  });
});

describe('Player Service Layer', () => {
  it('throws 404 when getting non-existent player', async () => {
    vi.spyOn(playerRepository, 'findById').mockResolvedValueOnce(null);

    await expect(playerService.getPlayer('non-existent-id')).rejects.toThrow(
      PlayerServiceError
    );
  });

  it('throws error when attempting to delete player with match performances', async () => {
    vi.spyOn(playerRepository, 'findById').mockResolvedValueOnce({
      id: 'p1',
      name: 'Test Player',
      role: 'BATSMAN',
      basePrice: 1000,
      matchesPlayed: 5,
      totalRuns: 100,
      totalWickets: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      teams: [],
      performances: [],
      _count: { teams: 0, performances: 1 },
    });

    vi.spyOn(playerRepository, 'countPerformances').mockResolvedValueOnce(1);

    await expect(playerService.deletePlayer('p1')).rejects.toThrow(
      'Cannot delete player who has recorded match performances'
    );
  });
});

