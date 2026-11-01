import type { PlayerRole } from '@prisma/client';

export interface PlayerStatsForScore {
  role: PlayerRole;
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
}

/**
 * TypeScript Type Enforcement for Role Modifiers:
 * Edge Case Rule:
 * If a player is a Wicketkeeper, they get a flat +30 points,
 * but they CANNOT have a Bowler role multiplier (wicketMultiplier must be 1.0, not 1.5).
 */
export interface BatsmanModifier {
  readonly runMultiplier: 1.3;
  readonly wicketMultiplier: 1.0;
  readonly flatBonus: 0;
}

export interface BowlerModifier {
  readonly runMultiplier: 1.0;
  readonly wicketMultiplier: 1.5;
  readonly flatBonus: 0;
}

export interface WicketkeeperModifier {
  readonly runMultiplier: 1.0;
  readonly wicketMultiplier: 1.0; // Enforces: cannot have Bowler multiplier (1.5)
  readonly flatBonus: 30;         // Enforces: flat +30 points
}

export interface AllRounderModifier {
  readonly runMultiplier: 1.0;
  readonly wicketMultiplier: 1.0;
  readonly flatBonus: 0;
}

export interface RoleModifiersMap {
  readonly BATSMAN: BatsmanModifier;
  readonly BOWLER: BowlerModifier;
  readonly WICKETKEEPER: WicketkeeperModifier;
  readonly ALL_ROUNDER: AllRounderModifier;
}

export interface ImpactScoreConfig {
  readonly BASE_RUN_WEIGHT: number;
  readonly BASE_WICKET_WEIGHT: number;
  readonly ROOKIE_THRESHOLD: number;
  readonly ROOKIE_PENALTY: number;
  readonly VETERAN_THRESHOLD: number;
  readonly VETERAN_BONUS: number;
  readonly ROLE_MODIFIERS: RoleModifiersMap;
}

/**
 * Global configuration constants for Impact Score calculations.
 * Enforced via strict TypeScript types (`satisfies ImpactScoreConfig`).
 */
export const IMPACT_CONFIG = {
  // Base scoring weights
  BASE_RUN_WEIGHT: 1.2,
  BASE_WICKET_WEIGHT: 20,

  // Experience adjustments & thresholds
  ROOKIE_THRESHOLD: 5,
  ROOKIE_PENALTY: -50,
  VETERAN_THRESHOLD: 20,
  VETERAN_BONUS: 100,

  // Role-specific multipliers and bonuses enforced by type contract
  ROLE_MODIFIERS: {
    BATSMAN: {
      runMultiplier: 1.3,
      wicketMultiplier: 1.0,
      flatBonus: 0,
    },
    BOWLER: {
      runMultiplier: 1.0,
      wicketMultiplier: 1.5,
      flatBonus: 0,
    },
    WICKETKEEPER: {
      runMultiplier: 1.0,
      wicketMultiplier: 1.0, // Strictly 1.0 — no Bowler multiplier allowed
      flatBonus: 30,         // Strictly flat +30 points
    },
    ALL_ROUNDER: {
      runMultiplier: 1.0,
      wicketMultiplier: 1.0,
      flatBonus: 0,
    },
  },
} as const satisfies ImpactScoreConfig;

/**
 * Runtime validation for role modifier edge cases.
 * Throws an explicit error if a Wicketkeeper has a Bowler wicket multiplier
 * or is missing the +30 flat bonus.
 */
export function validateWicketkeeperConstraints(
  role: PlayerRole,
  modifier: { runMultiplier: number; wicketMultiplier: number; flatBonus: number }
): void {
  if (role === 'WICKETKEEPER') {
    if (modifier.wicketMultiplier > 1.0) {
      throw new Error(
        'Edge case violation: A Wicketkeeper cannot have a Bowler role multiplier (wicketMultiplier must be 1.0).'
      );
    }
    if (modifier.flatBonus !== 30) {
      throw new Error(
        'Edge case violation: A Wicketkeeper must receive exactly a flat +30 points bonus.'
      );
    }
  }
}

/**
 * Calculates experience adjustment based on matches played:
 * - < 5 matches: -50 penalty
 * - > 20 matches: +100 bonus
 * - 5 to 20 matches: 0
 */
function getExperienceAdjustment(matchesPlayed: number): number {
  if (matchesPlayed < IMPACT_CONFIG.ROOKIE_THRESHOLD) {
    return IMPACT_CONFIG.ROOKIE_PENALTY;
  }
  if (matchesPlayed > IMPACT_CONFIG.VETERAN_THRESHOLD) {
    return IMPACT_CONFIG.VETERAN_BONUS;
  }
  return 0;
}

/**
 * Calculates a player's Impact Score based on career statistics and role.
 *
 * Formulas:
 * - Batsman:      (Runs * 1.2 * 1.3) + (Wickets * 20)
 * - Bowler:       (Runs * 1.2) + (Wickets * 20 * 1.5)
 * - Wicketkeeper: (Runs * 1.2) + (Wickets * 20 * 1.0) + 30
 * - All-rounder:  (Runs * 1.2) + (Wickets * 20)
 *
 * Match Experience Adjustments:
 * - Fewer than 5 matches (< 5): -50 points
 * - More than 20 matches (> 20): +100 points
 * - Otherwise (5 to 20 matches): 0 points
 */
export function calculateImpactScore(
  player: PlayerStatsForScore,
  customModifiers?: typeof IMPACT_CONFIG.ROLE_MODIFIERS
): number {
  const { role, matchesPlayed, totalRuns, totalWickets } = player;

  const roleModifiers = customModifiers ?? IMPACT_CONFIG.ROLE_MODIFIERS;
  const modifier = roleModifiers[role] ?? roleModifiers.ALL_ROUNDER;

  // Runtime assertion enforcing Wicketkeeper edge case rule
  validateWicketkeeperConstraints(role, modifier);

  const runComponent =
    totalRuns * IMPACT_CONFIG.BASE_RUN_WEIGHT * modifier.runMultiplier;

  const wicketComponent =
    totalWickets * IMPACT_CONFIG.BASE_WICKET_WEIGHT * modifier.wicketMultiplier;

  const baseScore = runComponent + wicketComponent + modifier.flatBonus;
  const experienceAdjustment = getExperienceAdjustment(matchesPlayed);

  const finalScore = baseScore + experienceAdjustment;
  return Math.round(finalScore * 100) / 100;
}
