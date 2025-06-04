import { Team, Player, Booking, Cost } from '@/types/team';
import httpService from '@/common/httpservice';

export const teamService = {
    async getTeams(): Promise<Team[]> {
        return await httpService.get<Team[]>('/api/v1/teams');
    },

    async createTeam(data: { name: string; description: string; }): Promise<Team> {
        return await httpService.post<Team>('/api/v1/teams', data as Team);
    },

    async getTeam(id: number): Promise<Team> {
        return await httpService.get<Team>(`/api/v1/teams/${id}`);
    },

    async updateTeam(id: number, data: { name: string; description: string; }): Promise<void> {
        await httpService.put(`/api/v1/teams/${id}`, data);
    },

    async deleteTeam(id: number): Promise<void> {
        await httpService.del(`/api/v1/teams/${id}`);
    },

    // Team members operations
    async addPlayer(teamId: number, playerId: number, role: string): Promise<void> {
        await httpService.post(`/api/v1/teams/${teamId}/members`, { playerId, role });
    },

    async removePlayer(teamId: number, playerId: number): Promise<void> {
        await httpService.del(`/api/v1/teams/${teamId}/members/${playerId}`);
    },
};