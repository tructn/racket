export interface OutstandingPaymentModel {
    playerId: number;
    playerName: string;
    email: string;
    matchCount: number;
    unpaidAmount: number;
    registrationSummary: string;
}