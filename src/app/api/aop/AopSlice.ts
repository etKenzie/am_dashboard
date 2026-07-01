/**
 * Associates On Payroll — proxied via Next.js (avoids CORS)
 * GET /api/executive-dashboard/payroll-associates/summary
 * GET /api/executive-dashboard/payroll-associates/filter-options
 *
 * Server env (proxy): AM_MAIN_API_URL, AM_MAIN_API_URL_TOKEN_2
 * Or NEXT_PUBLIC_AM_MAIN_API_URL / NEXT_PUBLIC_AM_MAIN_API_URL_TOKEN_2
 */

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
}

export interface AopEmploymentType {
  pkwt: number;
  pkwtt: number;
  mitra: number;
  dw: number;
  unmapped: number;
}

export interface AopPayrollComposition {
  regular_payroll: number;
  regular_payroll_with_compensation: number;
  compensation_only: number;
  unmapped: number;
}

export type AopTrendMetric =
  | 'total_associates_on_payroll'
  | 'first_payroll_associates'
  | 'billable_associates';

export interface AopTrendMetricOption {
  key: AopTrendMetric;
  label: string;
  enabled: boolean;
}

export interface AopAssociatesTrend {
  categories: string[];
  metric_options: AopTrendMetricOption[];
  series: Record<AopTrendMetric, number[]>;
}

export interface AopDashboardData {
  summary: AopSummary;
  employment_type: AopEmploymentType;
  payroll_composition: AopPayrollComposition;
  associates_trend: AopAssociatesTrend;
}

interface ApiIdName {
  id: string | number;
  name: string;
}

interface ApiTrendPoint {
  period: string;
  period_label: string;
  value: number;
}

interface ApiTrendMetricOption {
  key: string;
  label: string;
  enabled: boolean;
}

interface ApiPayrollAssociatesSummaryResponse {
  success: boolean;
  message?: string;
  data?: {
    associates_summary?: {
      total_associates_on_payroll?: number;
      first_payroll_associates?: number;
    };
    associates_employment_type?: {
      pkwtt_associates?: number;
      pkwt_associates?: number;
      mitra_associates?: number;
      dw_associates?: number;
      unmapped_associates?: number;
    };
    payroll_composition?: {
      regular_payroll?: number;
      regular_payroll_with_compensation?: number;
      compensation_only?: number;
      unmapped_associates?: number;
    };
    trend?: {
      metric_options?: ApiTrendMetricOption[];
      series?: Partial<Record<AopTrendMetric, ApiTrendPoint[]>>;
    };
  };
}

interface ApiPayrollAssociatesFilterOptionsResponse {
  success: boolean;
  message?: string;
  data?: {
    employers?: ApiIdName[];
    sourced_to?: ApiIdName[];
    projects?: ApiIdName[];
    branches?: ApiIdName[];
    client_segments?: ApiIdName[];
  };
}

const DEFAULT_TREND_METRIC_OPTIONS: AopTrendMetricOption[] = [
  { key: 'total_associates_on_payroll', label: 'Total Associates on Payroll', enabled: true },
  { key: 'first_payroll_associates', label: 'First Payroll Associates', enabled: true },
  { key: 'billable_associates', label: 'Billable Associates', enabled: false },
];

export const EMPTY_AOP_DASHBOARD: AopDashboardData = {
  summary: {
    total_associates_on_payroll: 0,
    first_payroll_associates: 0,
  },
  employment_type: { pkwt: 0, pkwtt: 0, mitra: 0, dw: 0, unmapped: 0 },
  payroll_composition: {
    regular_payroll: 0,
    regular_payroll_with_compensation: 0,
    compensation_only: 0,
    unmapped: 0,
  },
  associates_trend: {
    categories: [],
    metric_options: DEFAULT_TREND_METRIC_OPTIONS,
    series: {
      total_associates_on_payroll: [],
      first_payroll_associates: [],
      billable_associates: [],
    },
  },
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toApiDate(date: string): string {
  return date.replace(/-/g, '/');
}

function buildSummaryQueryParams(filters: AopFilters): URLSearchParams {
  const params = new URLSearchParams();
  const add = (key: string, val: string | undefined) => {
    if (!val || val === '0') return;
    params.set(key, val);
  };

  if (filters.start_date) params.set('start_date', toApiDate(filters.start_date));
  if (filters.end_date) params.set('end_date', toApiDate(filters.end_date));

  add('employer_id', filters.employer);
  add('sourced_to_id', filters.sourced_to);
  add('project_id', filters.project);
  add('branch', filters.branch);
  add('client_segment_id', filters.client_segment);

  return params;
}

function buildFilterOptionsQueryParams(filters: Pick<AopFilters, 'start_date' | 'end_date' | 'employer'>): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.start_date) params.set('start_date', toApiDate(filters.start_date));
  if (filters.end_date) params.set('end_date', toApiDate(filters.end_date));
  if (filters.employer && filters.employer !== '0') {
    params.set('employer_id', filters.employer);
  }

  return params;
}

async function fetchAopApi<T>(pathSegment: string, params: URLSearchParams): Promise<T> {
  const query = params.toString();
  const url = `/api/executive-dashboard/${pathSegment}${query ? `?${query}` : ''}`;

  const res = await fetch(url, { method: 'GET', cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`payroll-associates: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as T & { success?: boolean; message?: string };

  if (!json.success) {
    throw new Error(json.message || 'Payroll associates request failed');
  }

  return json;
}

function mapFilterOptions(raw?: ApiPayrollAssociatesFilterOptionsResponse['data']): AopFilterOptions {
  const mapList = (items?: ApiIdName[]) =>
    (items ?? []).map((x) => ({ id: String(x.id), name: String(x.name).trim() }));

  return {
    employers: mapList(raw?.employers),
    sourced_to: mapList(raw?.sourced_to),
    projects: mapList(raw?.projects),
    branches: mapList(raw?.branches),
    segments: mapList(raw?.client_segments),
  };
}

function mapTrendSeries(points?: ApiTrendPoint[]): { categories: string[]; values: number[] } {
  const list = points ?? [];
  return {
    categories: list.map((p) => p.period_label || p.period),
    values: list.map((p) => num(p.value)),
  };
}

function mapSummaryResponse(json: ApiPayrollAssociatesSummaryResponse): AopDashboardData {
  const data = json.data ?? {};
  const summary = data.associates_summary ?? {};
  const employment = data.associates_employment_type ?? {};
  const composition = data.payroll_composition ?? {};
  const trend = data.trend ?? {};

  const totalSeries = mapTrendSeries(trend.series?.total_associates_on_payroll);
  const firstSeries = mapTrendSeries(trend.series?.first_payroll_associates);
  const billableSeries = mapTrendSeries(trend.series?.billable_associates);

  const categories =
    totalSeries.categories.length > 0
      ? totalSeries.categories
      : firstSeries.categories.length > 0
        ? firstSeries.categories
        : billableSeries.categories;

  const metricOptions: AopTrendMetricOption[] = (trend.metric_options ?? DEFAULT_TREND_METRIC_OPTIONS).map(
    (option) => ({
      key: option.key as AopTrendMetric,
      label: option.label,
      enabled: Boolean(option.enabled),
    }),
  );

  return {
    summary: {
      total_associates_on_payroll: num(summary.total_associates_on_payroll),
      first_payroll_associates: num(summary.first_payroll_associates),
    },
    employment_type: {
      pkwt: num(employment.pkwt_associates),
      pkwtt: num(employment.pkwtt_associates),
      mitra: num(employment.mitra_associates),
      dw: num(employment.dw_associates),
      unmapped: num(employment.unmapped_associates),
    },
    payroll_composition: {
      regular_payroll: num(composition.regular_payroll),
      regular_payroll_with_compensation: num(composition.regular_payroll_with_compensation),
      compensation_only: num(composition.compensation_only),
      unmapped: num(composition.unmapped_associates),
    },
    associates_trend: {
      categories,
      metric_options: metricOptions,
      series: {
        total_associates_on_payroll: totalSeries.values,
        first_payroll_associates: firstSeries.values,
        billable_associates: billableSeries.values,
      },
    },
  };
}

export async function fetchAopFilterOptions(
  filters: Pick<AopFilters, 'start_date' | 'end_date' | 'employer'>,
): Promise<AopFilterOptions> {
  const params = buildFilterOptionsQueryParams(filters);
  const json = await fetchAopApi<ApiPayrollAssociatesFilterOptionsResponse>(
    'payroll-associates/filter-options',
    params,
  );

  return mapFilterOptions(json.data);
}

export async function fetchAopDashboard(filters: AopFilters): Promise<AopDashboardData> {
  const params = buildSummaryQueryParams(filters);
  const json = await fetchAopApi<ApiPayrollAssociatesSummaryResponse>(
    'payroll-associates/summary',
    params,
  );

  return mapSummaryResponse(json);
}
