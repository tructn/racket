export interface PlayerSummaryModel {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt: Date;
  externalUserId?: string;
  wallets: WalletModel[];
}

export interface WalletModel {
  id: number;
  name: string;
  balance: number;
}

export interface UpdatePlayerModel {
  id?: number;
  firstName: string;
  lastName: string;
}
