/**
 * Recruitment dashboard — AM Main API
 * GET {NEXT_PUBLIC_AM_MAIN_API_URL}/analisis/api/recruitment-dashboard
 */

import { AM_MAIN_API_TOKEN, AM_MAIN_API_URL } from '@/utils/config';

export interface RecruitmentFilters {
  employer: string;
  sourced_to: string;
  project: string;
  branch: string;
  /** Empty array = all segments */
  customer_segments: string[];
  product_type: string;
  year?: number;
  month?: number;
  start_date?: string;
  end_date?: string;
}

export interface RecruitmentFilterOption {
  id: string;
  name: string;
}

export interface RecruitmentFilterOptions {
  employers: RecruitmentFilterOption[];
  sourced_to: RecruitmentFilterOption[];
  projects: RecruitmentFilterOption[];
  branches: RecruitmentFilterOption[];
  segments: RecruitmentFilterOption[];
  product_types: RecruitmentFilterOption[];
}

export interface RecruitmentSummary {
  total_applicants: number;
  candidates_in_process: number;
  total_hired: number;
  /** 0–100 */
  hiring_conversion_rate: number;
  /** Days */
  average_time_to_hire: number;
}

export interface CandidateGrowthChartData {
  /** Display labels, e.g. "Apr 2022" */
  categories: string[];
  /** Raw month keys from API, e.g. "2022-04" */
  categoryKeys: string[];
  series: Array<{ name: string; data: number[] }>;
}

export interface RecruitmentFunnelStage {
  id: string;
  title: string;
  count: number;
  /** 0–100 */
  pass_rate: number;
}

export interface FulfillmentMetrics {
  active_vacancies: number;
  active_requested_count: number;
  fulfilled_headcount: number;
  /** 0–100 */
  fulfilment_rate: number;
}

export interface CandidateSourceSlice {
  label: string;
  count: number;
}

export interface TopHiringPosition {
  id: string;
  title: string;
  hired: number;
  target: number;
}

export interface FulfillmentPerformance {
  metrics: FulfillmentMetrics;
  candidate_sources: CandidateSourceSlice[];
  top_hiring_positions: TopHiringPosition[];
}

export interface AiVsHiringSuccessMetrics {
  ai_recommendation: number;
  hiring_success: number;
  tooltip_percent_denominator?: number;
}

export interface MatchingSkill {
  id: string;
  name: string;
  candidate_count: number;
}

export interface CandidateSourceByQuality {
  id: string;
  title: string;
  hires: number;
  /** 0–100 */
  quality_percent: number;
}

export interface CandidateQualityInsights {
  quality_score: number;
  ai_recommended_percent: number;
  ai_vs_hiring_success: AiVsHiringSuccessMetrics;
  top_matching_skills: MatchingSkill[];
  top_sources_by_quality: CandidateSourceByQuality[];
}

export interface RecruitmentDashboardData {
  summary: RecruitmentSummary;
  candidate_growth: CandidateGrowthChartData;
  funnel: RecruitmentFunnelStage[];
  fulfillment: FulfillmentPerformance;
  candidate_quality: CandidateQualityInsights;
}

export interface RecruitmentDashboardResult {
  dashboard: RecruitmentDashboardData;
  filterOptions: RecruitmentFilterOptions;
}

// --- Raw API types ---

interface ApiIdName {
  id: string;
  name: string;
}

interface ApiRecruitmentDashboardResponse {
  success: boolean;
  message?: string;
  summary?: {
    total_applicant?: number;
    candidates_in_process?: number;
    total_hired?: number;
    hiring_conversion_rate?: number;
    average_time_to_hire_days?: number;
  };
  candidate_growth?: {
    categories?: string[];
    series?: Array<{ name: string; data: number[] }>;
  };
  recruitment_funnel?: Array<{
    stage_name: string;
    total_count: number;
    pass_rate_percent: number;
  }>;
  fulfillment_performance?: {
    active_vacancies?: number;
    active_requested_count?: number;
    ready_for_hiring_headcount?: number;
    fulfillment_rate_percent?: number;
  };
  candidate_sources?: Array<{
    source_name?: string;
    total?: number;
    ready_for_hiring_count?: number;
    quality_rate_percent?: number;
  }>;
  top_hiring_positions?: Array<{
    position_name?: string;
    ready_for_hiring_count?: number;
    target_headcount?: number;
    achievement_percent?: number;
  }>;
  candidate_quality?: {
    score?: number;
    ai_recommended_percent?: number;
    ai_recommended_count?: number;
    ready_for_hiring_from_ai_recommended_count?: number;
    top_matching_skills?: Array<{
      skill?: string;
      name?: string;
      count?: number;
      candidate_count?: number;
    }>;
  };
  filter_options?: {
    employers?: ApiIdName[];
    sourced_to?: ApiIdName[];
    projects?: ApiIdName[];
    branches?: ApiIdName[];
    segments?: ApiIdName[];
    product_types?: ApiIdName[];
  };
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'item'
  );
}

function formatMonthCategory(cat: string): string {
  const m = cat.match(/^(\d{4})-(\d{2})$/);
  if (!m) return cat;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildRecruitmentQueryParams(filters: RecruitmentFilters): URLSearchParams {
  const params = new URLSearchParams();
  const add = (key: string, val: string | number | undefined) => {
    if (val === undefined || val === null || val === '' || val === '0') return;
    params.set(key, String(val));
  };

  add('employer_id', filters.employer);
  add('sourced_to_id', filters.sourced_to);
  add('project_id', filters.project);
  add('branch', filters.branch);
  const segmentIds = (filters.customer_segments ?? []).filter((id) => id && id !== '0');
  if (segmentIds.length > 0) {
    add('segment', segmentIds.join(','));
  }
  add('product_type', filters.product_type);

  if (filters.start_date && filters.end_date) {
    add('start_date', filters.start_date);
    add('end_date', filters.end_date);
  } else if (filters.year != null) {
    add('year', filters.year);
    if (filters.month != null) add('month', filters.month);
  }

  return params;
}

function mapFilterOptions(raw?: ApiRecruitmentDashboardResponse['filter_options']): RecruitmentFilterOptions {
  const mapList = (items?: ApiIdName[]) =>
    (items ?? []).map((x) => ({ id: String(x.id), name: String(x.name).trim() }));

  return {
    employers: mapList(raw?.employers),
    sourced_to: mapList(raw?.sourced_to),
    projects: mapList(raw?.projects),
    branches: mapList(raw?.branches),
    segments: mapList(raw?.segments),
    product_types: mapList(raw?.product_types),
  };
}

function mapRecruitmentApiToDashboard(json: ApiRecruitmentDashboardResponse): RecruitmentDashboardData {
  const summary = json.summary ?? {};
  const growthRaw = json.candidate_growth;
  const categoryKeys = growthRaw?.categories ?? [];
  const categories = categoryKeys.map(formatMonthCategory);
  const growthSeries = (growthRaw?.series ?? []).map((s) => ({
    name: s.name,
    data: (s.data ?? []).map((v) => num(v)),
  }));

  const funnel = (json.recruitment_funnel ?? []).map((stage) => ({
    id: slugify(stage.stage_name),
    title: stage.stage_name,
    count: num(stage.total_count),
    pass_rate: num(stage.pass_rate_percent),
  }));

  const fp = json.fulfillment_performance ?? {};
  const candidateSourcesRaw = json.candidate_sources ?? [];

  const candidateSources: CandidateSourceSlice[] = candidateSourcesRaw.map((s) => ({
    label: String(s.source_name ?? 'Unknown'),
    count: num(s.total),
  }));

  const topSourcesByQuality: CandidateSourceByQuality[] = candidateSourcesRaw.map((s) => ({
    id: slugify(String(s.source_name ?? 'unknown')),
    title: String(s.source_name ?? 'Unknown'),
    hires: num(s.ready_for_hiring_count),
    quality_percent: num(s.quality_rate_percent),
  }));

  const topHiringPositions: TopHiringPosition[] = (json.top_hiring_positions ?? []).map((p) => ({
    id: slugify(String(p.position_name ?? 'unknown')),
    title: String(p.position_name ?? 'Unknown'),
    hired: num(p.ready_for_hiring_count),
    target: num(p.target_headcount),
  }));

  const cq = json.candidate_quality ?? {};
  const topSkills = (cq.top_matching_skills ?? []).map((s, i) => {
    const name = String(s.skill ?? s.name ?? `Skill ${i + 1}`);
    return {
      id: slugify(name),
      name,
      candidate_count: num(s.count ?? s.candidate_count),
    };
  });

  const aiRecommended = num(cq.ai_recommended_count);
  const readyFromAi = num(cq.ready_for_hiring_from_ai_recommended_count);

  return {
    summary: {
      total_applicants: num(summary.total_applicant),
      candidates_in_process: num(summary.candidates_in_process),
      total_hired: num(summary.total_hired),
      hiring_conversion_rate: num(summary.hiring_conversion_rate),
      average_time_to_hire: num(summary.average_time_to_hire_days),
    },
    candidate_growth: {
      categories,
      categoryKeys,
      series: growthSeries,
    },
    funnel,
    fulfillment: {
      metrics: {
        active_vacancies: num(fp.active_vacancies),
        active_requested_count: num(fp.active_requested_count),
        fulfilled_headcount: num(fp.ready_for_hiring_headcount),
        fulfilment_rate: num(fp.fulfillment_rate_percent),
      },
      candidate_sources: candidateSources,
      top_hiring_positions: topHiringPositions,
    },
    candidate_quality: {
      quality_score: num(cq.score),
      ai_recommended_percent: num(cq.ai_recommended_percent),
      ai_vs_hiring_success: {
        ai_recommendation: aiRecommended,
        hiring_success: readyFromAi,
        tooltip_percent_denominator:
          aiRecommended + readyFromAi > 0 ? aiRecommended + readyFromAi : undefined,
      },
      top_matching_skills: topSkills,
      top_sources_by_quality: topSourcesByQuality,
    },
  };
}

export const EMPTY_RECRUITMENT_DASHBOARD: RecruitmentDashboardData = {
  summary: {
    total_applicants: 0,
    candidates_in_process: 0,
    total_hired: 0,
    hiring_conversion_rate: 0,
    average_time_to_hire: 0,
  },
  candidate_growth: { categories: [], categoryKeys: [], series: [] },
  funnel: [],
  fulfillment: {
    metrics: {
      active_vacancies: 0,
      active_requested_count: 0,
      fulfilled_headcount: 0,
      fulfilment_rate: 0,
    },
    candidate_sources: [],
    top_hiring_positions: [],
  },
  candidate_quality: {
    quality_score: 0,
    ai_recommended_percent: 0,
    ai_vs_hiring_success: { ai_recommendation: 0, hiring_success: 0 },
    top_matching_skills: [],
    top_sources_by_quality: [],
  },
};

export async function fetchRecruitmentDashboard(
  filters: RecruitmentFilters
): Promise<RecruitmentDashboardResult> {
  if (!AM_MAIN_API_URL) {
    throw new Error('NEXT_PUBLIC_AM_MAIN_API_URL is not set');
  }

  const params = buildRecruitmentQueryParams(filters);
  const url = `${AM_MAIN_API_URL}/analisis/api/recruitment-dashboard?${params.toString()}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (AM_MAIN_API_TOKEN) {
    headers['x-api-key'] = AM_MAIN_API_TOKEN;
  }

  console.log('[recruitment-dashboard] request', {
    method: 'GET',
    url,
    filters,
    query: Object.fromEntries(params.entries()),
    hasApiKey: Boolean(AM_MAIN_API_TOKEN),
  });

  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });

  console.log('[recruitment-dashboard] response_meta', {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get('content-type'),
  });

  if (!res.ok) {
    throw new Error(`recruitment-dashboard: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ApiRecruitmentDashboardResponse;

  console.log('[recruitment-dashboard] response_json', json);

  if (!json.success) {
    throw new Error(json.message || 'Recruitment dashboard request failed');
  }

  return {
    dashboard: mapRecruitmentApiToDashboard(json),
    filterOptions: mapFilterOptions(json.filter_options),
  };
}
