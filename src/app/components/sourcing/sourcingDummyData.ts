export interface SourcingExecutiveKpis {
  sourcing_target: number;
  cv_received: number;
  sourcing_gap: number;
  avg_ai_score: number;
  cv_stock_coverage: number;
  client_target: number;
  hired: number;
  swing: number;
  on_board: number;
  on_pipe_funnel: number;
  hiring_gap: number;
  /** 0–100 */
  fulfillment_rate: number;
  /** 0–100 */
  cv_to_hire_conversion: number;
}

export interface RecruitmentExecutiveKpis {
  client_target: number | null;
  hired: number;
  swing: number;
  on_board: number;
  on_pipe_funnel: number;
  hiring_gap: number | null;
  /** 0–100, null when there is no client target */
  fulfillment_rate: number | null;
}

export interface SourcingTrendPoint {
  period: string;
  period_label: string;
  sourcing_target: number;
  cv_received: number;
  sourcing_gap: number;
}

export interface NewCandidateGrowthPoint {
  period: string;
  period_label: string;
  processed: number;
  not_processed: number;
}

export interface NewCandidateGrowthData {
  total: number;
  processed: number;
  not_processed: number;
  trend: NewCandidateGrowthPoint[];
}

export interface FunnelBreakdownItem {
  label: string;
  count: number;
  percent: number;
}

export interface CurrentRecruitmentFunnelStage {
  id: string;
  title: string;
  count: number;
  breakdown: FunnelBreakdownItem[];
  extraBreakdown?: FunnelBreakdownItem[];
}

export interface RecruitmentProductivityMetric {
  id: string;
  title: string;
  value: number;
  format: 'count' | 'percent';
}

export interface SourcingFilterOption {
  id: string;
  name: string;
}

export interface SourcingFilterOptions {
  employers: SourcingFilterOption[];
  sourced_to: SourcingFilterOption[];
  projects: SourcingFilterOption[];
  branches: SourcingFilterOption[];
  segments: SourcingFilterOption[];
  recruitment_types: SourcingFilterOption[];
  sourcing_pics: SourcingFilterOption[];
  priorities: SourcingFilterOption[];
  roles: SourcingFilterOption[];
}

export const EMPTY_SOURCING_FILTER_OPTIONS: SourcingFilterOptions = {
  employers: [],
  sourced_to: [],
  projects: [],
  branches: [],
  segments: [],
  recruitment_types: [
    { id: 'New Hire', name: 'New Hire' },
    { id: 'Replacement', name: 'Replacement' },
  ],
  sourcing_pics: [],
  priorities: [],
  roles: [],
};

/** Fallback when API omits recruitment_types (matches profile chart labels). */
export const DEFAULT_RECRUITMENT_TYPE_OPTIONS: SourcingFilterOption[] =
  EMPTY_SOURCING_FILTER_OPTIONS.recruitment_types;

export interface SourcingNamedCount {
  label: string;
  value: number;
}

/** One row of "Candidate Source by Channel" (received CVs per application channel). */
export interface SourcingChannelCount extends SourcingNamedCount {
  /** tbl_information_source_recruitment.id; '0' = Career Page, null = unresolved ("Unknown source"). */
  source_id: string | null;
  /** Share of the section total, 0-100 (one decimal). */
  percent: number;
}

export interface CandidateHiringProfileData {
  age_distribution: SourcingNamedCount[];
  gender_distribution: SourcingNamedCount[];
  salary_range: SourcingNamedCount[];
  minimum_education: SourcingNamedCount[];
  working_type: SourcingNamedCount[];
  recruitment_type: SourcingNamedCount[];
  candidate_source_by_channel: SourcingChannelCount[];
}

