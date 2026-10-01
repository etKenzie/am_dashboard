/**
 * Sourcing analytics — AM Main API
 * GET {NEXT_PUBLIC_AM_MAIN_API_URL}/analisis/api/sourcing-analytics
 */

import { AM_MAIN_API_TOKEN, AM_MAIN_API_URL } from '@/utils/config';
import type {
  CandidateHiringProfileData,
  SourcingChannelCount,
  SourcingExecutiveKpis,
  SourcingFilterOptions,
  SourcingNamedCount,
  SourcingTrendPoint,
} from '@/app/components/sourcing/sourcingDummyData';
import { DEFAULT_RECRUITMENT_TYPE_OPTIONS } from '@/app/components/sourcing/sourcingDummyData';

export interface SourcingFilters {
  employer: string;
  sourced_to: string;
  project: string;
  branch: string;
  /** Empty array = all segments */
  client_segments: string[];
  product_type?: string;
  recruitment_type?: string;
  sourcing_pic?: string;
  year?: number;
  month?: number;
  start_date?: string;
  end_date?: string;
}

export interface SourcingDashboardData {
  kpis: SourcingExecutiveKpis;
  trend: SourcingTrendPoint[];
  aiScoreDistribution: SourcingNamedCount[];
  cvBySkill: SourcingNamedCount[];
  candidateHiringProfile: CandidateHiringProfileData;
  avgAiScore: number;
}

export interface SourcingDashboardResult {
  dashboard: SourcingDashboardData;
  filterOptions: SourcingFilterOptions;
}

interface ApiIdName {
  id: string;
  name: string;
}

interface ApiBucketCount {
  bucket?: string;
  label?: string;
  skill?: string;
  count?: number;
  pct?: number;
}

/** One channel row; label/count are the contract keys, source_name/cv_count are accepted aliases. */
interface ApiChannelRow {
  source_id?: number | string | null;
  label?: string;
  source_name?: string;
  count?: number | string;
  cv_count?: number | string;
}

/** Contract: { total, items: [...] }. A bare array of rows is accepted too. */
type ApiChannelSection = { total?: number; items?: ApiChannelRow[] } | ApiChannelRow[];

interface ApiSourcingAnalyticsResponse {
  success: boolean;
  message?: string;
  summary?: {
    sourcing_target?: number;
    cv_received?: number;
    sourcing_gap?: number;
    avg_ai_score?: number;
    cv_stock_coverage?: number | null;
    client_target?: number;
    hired?: number;
    hired_by_ta?: number;
    onboard?: number;
    on_board?: number;
    swing?: number;
    hiring_gap?: number;
    hiring_gap_v2?: number;
    cv_to_hire_conversion?: number;
    cv_to_hire_rate?: number;
    active_cv_stock_coverage?: number | null;
  };
  sourcing_performance?: {
    categories?: string[];
    series?: Array<{ name?: string; data?: number[] }>;
  };
  sourcing_quality?: {
    avg_ai_score?: number;
    score_distribution?: ApiBucketCount[];
    cv_by_skill?: ApiBucketCount[];
    cv_by_role_grouping?: ApiBucketCount[];
  };
  candidate_hiring_profile?: {
    age_distribution?: ApiBucketCount[];
    gender?: {
      male_count?: number;
      female_count?: number;
      male_pct?: number;
      female_pct?: number;
    };
    education_level?: ApiBucketCount[];
    salary_range?: ApiBucketCount[];
    min_education?: ApiBucketCount[];
    working_type?: ApiBucketCount[];
    recruitment_type?: ApiBucketCount[];
    /** Accepted as an alias of the top-level candidate_source_by_channel. */
    candidate_source_by_channel?: ApiChannelSection;
  };
  candidate_source_by_channel?: ApiChannelSection;
  filter_options?: {
    employers?: ApiIdName[];
    sourced_to?: ApiIdName[];
    projects?: ApiIdName[];
    branches?: ApiIdName[];
    segments?: ApiIdName[];
    recruitment_types?: ApiIdName[];
    recruitment_type?: ApiIdName[];
    sourcing_pics?: ApiIdName[];
    sourcing_pic?: ApiIdName[];
    pics?: ApiIdName[];
  };
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMonthCategory(cat: string): string {
  const m = cat.match(/^(\d{4})-(\d{2})$/);
  if (!m) return cat;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function titleCaseSkill(skill: string): string {
  return skill
    .split(/\s+/)
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

/**
 * API salary buckets use "M" for juta (million IDR), e.g. "3-4M".
 * Display as "J" (juta). Reserve "M" for miliar/billion when the label says so explicitly.
 */
function formatSalaryRangeLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  if (/miliar|billion/i.test(trimmed)) return trimmed;
  return trimmed.replace(/(\d)\s*M\b/gi, '$1J');
}

function mapNamedCounts(
  rows: ApiBucketCount[] | undefined,
  labelKey: 'bucket' | 'label' | 'skill' = 'label',
  formatLabel?: (label: string) => string,
): SourcingNamedCount[] {
  return (rows ?? [])
    .map((row) => {
      const rawLabel =
        labelKey === 'skill'
          ? row.skill
          : labelKey === 'bucket'
            ? row.bucket
            : (row.label ?? row.bucket ?? row.skill);
      let label = String(rawLabel ?? '').trim();
      if (!label) return { label: '', value: 0 };
      if (labelKey === 'skill') label = titleCaseSkill(label);
      if (formatLabel) label = formatLabel(label);
      return {
        label,
        value: num(row.count),
      };
    })
    .filter((row) => row.label);
}

const UNKNOWN_CHANNEL_LABEL = 'Unknown source';

/**
 * Candidate Source by Channel. Keeps the API order (count DESC, "Unknown source" last).
 * Rows that share a label are merged (the list component keys its rows by label), and the
 * share is recomputed from the counts, so it always matches what the card draws.
 */
function mapSourceByChannel(section: ApiChannelSection | null | undefined): SourcingChannelCount[] {
  const rows = Array.isArray(section) ? section : Array.isArray(section?.items) ? section.items : [];
  const byLabel = new Map<string, SourcingChannelCount>();

  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const label = String(row.label ?? row.source_name ?? '').trim() || UNKNOWN_CHANNEL_LABEL;
    const value = num(row.count ?? row.cv_count);
    const existing = byLabel.get(label);
    if (existing) {
      existing.value += value;
      return;
    }
    const rawId = row.source_id;
    byLabel.set(label, {
      source_id: rawId === undefined || rawId === null || rawId === '' ? null : String(rawId),
      label,
      value,
      percent: 0,
    });
  });

  const list = Array.from(byLabel.values());
  const total = list.reduce((sum, row) => sum + row.value, 0);
  return list.map((row) => ({
    ...row,
    percent: total > 0 ? Math.round((row.value / total) * 1000) / 10 : 0,
  }));
}

function buildSourcingQueryParams(filters: SourcingFilters): URLSearchParams {
  const params = new URLSearchParams();
  const add = (key: string, val: string | number | undefined) => {
    if (val === undefined || val === null || val === '' || val === '0') return;
    params.set(key, String(val));
  };

  add('employer_id', filters.employer);
  add('sourced_to_id', filters.sourced_to);
  add('project_id', filters.project);
  add('branch', filters.branch);
  const segmentIds = (filters.client_segments ?? []).filter((id) => id && id !== '0');
  if (segmentIds.length > 0) {
    add('segment', segmentIds.join(','));
  }
  add('product_type', filters.product_type);
  add('recruitment_type', filters.recruitment_type);
  add('sourcing_pic_id', filters.sourcing_pic);

  if (filters.start_date && filters.end_date) {
    add('start_date', filters.start_date);
    add('end_date', filters.end_date);
  } else if (filters.year != null) {
    add('year', filters.year);
    if (filters.month != null) add('month', filters.month);
  }

  return params;
}

function mapFilterOptions(
  raw?: ApiSourcingAnalyticsResponse['filter_options'],
): SourcingFilterOptions {
  const mapList = (items?: ApiIdName[]) =>
    (items ?? []).map((x) => ({ id: String(x.id), name: String(x.name).trim() }));

  const recruitmentTypes = mapList(raw?.recruitment_types ?? raw?.recruitment_type);
  const sourcingPics = mapList(raw?.sourcing_pics ?? raw?.sourcing_pic ?? raw?.pics);

  return {
    employers: mapList(raw?.employers),
    sourced_to: mapList(raw?.sourced_to),
    projects: mapList(raw?.projects),
    branches: mapList(raw?.branches),
    segments: mapList(raw?.segments),
    recruitment_types:
      recruitmentTypes.length > 0 ? recruitmentTypes : DEFAULT_RECRUITMENT_TYPE_OPTIONS,
    sourcing_pics: sourcingPics,
  };
}

function findSeries(
  series: Array<{ name?: string; data?: number[] }> | undefined,
  names: string[],
): number[] {
  const match = (series ?? []).find((s) =>
    names.some((name) => String(s.name ?? '').toLowerCase() === name.toLowerCase()),
  );
  return (match?.data ?? []).map((v) => num(v));
}

function mapTrend(raw?: ApiSourcingAnalyticsResponse['sourcing_performance']): SourcingTrendPoint[] {
  const categories = raw?.categories ?? [];
  const targets = findSeries(raw?.series, ['Target', 'Sourcing Target']);
  const received = findSeries(raw?.series, ['CV Received', 'CV received']);
  const gaps = findSeries(raw?.series, ['Sourcing GAP', 'Sourcing Gap', 'SourcingGAP']);

  return categories.map((period, index) => {
    const sourcing_target = num(targets[index]);
    const cv_received = num(received[index]);
    const gapFromApi = gaps[index];
    return {
      period,
      period_label: formatMonthCategory(period),
      sourcing_target,
      cv_received,
      sourcing_gap:
        gapFromApi !== undefined && gapFromApi !== null
          ? num(gapFromApi)
          : Math.max(0, sourcing_target - cv_received),
    };
  });
}

function mapKpis(summary?: ApiSourcingAnalyticsResponse['summary']): SourcingExecutiveKpis {
  return {
    sourcing_target: num(summary?.sourcing_target),
    cv_received: num(summary?.cv_received),
    sourcing_gap: num(summary?.sourcing_gap),
    avg_ai_score: num(summary?.avg_ai_score),
    cv_stock_coverage: num(summary?.cv_stock_coverage ?? summary?.active_cv_stock_coverage),
    client_target: num(summary?.client_target),
    hired: num(summary?.hired_by_ta ?? summary?.hired),
    on_board: num(summary?.swing ?? summary?.onboard ?? summary?.on_board),
    hiring_gap: num(summary?.hiring_gap_v2 ?? summary?.hiring_gap),
    cv_to_hire_conversion: num(summary?.cv_to_hire_conversion ?? summary?.cv_to_hire_rate),
  };
}

function mapCandidateHiringProfile(
  raw?: ApiSourcingAnalyticsResponse['candidate_hiring_profile'],
  sourceByChannel?: ApiChannelSection,
): CandidateHiringProfileData {
  const gender = raw?.gender;
  const gender_distribution: SourcingNamedCount[] = [];
  if (gender) {
    gender_distribution.push({ label: 'Male', value: num(gender.male_count) });
    gender_distribution.push({ label: 'Female', value: num(gender.female_count) });
  }

  return {
    age_distribution: mapNamedCounts(raw?.age_distribution, 'bucket'),
    gender_distribution,
    salary_range: mapNamedCounts(raw?.salary_range, 'bucket', formatSalaryRangeLabel),
    minimum_education: mapNamedCounts(raw?.education_level ?? raw?.min_education, 'label'),
    working_type: mapNamedCounts(raw?.working_type, 'label'),
    recruitment_type: mapNamedCounts(raw?.recruitment_type, 'label'),
    candidate_source_by_channel: mapSourceByChannel(
      sourceByChannel ?? raw?.candidate_source_by_channel,
    ),
  };
}

function mapSourcingApiToDashboard(json: ApiSourcingAnalyticsResponse): SourcingDashboardData {
  const kpis = mapKpis(json.summary);
  const avgAiScore = num(json.sourcing_quality?.avg_ai_score ?? kpis.avg_ai_score);

  return {
    kpis: { ...kpis, avg_ai_score: avgAiScore },
    trend: mapTrend(json.sourcing_performance),
    aiScoreDistribution: mapNamedCounts(json.sourcing_quality?.score_distribution, 'bucket'),
    cvBySkill: mapNamedCounts(
      json.sourcing_quality?.cv_by_role_grouping ?? json.sourcing_quality?.cv_by_skill,
      'label',
    ),
    candidateHiringProfile: mapCandidateHiringProfile(
      json.candidate_hiring_profile,
      json.candidate_source_by_channel,
    ),
    avgAiScore,
  };
}

export const EMPTY_SOURCING_DASHBOARD: SourcingDashboardData = {
  kpis: {
    sourcing_target: 0,
    cv_received: 0,
    sourcing_gap: 0,
    avg_ai_score: 0,
    cv_stock_coverage: 0,
    client_target: 0,
    hired: 0,
    on_board: 0,
    hiring_gap: 0,
    cv_to_hire_conversion: 0,
  },
  trend: [],
  aiScoreDistribution: [],
  cvBySkill: [],
  candidateHiringProfile: {
    age_distribution: [],
    gender_distribution: [],
    salary_range: [],
    minimum_education: [],
    working_type: [],
    recruitment_type: [],
    candidate_source_by_channel: [],
  },
  avgAiScore: 0,
};

export async function fetchSourcingAnalytics(
  filters: SourcingFilters,
): Promise<SourcingDashboardResult> {
  if (!AM_MAIN_API_URL) {
    throw new Error('NEXT_PUBLIC_AM_MAIN_API_URL is not set');
  }

  const params = buildSourcingQueryParams(filters);
  const url = `${AM_MAIN_API_URL}/analisis/api/sourcing-analytics?${params.toString()}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (AM_MAIN_API_TOKEN) {
    headers['x-api-key'] = AM_MAIN_API_TOKEN;
  }

  console.log('[sourcing-analytics] request', {
    method: 'GET',
    url,
    filters,
    query: Object.fromEntries(params.entries()),
    hasApiKey: Boolean(AM_MAIN_API_TOKEN),
  });

  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });

  console.log('[sourcing-analytics] response_meta', {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get('content-type'),
  });

  if (!res.ok) {
    throw new Error(`sourcing-analytics: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ApiSourcingAnalyticsResponse;

  if (!json.success) {
    throw new Error(json.message || 'Sourcing analytics request failed');
  }

  return {
    dashboard: mapSourcingApiToDashboard(json),
    filterOptions: mapFilterOptions(json.filter_options),
  };
}
