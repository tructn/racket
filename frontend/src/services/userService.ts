import { useApi } from "../hooks/useApi";

export interface UserProfile {
    id: number;
    idpUserId: string;
    email: string;
    name: string;
    picture: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    name: string;
    picture?: string;
}

export const userService = {
    getCurrentUser: async (): Promise<UserProfile> => {
        const api = useApi();
        return await api.get<UserProfile>('/api/v1/users/me');
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
        const api = useApi();
        return await api.put<UserProfile>('/api/v1/users/me', data as UserProfile);
    },
}; 