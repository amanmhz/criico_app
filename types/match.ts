import type { Team } from '@/types/team';
import type { Player } from '@/types/player';

export interface PerformanceInput {
  playerId: string;
  teamId: string;
  runs: number;
  wickets: number;
}

export interface PlayerPerformanceItem {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  runs: number;
  wickets: number;
  createdAt: string | Date;
  player: Player;
  team: Team;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  result: string | null;
  playedAt: string | Date;
  createdAt: string | Date;
}

export interface MatchWithTeams extends Match {
  teamA: Team;
  teamB: Team;
  _count?: {
    performances: number;
  };
}

export interface MatchDetail extends Match {
  teamA: Team;
  teamB: Team;
  performances: PlayerPerformanceItem[];
}

