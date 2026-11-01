import { apiClient } from '@/lib/api/client';
import type { Player, PlayerDetail, PlayerWithTeamsCount } from '@/types/player';
import type { CreatePlayerInput, UpdatePlayerInput } from '@/lib/validation/player';

export interface PlayersListResponse {
  players: PlayerWithTeamsCount[];
}

export interface PlayerDetailResponse {
  player: PlayerDetail;
}

export interface PlayerMutationResponse {
  message: string;
  player: Player;
}

export const playersApi = {
  list: (params?: { name?: string; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.set('name', params.name);
    if (params?.role) searchParams.set('role', params.role);
    const qs = searchParams.toString();
    return apiClient<PlayersListResponse>(`/api/players${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => apiClient<PlayerDetailResponse>(`/api/players/${id}`),

  create: (data: CreatePlayerInput) =>
    apiClient<PlayerMutationResponse>('/api/players', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePlayerInput) =>
    apiClient<PlayerMutationResponse>(`/api/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/api/players/${id}`, {
      method: 'DELETE',
    }),
};

