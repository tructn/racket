export interface MatchModel {
  matchId?: number;
  start: Date;
  end: Date;
  sportCenterName: string;
  sportCenterId: number;
  costPerSection: number;
  minutePerSection: number;
  cost: number;
  customSection: number | null;
  court: string;
}
