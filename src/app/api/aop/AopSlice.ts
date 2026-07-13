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
  /** Empty array = all segments */
  client_segments: string[];
  start_date: string;
  end_date: string;
}

export interface AopSummary {
  total_associates_on_payroll: number;
  first_payroll_associates: number;
  billable_associates: number;
  non_billable_associates: number;
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
  | 'billable_associates'
  | 'non_billable_associates';

export interface AopTrendMetricOption {
  key: AopTrendMetric;
  label: string;
  enabled: boolean;
}

export interface AopTrendEmployerSeries {
  employer_id: string;
  label: string;
  values: number[];
}

export interface AopAssociatesTrend {
  categories: string[];
  metric_options: AopTrendMetricOption[];
  series: Record<AopTrendMetric, number[]>;
  employer_series: Record<AopTrendMetric, AopTrendEmployerSeries[]>;
}

export interface AopAssociatesByBranch {
  branch: string;
  total_associates: number;
}

export interface AopDashboardData {
  summary: AopSummary;
  employment_type: AopEmploymentType;
  payroll_composition: AopPayrollComposition;
  associates_by_branch: AopAssociatesByBranch[];
  associates_trend: AopAssociatesTrend;
}

interface ApiIdName {
  id: string | number;
  name: string;
}

interface ApiEmployerBreakdown {
  employer_id: string | number;
  label: string;
  value: number;
}

interface ApiTrendPoint {
  period: string;
  period_label: string;
  value: number;
  employer_breakdown?: ApiEmployerBreakdown[];
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
      billable_associates?: number;
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
    associates_by_branch?: Array<{
      branch?: string;
      total_associates?: number;
    }>;
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
  { key: 'billable_associates', label: 'Billable Associates', enabled: true },
  { key: 'non_billable_associates', label: 'Non-Billable Associates', enabled: true },
];

export const EMPTY_AOP_DASHBOARD: AopDashboardData = {
  summary: {
    total_associates_on_payroll: 0,
    first_payroll_associates: 0,
    billable_associates: 0,
    non_billable_associates: 0,
  },
  employment_type: { pkwt: 0, pkwtt: 0, mitra: 0, dw: 0, unmapped: 0 },
  payroll_composition: {
    regular_payroll: 0,
    regular_payroll_with_compensation: 0,
    compensation_only: 0,
    unmapped: 0,
  },
  associates_by_branch: [],
  associates_trend: {
    categories: [],
    metric_options: DEFAULT_TREND_METRIC_OPTIONS,
    series: {
      total_associates_on_payroll: [],
      first_payroll_associates: [],
      billable_associates: [],
      non_billable_associates: [],
    },
    employer_series: {
      total_associates_on_payroll: [],
      first_payroll_associates: [],
      billable_associates: [],
      non_billable_associates: [],
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
  const segmentIds = (filters.client_segments ?? []).filter((id) => id && id !== '0');
  if (segmentIds.length > 0) {
    params.set('client_segment_id', segmentIds.join(','));
  }

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

function mapTrendSeries(points?: ApiTrendPoint[]): {
  categories: string[];
  values: number[];
  employers: AopTrendEmployerSeries[];
} {
  const list = points ?? [];
  const categories = list.map((p) => p.period_label || p.period);
  const values = list.map((p) => num(p.value));
  const employerMap = new Map<string, { label: string; values: number[] }>();

  list.forEach((point, pointIndex) => {
    for (const entry of point.employer_breakdown ?? []) {
      const employerId = String(entry.employer_id);
      if (!employerMap.has(employerId)) {
        employerMap.set(employerId, {
          label: String(entry.label).trim(),
          values: new Array(list.length).fill(0),
        });
      }
      employerMap.get(employerId)!.values[pointIndex] = num(entry.value);
    }
  });

  const employers = Array.from(employerMap.entries())
    .map(([employer_id, { label, values: employerValues }]) => ({
      employer_id,
      label,
      values: employerValues,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { categories, values, employers };
}

function subtractSeries(total: number[], billable: number[]): number[] {
  const length = Math.max(total.length, billable.length);
  return Array.from({ length }, (_, index) => num(total[index]) - num(billable[index]));
}

function subtractEmployerSeries(
  total: AopTrendEmployerSeries[],
  billable: AopTrendEmployerSeries[],
): AopTrendEmployerSeries[] {
  const totalById = new Map(total.map((series) => [series.employer_id, series]));
  const billableById = new Map(billable.map((series) => [series.employer_id, series]));
  const employerIds = new Set([
    ...Array.from(totalById.keys()),
    ...Array.from(billableById.keys()),
  ]);

  return Array.from(employerIds)
    .map((employer_id) => {
      const totalSeries = totalById.get(employer_id);
      const billableSeries = billableById.get(employer_id);
      const label = totalSeries?.label ?? billableSeries?.label ?? employer_id;
      const length = Math.max(totalSeries?.values.length ?? 0, billableSeries?.values.length ?? 0);
      const values = Array.from({ length }, (_, index) =>
        num(totalSeries?.values[index]) - num(billableSeries?.values[index]),
      );

      return { employer_id, label, values };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

const KNOWN_TREND_METRICS = new Set<AopTrendMetric>([
  'total_associates_on_payroll',
  'first_payroll_associates',
  'billable_associates',
  'non_billable_associates',
]);

function ensureNonBillableMetricOption(options: AopTrendMetricOption[]): AopTrendMetricOption[] {
  if (options.some((option) => option.key === 'non_billable_associates')) {
    return options;
  }

  const billableIndex = options.findIndex((option) => option.key === 'billable_associates');
  const nonBillableOption: AopTrendMetricOption = {
    key: 'non_billable_associates',
    label: 'Non-Billable Associates',
    enabled: true,
  };

  if (billableIndex >= 0) {
    const next = [...options];
    next.splice(billableIndex + 1, 0, nonBillableOption);
    return next;
  }

  return [...options, nonBillableOption];
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

  const totalAssociates = num(summary.total_associates_on_payroll);
  const billableAssociates = num(summary.billable_associates);
  const nonBillableValues = subtractSeries(totalSeries.values, billableSeries.values);
  const nonBillableEmployers = subtractEmployerSeries(totalSeries.employers, billableSeries.employers);

  const categories =
    totalSeries.categories.length > 0
      ? totalSeries.categories
      : firstSeries.categories.length > 0
        ? firstSeries.categories
        : billableSeries.categories;

  const metricOptions = ensureNonBillableMetricOption(
    (trend.metric_options ?? DEFAULT_TREND_METRIC_OPTIONS)
      .map((option) => ({
        key: option.key as AopTrendMetric,
        label: option.label,
        enabled: Boolean(option.enabled),
      }))
      .filter((option) => KNOWN_TREND_METRICS.has(option.key)),
  );

  return {
    summary: {
      total_associates_on_payroll: totalAssociates,
      first_payroll_associates: num(summary.first_payroll_associates),
      billable_associates: billableAssociates,
      non_billable_associates: totalAssociates - billableAssociates,
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
    associates_by_branch: (data.associates_by_branch ?? [])
      .map((row) => ({
        branch: String(row.branch ?? '').trim(),
        total_associates: num(row.total_associates),
      }))
      .filter((row) => row.branch)
      .sort((a, b) => b.total_associates - a.total_associates),
    associates_trend: {
      categories,
      metric_options: metricOptions,
      series: {
        total_associates_on_payroll: totalSeries.values,
        first_payroll_associates: firstSeries.values,
        billable_associates: billableSeries.values,
        non_billable_associates: nonBillableValues,
      },
      employer_series: {
        total_associates_on_payroll: totalSeries.employers,
        first_payroll_associates: firstSeries.employers,
        billable_associates: billableSeries.employers,
        non_billable_associates: nonBillableEmployers,
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
