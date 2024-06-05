export type TrendType =
  | 'SingleDown'
  | 'FortyFiveDown'
  | 'Flat'
  | 'FortyFiveUp'
  | 'SingleUp'
  | 'NotComputable';

export type LibreCgmData = {
  value: number;
  is_high: boolean;
  is_low: boolean;
  trend: TrendType;
  date: Date;
};
