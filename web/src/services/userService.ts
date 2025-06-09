import httpService from '@/common/httpservice';

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

export const useUserService = () => {
    return {
        getCurrentUser: async (): Promise<UserProfile> => {
            return await httpService.get<UserProfile>('/api/v1/me/profile');
        },

        updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
            return await httpService.put<UserProfile>('/api/v1/me/profile', data as UserProfile);
        },
    };
};