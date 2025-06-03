export interface PlayerSummaryModel {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt: Date;
  externalUserId?: string;
}

export interface UpdatePlayerModel {
  id?: number;
  firstName: string;
  lastName: string;
}
