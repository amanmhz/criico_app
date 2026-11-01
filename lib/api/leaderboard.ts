import { apiClient } from '@/lib/api/client';
import type { LeaderboardResponse } from '@/types/leaderboard';

export const leaderboardApi = {
  get: (params?: { role?: string; teamId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.teamId) searchParams.set('teamId', params.teamId);
    const qs = searchParams.toString();
    return apiClient<LeaderboardResponse>(`/api/leaderboard${qs ? `?${qs}` : ''}`);
  },
};

