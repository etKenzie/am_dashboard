export interface AopFilterOption {
  id: string;
  name: string;
}

export interface AopFilterOptions {
  employers: AopFilterOption[];
  sourced_to: AopFilterOption[];
  projects: AopFilterOption[];
  branches: AopFilterOption[];
  segments: AopFilterOption[];
}

export interface AopFilters {
  employer: string;
  sourced_to: string;
  project: string;
  branch: string;
  client_segment: string;
  start_date: string;
  end_date: string;
}

export interface AopSummary {
  total_associates_on_payroll: number;
  first_payroll_associates: number;
  billable_associates: number;
}

export interface AopEmploymentType {
  pkwt: number;
  pkwtt: number;
  mitra: number;
  dw: number;
}

export interface AopPayrollComposition {
  regular_payroll: number;
  regular_plus_compensation: number;
  compensation_only: number;
}

export type AopTrendMetric = 'total_on_payroll' | 'first_payroll' | 'billable';

export interface AopAssociatesTrend {
  categories: string[];
  total_on_payroll: number[];
  first_payroll: number[];
  billable: number[];
}

export interface AopDashboardData {
  summary: AopSummary;
  employment_type: AopEmploymentType;
  payroll_composition: AopPayrollComposition;
  associates_trend: AopAssociatesTrend;
}

export const PLACEHOLDER_FILTER_OPTIONS: AopFilterOptions = {
  employers: [
    { id: '1', name: 'PT Maju Bersama' },
    { id: '2', name: 'PT Sinar Abadi' },
    { id: '3', name: 'PT Nusantara Jaya' },
  ],
  sourced_to: [
    { id: '1', name: 'Jakarta HQ' },
    { id: '2', name: 'Surabaya' },
    { id: '3', name: 'Bandung' },
  ],
  projects: [
    { id: '1', name: 'Retail Expansion' },
    { id: '2', name: 'Logistics Hub' },
    { id: '3', name: 'Manufacturing Line A' },
  ],
  branches: [
    { id: '1', name: 'Jakarta Pusat' },
    { id: '2', name: 'Tangerang' },
    { id: '3', name: 'Bekasi' },
  ],
  segments: [
    { id: '1', name: 'Enterprise' },
    { id: '2', name: 'SME' },
    { id: '3', name: 'Government' },
  ],
};

export const EMPTY_AOP_DASHBOARD: AopDashboardData = {
  summary: {
    total_associates_on_payroll: 0,
    first_payroll_associates: 0,
    billable_associates: 0,
  },
  employment_type: { pkwt: 0, pkwtt: 0, mitra: 0, dw: 0 },
  payroll_composition: {
    regular_payroll: 0,
    regular_plus_compensation: 0,
    compensation_only: 0,
  },
  associates_trend: {
    categories: [],
    total_on_payroll: [],
    first_payroll: [],
    billable: [],
  },
};

const TREND_MONTHS = [
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
  'Apr 2025',
  'May 2025',
  'Jun 2025',
  'Jul 2025',
  'Aug 2025',
  'Sep 2025',
  'Oct 2025',
  'Nov 2025',
  'Dec 2025',
];

export function getPlaceholderAopDashboard(_filters: AopFilters): AopDashboardData {
  return {
    summary: {
      total_associates_on_payroll: 4820,
      first_payroll_associates: 312,
      billable_associates: 4510,
    },
    employment_type: {
      pkwt: 2140,
      pkwtt: 1680,
      mitra: 620,
      dw: 380,
    },
    payroll_composition: {
      regular_payroll: 2890,
      regular_plus_compensation: 1420,
      compensation_only: 510,
    },
    associates_trend: {
      categories: TREND_MONTHS,
      total_on_payroll: [4120, 4180, 4250, 4310, 4380, 4450, 4520, 4580, 4650, 4720, 4780, 4820],
      first_payroll: [180, 210, 195, 240, 265, 230, 275, 290, 260, 300, 285, 312],
      billable: [3860, 3920, 3990, 4050, 4120, 4190, 4260, 4320, 4390, 4460, 4520, 4510],
    },
  };
}

export async function fetchAopDashboard(
  filters: AopFilters,
): Promise<{ dashboard: AopDashboardData; filterOptions: AopFilterOptions }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    dashboard: getPlaceholderAopDashboard(filters),
    filterOptions: PLACEHOLDER_FILTER_OPTIONS,
  };
}
