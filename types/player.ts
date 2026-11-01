export type PlayerRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  basePrice: number;
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PlayerWithTeamsCount extends Player {
  _count?: {
    teams: number;
    performances?: number;
  };
}

export interface PlayerDetail extends Player {
  teams: {
    id: string;
    teamId: string;
    playerId: string;
    joinedAt: string | Date;
    team: {
      id: string;
      name: string;
      shortName: string;
    };
  }[];
  performances?: {
    id: string;
    matchId: string;
    runs: number;
    wickets: number;
    teamId: string;
  }[];
}

