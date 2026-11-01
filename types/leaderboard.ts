import type { PlayerRole } from '@prisma/client';

export interface LeaderboardPlayer {
  rank: number;
  id: string;
  name: string;
  role: PlayerRole;
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
  impactScore: number;
  teams: {
    id: string;
    name: string;
    shortName: string;
  }[];
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardPlayer[];
}

