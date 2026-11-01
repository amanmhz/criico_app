import type { Player } from '@/types/player';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TeamWithCounts extends Team {
  _count: {
    players: number;
    teamAMatches?: number;
    teamBMatches?: number;
  };
}

export interface TeamPlayerItem {
  id: string;
  teamId: string;
  playerId: string;
  joinedAt: string | Date;
  player: Player;
}

export interface TeamDetail extends Team {
  players: TeamPlayerItem[];
  _count: {
    players: number;
    teamAMatches: number;
    teamBMatches: number;
  };
}

