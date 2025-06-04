import { useQuery } from '@tanstack/react-query';
import httpService from '../common/httpservice';
import { AttendantRequestModel, MatchSummaryModel, PlayerModel, RegistrationDetailModel, RegistrationModel, ValueLabel } from '../types';
import { useApi } from './useApi';

export const usePlayersQuery = () => useQuery({
    initialData: [],
    queryKey: ['getPlayers'],
    queryFn: () => httpService.get<PlayerModel[]>('api/v1/players'),
});

export const useMatchesQuery = () => useQuery({
    queryKey: ["getMatches"],
    queryFn: () => httpService.get<MatchSummaryModel[]>("api/v1/matches"),
});

export const useArchivedMatchesQuery = (enabled = false) => useQuery({
    queryKey: ['getArchivedMatches'],
    queryFn: () => httpService.get<MatchSummaryModel[]>("api/v1/matches/archived"),
    enabled
});

export const useFutureMatchesQuery = (enabled = false) => useQuery({
    queryKey: ['getFutureMatchesQuery'],
    queryFn: () => httpService.get<MatchSummaryModel[]>("api/v1/matches/future"),
    enabled
});

export const useTodayMatchesQuery = (enabled = false) => useQuery({
    queryKey: ['getTodayMatchesQuery'],
    queryFn: () => httpService.get<MatchSummaryModel[]>("api/v1/matches/today"),
    enabled
});

// TODO: refactor
// This query used for player login to show up comming matches they can register
export const useUpcomingMatches = () => useQuery({
    queryKey: ["getMatches"],
    queryFn: () => httpService.get<MatchSummaryModel[]>("api/v1/upcoming-matches"),
});

export const useMatchCostQuery = (id: number) => useQuery({
    queryKey: ["getMatchCost"],
    queryFn: () => httpService.get<number>(`api/v1/matches/${id}/cost`),
});

export const useMatchAdditionalCostQuery = (id: number) => useQuery({
    queryKey: ["getMatchAdditionalCost"],
    queryFn: () => httpService.get<number>(`api/v1/matches/${id}/additional-costs`),
});

export const useRegistrationsQuery = () => useQuery({
    queryKey: ['getRegistrations'],
    queryFn: () => httpService.get<RegistrationModel[]>("api/v1/registrations")
});

export const useRegistrationsByMatchQuery = (matchId: number) => useQuery({
    queryKey: ['getRegistrationsByMatch', matchId],
    queryFn: () => httpService.get<RegistrationDetailModel[]>(`api/v1/matches/${matchId}/registrations`)
});

export const useSportCenterValueLabelQuery = () => useQuery({
    queryKey: ['getSportCenterSelectOptions'],
    queryFn: () => httpService.get<ValueLabel[]>('api/v1/sportcenters/options')
});

export const useMesssageTemplateQuery = () => useQuery({
    queryKey: ["getMessageTemplate"],
    queryFn: () => httpService.get<string>("api/v1/settings/message-template"),
});

export const useAttendantRequestsQuery = (externalUserId: string) => useQuery({
    queryKey: ['getAttendantRequests', externalUserId],
    queryFn: () => {
        const api = useApi();
        return api.get<AttendantRequestModel[]>(`api/v1/players/external-users/${externalUserId}/attendant-requests`);
    }
});