import { describe, it, expect } from 'vitest';
import { calculateImpactScore } from '@/lib/impact-score';

describe('Player Impact Score Calculation', () => {
  it('1. Bowler with zero matches receives -50 points adjustment', () => {
    // (0 * 1.2) + (0 * 20 * 1.5) - 50 = -50
    const score = calculateImpactScore({
      role: 'BOWLER',
      matchesPlayed: 0,
      totalRuns: 0,
      totalWickets: 0,
    });
    expect(score).toBe(-50);
  });

  it('2. Wicketkeeper with high runs receives +30 bonus with normal match count', () => {
    // (1000 * 1.2) + (5 * 20) + 30 = 1200 + 100 + 30 = 1330
    // matchesPlayed = 15 (between 5 and 20, adjustment = 0)
    const score = calculateImpactScore({
      role: 'WICKETKEEPER',
      matchesPlayed: 15,
      totalRuns: 1000,
      totalWickets: 5,
    });
    expect(score).toBe(1330);
  });

  it('3. Batsman with more than 20 matches receives 1.3 run multiplier and +100 bonus', () => {
    // (500 * 1.2 * 1.3) + (2 * 20) + 100 = 780 + 40 + 100 = 920
    const score = calculateImpactScore({
      role: 'BATSMAN',
      matchesPlayed: 25,
      totalRuns: 500,
      totalWickets: 2,
    });
    expect(score).toBe(920);
  });

  it('4. Bowler with wickets and fewer than 5 matches receives 1.5 wicket multiplier and -50 deduction', () => {
    // (20 * 1.2) + (10 * 20 * 1.5) - 50 = 24 + 300 - 50 = 274
    const score = calculateImpactScore({
      role: 'BOWLER',
      matchesPlayed: 4,
      totalRuns: 20,
      totalWickets: 10,
    });
    expect(score).toBe(274);
  });

  it('calculates All-rounder score with standard formula and neutral match adjustment', () => {
    // (200 * 1.2) + (10 * 20) = 240 + 200 = 440
    // matchesPlayed = 10 (no adjustment)
    const score = calculateImpactScore({
      role: 'ALL_ROUNDER',
      matchesPlayed: 10,
      totalRuns: 200,
      totalWickets: 10,
    });
    expect(score).toBe(440);
  });

  describe('Edge Case: Wicketkeeper Constraints', () => {
    it('verifies Wicketkeeper uses normal 1.0 wicket multiplier and NOT Bowler 1.5 multiplier', () => {
      // 10 matches (neutral adjustment = 0)
      // runs = 0, wickets = 10
      // If bowler multiplier (1.5) was applied: 10 * 20 * 1.5 + 30 = 330
      // With correct 1.0 multiplier: 10 * 20 * 1.0 + 30 = 230
      const score = calculateImpactScore({
        role: 'WICKETKEEPER',
        matchesPlayed: 10,
        totalRuns: 0,
        totalWickets: 10,
      });
      expect(score).toBe(230);
    });

    it('rejects custom configuration giving Wicketkeeper a Bowler multiplier', () => {
      const invalidModifiers = {
        BATSMAN: { runMultiplier: 1.3 as const, wicketMultiplier: 1.0 as const, flatBonus: 0 as const },
        BOWLER: { runMultiplier: 1.0 as const, wicketMultiplier: 1.5 as const, flatBonus: 0 as const },
        // Illegally applying 1.5 bowler multiplier to WICKETKEEPER
        WICKETKEEPER: { runMultiplier: 1.0, wicketMultiplier: 1.5, flatBonus: 30 },
        ALL_ROUNDER: { runMultiplier: 1.0 as const, wicketMultiplier: 1.0 as const, flatBonus: 0 as const },
      };

      expect(() =>
        calculateImpactScore(
          {
            role: 'WICKETKEEPER',
            matchesPlayed: 10,
            totalRuns: 100,
            totalWickets: 5,
          },
          invalidModifiers as unknown as Parameters<typeof calculateImpactScore>[1]
        )
      ).toThrow(/Edge case violation: A Wicketkeeper cannot have a Bowler role multiplier/);
    });

    it('rejects custom configuration where Wicketkeeper does not receive flat +30 bonus', () => {
      const invalidModifiers = {
        BATSMAN: { runMultiplier: 1.3 as const, wicketMultiplier: 1.0 as const, flatBonus: 0 as const },
        BOWLER: { runMultiplier: 1.0 as const, wicketMultiplier: 1.5 as const, flatBonus: 0 as const },
        // Missing +30 bonus
        WICKETKEEPER: { runMultiplier: 1.0, wicketMultiplier: 1.0, flatBonus: 0 },
        ALL_ROUNDER: { runMultiplier: 1.0 as const, wicketMultiplier: 1.0 as const, flatBonus: 0 as const },
      };

      expect(() =>
        calculateImpactScore(
          {
            role: 'WICKETKEEPER',
            matchesPlayed: 10,
            totalRuns: 100,
            totalWickets: 5,
          },
          invalidModifiers as unknown as Parameters<typeof calculateImpactScore>[1]
        )
      ).toThrow(/Edge case violation: A Wicketkeeper must receive exactly a flat \+30 points bonus/);
    });
  });
});

