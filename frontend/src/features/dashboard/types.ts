export interface DashboardSummary {
  total_defects: number;
  critical_defects: number;
  fixed_defects: number;
  in_progress_defects: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}
