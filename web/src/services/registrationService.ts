import httpService from '@/common/httpservice';
import { RegistrationDetailModel } from '@/types';

async function getRegistrationByMatch(matchId: number) {
    return await httpService.get<RegistrationDetailModel[]>(`api/v1/matches/${matchId}/registrations`);
}

export default {
    getRegistrationByMatch
};