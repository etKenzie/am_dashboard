import type { AopUiFilterState } from '../aop/aopChartHelpers';

export interface SourcingExecutiveKpis {
  sourcing_target: number;
  cv_received: number;
  sourcing_gap: number;
  avg_ai_score: number;
  cv_stock_coverage: number;
  client_target: number;
  hired: number;
  on_board: number;
  hiring_gap: number;
  /** 0–100 */
  cv_to_hire_conversion: number;
}

export interface SourcingTrendPoint {
  period: string;
  period_label: string;
  sourcing_target: number;
  cv_received: number;
  sourcing_gap: number;
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
}

export const EMPTY_SOURCING_FILTER_OPTIONS: SourcingFilterOptions = {
  employers: [],
  sourced_to: [],
  projects: [],
  branches: [],
  segments: [],
};

/** Dummy filter options until the Sourcing API is wired. */
export const DUMMY_SOURCING_FILTER_OPTIONS: SourcingFilterOptions = {
  employers: [
    { id: '1', name: 'VI' },
    { id: '2', name: 'VSDM' },
  ],
  sourced_to: [
    { id: '60', name: 'PT Wahana Ottomitra Multiartha' },
    { id: '82', name: 'PT Bank UOB Indonesia' },
    { id: '224', name: 'PT Bank Negara Indonesia' },
  ],
  projects: [
    { id: '108', name: 'WOM Finance' },
    { id: '142', name: 'Bank UOB Sales' },
    { id: '373', name: 'BNI Sales Generalis' },
  ],
  branches: [
    { id: 'Jakarta', name: 'Jakarta' },
    { id: 'Surabaya', name: 'Surabaya' },
    { id: 'Bandung', name: 'Bandung' },
  ],
  segments: [
    { id: '3,8,9', name: 'All BFSI' },
    { id: '3', name: 'BFSI Bank' },
    { id: '8', name: 'BFSI Multi Finance' },
    { id: '1,2,5,6', name: 'All Non-BFSI' },
    { id: '1', name: 'Non BFSI Logistic' },
    { id: '6', name: 'Non BFSI E-commerce' },
  ],
};

export const DUMMY_SOURCING_KPIS: SourcingExecutiveKpis = {
  sourcing_target: 4200,
  cv_received: 3850,
  sourcing_gap: 350,
  avg_ai_score: 78.4,
  cv_stock_coverage: 1.6,
  client_target: 980,
  hired: 745,
  on_board: 612,
  hiring_gap: -235,
  cv_to_hire_conversion: 19.4,
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Dummy month-to-month series for Target vs CV Received vs Sourcing Gap. */
export function getDummySourcingTrend(year: string): SourcingTrendPoint[] {
  const y = year || String(new Date().getFullYear());
  const targets = [3100, 3200, 3350, 3500, 3600, 3800, 4000, 4200, 4300, 4400, 4500, 4600];
  const received = [2950, 3080, 3420, 3310, 3550, 3720, 3910, 3850, 0, 0, 0, 0];

  return MONTH_LABELS.map((label, index) => {
    const sourcing_target = targets[index];
    const cv_received = received[index];
    return {
      period: `${y}-${String(index + 1).padStart(2, '0')}`,
      period_label: `${label} ${y}`,
      sourcing_target,
      cv_received,
      sourcing_gap: Math.abs(sourcing_target - cv_received),
    };
  });
}

export function buildDummySourcingKpis(filters: AopUiFilterState): SourcingExecutiveKpis {
  // Soft variation from filters so Apply Filters feels responsive before real API.
  const seed =
    Number(filters.employer || 0)
    + Number(filters.project || 0)
    + (filters.clientSegments?.length ?? 0) * 7
    + Number(filters.month || 1);

  const delta = (seed % 11) * 12;
  const sourcing_target = DUMMY_SOURCING_KPIS.sourcing_target + delta;
  const cv_received = DUMMY_SOURCING_KPIS.cv_received + Math.round(delta * 0.7);
  return {
    ...DUMMY_SOURCING_KPIS,
    sourcing_target,
    cv_received,
    sourcing_gap: Math.abs(sourcing_target - cv_received),
    hired: DUMMY_SOURCING_KPIS.hired + Math.round(delta * 0.15),
    on_board: DUMMY_SOURCING_KPIS.on_board + Math.round(delta * 0.1),
  };
}

export interface SourcingNamedCount {
  label: string;
  value: number;
}

export const DUMMY_AI_SCORE_DISTRIBUTION: SourcingNamedCount[] = [
  { label: '0-40', value: 420 },
  { label: '41-60', value: 980 },
  { label: '61-80', value: 1650 },
  { label: '81-100', value: 800 },
];

export const DUMMY_CV_BY_SKILL: SourcingNamedCount[] = [
  { label: 'Sales', value: 920 },
  { label: 'Customer Service', value: 780 },
  { label: 'Logistics', value: 640 },
  { label: 'Admin', value: 510 },
  { label: 'Finance', value: 390 },
  { label: 'IT Support', value: 310 },
  { label: 'Operations', value: 300 },
];

export function getDummyAiScoreDistribution(filters: AopUiFilterState): SourcingNamedCount[] {
  const bump = (Number(filters.month || 1) % 5) * 8;
  return DUMMY_AI_SCORE_DISTRIBUTION.map((row, index) => ({
    ...row,
    value: row.value + bump * (index + 1),
  }));
}

export function getDummyCvBySkill(filters: AopUiFilterState): SourcingNamedCount[] {
  const bump = (Number(filters.project || 0) % 7) * 6;
  return DUMMY_CV_BY_SKILL.map((row, index) => ({
    ...row,
    value: Math.max(0, row.value + bump - index * 4),
  }));
}

export interface CandidateHiringProfileData {
  age_distribution: SourcingNamedCount[];
  gender_distribution: SourcingNamedCount[];
  salary_range: SourcingNamedCount[];
  minimum_education: SourcingNamedCount[];
  working_type: SourcingNamedCount[];
  recruitment_type: SourcingNamedCount[];
}

export const DUMMY_CANDIDATE_HIRING_PROFILE: CandidateHiringProfileData = {
  age_distribution: [
    { label: '< 21', value: 180 },
    { label: '21-25', value: 920 },
    { label: '26-30', value: 1180 },
    { label: '31-35', value: 740 },
    { label: '36-40', value: 420 },
    { label: '> 40', value: 210 },
  ],
  gender_distribution: [
    { label: 'Male', value: 2100 },
    { label: 'Female', value: 1480 },
    { label: 'Other / Undisclosed', value: 70 },
  ],
  salary_range: [
    { label: '< 4jt', value: 510 },
    { label: '4-6jt', value: 980 },
    { label: '6-8jt', value: 1120 },
    { label: '8-12jt', value: 640 },
    { label: '> 12jt', value: 280 },
  ],
  minimum_education: [
    { label: 'SMA / SMK', value: 980 },
    { label: 'D3', value: 720 },
    { label: 'S1', value: 1450 },
    { label: 'S2+', value: 180 },
  ],
  working_type: [
    { label: 'Onsite', value: 2180 },
    { label: 'Hybrid', value: 980 },
    { label: 'Remote', value: 490 },
  ],
  recruitment_type: [
    { label: 'New Hire', value: 2410 },
    { label: 'Replacement', value: 1240 },
  ],
};

function bumpNamedCounts(rows: SourcingNamedCount[], bump: number): SourcingNamedCount[] {
  return rows.map((row, index) => ({
    ...row,
    value: Math.max(0, row.value + bump - index * 3),
  }));
}

export function getDummyCandidateHiringProfile(filters: AopUiFilterState): CandidateHiringProfileData {
  const bump = (Number(filters.month || 1) % 6) * 5 + (filters.clientSegments?.length ?? 0) * 4;
  return {
    age_distribution: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.age_distribution, bump),
    gender_distribution: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.gender_distribution, bump),
    salary_range: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.salary_range, bump),
    minimum_education: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.minimum_education, bump),
    working_type: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.working_type, bump),
    recruitment_type: bumpNamedCounts(DUMMY_CANDIDATE_HIRING_PROFILE.recruitment_type, bump),
  };
}
