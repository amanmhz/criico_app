import { apiClient } from '@/lib/api/client';
import type { Match, MatchDetail, MatchWithTeams } from '@/types/match';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validation/match';

export interface MatchesListResponse {
  matches: MatchWithTeams[];
}

export interface MatchDetailResponse {
  match: MatchDetail;
}

export interface MatchMutationResponse {
  message: string;
  match: Match;
}

export const matchesApi = {
  list: (params?: { teamId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.teamId) searchParams.set('teamId', params.teamId);
    const qs = searchParams.toString();
    return apiClient<MatchesListResponse>(`/api/matches${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => apiClient<MatchDetailResponse>(`/api/matches/${id}`),

  create: (data: CreateMatchInput) =>
    apiClient<MatchMutationResponse>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateMatchInput) =>
    apiClient<MatchMutationResponse>(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/api/matches/${id}`, {
      method: 'DELETE',
    }),
};

