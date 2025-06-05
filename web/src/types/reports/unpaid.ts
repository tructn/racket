export interface UnpaidModel {
    playerId: number;
    playerName: string;
    email: string;
    matchCount: number;
    unpaidAmount: number;
    registrationSummary: string;
}

export interface UnpaidModelV2 {
    playerId: number;
    playerName: string;
    matchId: number;
    matchDate: Date;
    matchCost: number;
    matchAdditionalCost: number;
    matchPlayerCount: number;
}