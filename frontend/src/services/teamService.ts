import { Team, Player, Booking, Cost } from '../types/team';
import { useApi } from '../hooks/useApi';

export const teamService = {
    // Team CRUD operations
    async getTeams(): Promise<Team[]> {
        const api = useApi();
        return await api.get<Team[]>('/api/v1/teams');
    },

    async createTeam(data: { name: string; description: string; }): Promise<Team> {
        const api = useApi();
        return await api.post<Team>('/api/v1/teams', data as Team);
    },

    async getTeam(id: number): Promise<Team> {
        const api = useApi();
        return await api.get<Team>(`/api/v1/teams/${id}`);
    },

    async updateTeam(id: number, data: { name: string; description: string; }): Promise<void> {
        const api = useApi();
        await api.put(`/api/v1/teams/${id}`, data);
    },

    async deleteTeam(id: number): Promise<void> {
        const api = useApi();
        await api.del(`/api/v1/teams/${id}`);
    },

    // Team members operations
    async addPlayer(teamId: number, playerId: number, role: string): Promise<void> {
        const api = useApi();
        await api.post(`/api/v1/teams/${teamId}/members`, { playerId, role });
    },

    async removePlayer(teamId: number, playerId: number): Promise<void> {
        const api = useApi();
        await api.del(`/api/v1/teams/${teamId}/members/${playerId}`);
    },

    // Team bookings operations
    async createBooking(teamId: number, data: {
        courtId: number;
        startTime: string;
        endTime: string;
        description: string;
    }): Promise<Booking> {
        const api = useApi();
        return await api.post<Booking>(`/api/v1/teams/${teamId}/bookings`, data as Booking);
    },

    async getTeamBookings(teamId: number): Promise<Booking[]> {
        const api = useApi();
        return await api.get<Booking[]>(`/api/v1/teams/${teamId}/bookings`);
    },

    // Team costs operations
    async createCost(teamId: number, data: {
        amount: number;
        description: string;
        date: string;
        category: string;
    }): Promise<Cost> {
        const api = useApi();
        return await api.post<Cost>(`/api/v1/teams/${teamId}/costs`, data as Cost);
    },

    async getTeamCosts(teamId: number): Promise<Cost[]> {
        const api = useApi();
        return await api.get<Cost[]>(`/api/v1/teams/${teamId}/costs`);
    },
};