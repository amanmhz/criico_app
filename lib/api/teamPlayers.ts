import { apiClient } from '@/lib/api/client';
import type { TeamPlayerItem } from '@/types/team';
import type { Player } from '@/types/player';

export interface TeamPlayersResponse {
  players: TeamPlayerItem[];
}

export interface AvailablePlayersResponse {
  players: Player[];
}

export interface AddTeamPlayerResponse {
  message: string;
  assignment: TeamPlayerItem;
}

export const teamPlayersApi = {
  list: (teamId: string) =>
    apiClient<TeamPlayersResponse>(`/api/teams/${teamId}/players`),

  available: (teamId: string) =>
    apiClient<AvailablePlayersResponse>(`/api/teams/${teamId}/players?available=true`),

  add: (teamId: string, playerId: string) =>
    apiClient<AddTeamPlayerResponse>(`/api/teams/${teamId}/players`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    }),

  remove: (teamId: string, playerId: string) =>
    apiClient<{ message: string }>(`/api/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    }),
};

