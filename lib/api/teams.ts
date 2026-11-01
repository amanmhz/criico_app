import { apiClient } from '@/lib/api/client';
import type { Team, TeamDetail, TeamWithCounts } from '@/types/team';
import type { CreateTeamInput, UpdateTeamInput } from '@/lib/validation/team';

export interface TeamsListResponse {
  teams: TeamWithCounts[];
}

export interface TeamDetailResponse {
  team: TeamDetail;
}

export interface TeamMutationResponse {
  message: string;
  team: Team;
}

export const teamsApi = {
  list: (params?: { name?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.set('name', params.name);
    const qs = searchParams.toString();
    return apiClient<TeamsListResponse>(`/api/teams${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => apiClient<TeamDetailResponse>(`/api/teams/${id}`),

  create: (data: CreateTeamInput) =>
    apiClient<TeamMutationResponse>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTeamInput) =>
    apiClient<TeamMutationResponse>(`/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/api/teams/${id}`, {
      method: 'DELETE',
    }),
};

