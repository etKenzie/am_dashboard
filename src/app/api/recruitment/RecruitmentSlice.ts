/**
 * Recruitment API — placeholder types and mock data until endpoints are available.
 */

export interface RecruitmentFilters {
  employer: string;
  sourced_to: string;
  project: string;
  customer_segment: string;
  product_type: string;
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

export interface CandidateGrowthPoint {
  month: string;
  count: number;
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
  /** Raw count / score (axis is numeric, not %) */
  ai_recommendation: number;
  hiring_success: number;
  /**
   * If set, tooltip % is `value / denominator × 100`.
   * If omitted, % is each bar’s share of (AI Recommendation + Hiring Success).
   */
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
  /** 0–100 — drives progress bar and right-aligned % */
  quality_percent: number;
}

export interface CandidateQualityInsights {
  /** 0–100, one decimal */
  quality_score: number;
  /** 0–100 AI recommended share */
  ai_recommended_percent: number;
  ai_vs_hiring_success: AiVsHiringSuccessMetrics;
  top_matching_skills: MatchingSkill[];
  top_sources_by_quality: CandidateSourceByQuality[];
}

export interface RecruitmentDashboardData {
  summary: RecruitmentSummary;
  candidate_growth: CandidateGrowthPoint[];
  funnel: RecruitmentFunnelStage[];
  fulfillment: FulfillmentPerformance;
  candidate_quality: CandidateQualityInsights;
}

/** Mock dashboard payload (replace with API call when ready). */
export function getMockRecruitmentDashboard(_filters: RecruitmentFilters): RecruitmentDashboardData {
  return {
    summary: {
      total_applicants: 1248,
      candidates_in_process: 186,
      total_hired: 312,
      hiring_conversion_rate: 25.0,
      average_time_to_hire: 28,
    },
    candidate_growth: [
      { month: 'Jul 2025', count: 82 },
      { month: 'Aug 2025', count: 95 },
      { month: 'Sep 2025', count: 110 },
      { month: 'Oct 2025', count: 98 },
      { month: 'Nov 2025', count: 124 },
      { month: 'Dec 2025', count: 118 },
      { month: 'Jan 2026', count: 132 },
      { month: 'Feb 2026', count: 145 },
      { month: 'Mar 2026', count: 156 },
      { month: 'Apr 2026', count: 168 },
    ],
    funnel: [
      { id: 'pipeline_list', title: 'Pipeline List', count: 1248, pass_rate: 85 },
      { id: 'interview_hr', title: 'Interview HR', count: 892, pass_rate: 72 },
      { id: 'test_skill', title: 'Test Skill', count: 654, pass_rate: 68 },
      { id: 'psychological_test', title: 'Psychological Test', count: 445, pass_rate: 65 },
      { id: 'background_check', title: 'Background Check', count: 312, pass_rate: 70 },
      { id: 'user_interview', title: 'User Interview', count: 198, pass_rate: 58 },
      { id: 'ready_to_hire', title: 'Ready to Hire', count: 124, pass_rate: 62 },
    ],
    fulfillment: {
      metrics: {
        active_vacancies: 156,
        active_requested_count: 420,
        fulfilled_headcount: 248,
        fulfilment_rate: 59.0,
      },
      candidate_sources: [
        { label: 'Job Portal', count: 412 },
        { label: 'Linkedin', count: 328 },
        { label: 'Jobstreet', count: 265 },
        { label: 'Job Fair', count: 178 },
      ],
      top_hiring_positions: [
        { id: 'software_engineer', title: 'Software Engineer', hired: 48, target: 100 },
        { id: 'ui_ux_designer', title: 'UI/UX Designer', hired: 32, target: 50 },
        { id: 'front_end_engineer', title: 'Front End Engineer', hired: 41, target: 80 },
        { id: 'qa_automation', title: 'QA Automation', hired: 28, target: 40 },
        { id: 'project_manager', title: 'Project Manager', hired: 22, target: 35 },
        { id: 'accounting', title: 'Accounting', hired: 15, target: 25 },
        { id: 'data_analyst', title: 'Data Analyst', hired: 19, target: 30 },
        { id: 'devops_engineer', title: 'DevOps Engineer', hired: 14, target: 22 },
        { id: 'business_analyst', title: 'Business Analyst', hired: 18, target: 28 },
        { id: 'customer_support', title: 'Customer Support', hired: 24, target: 45 },
        { id: 'hr_generalist', title: 'HR Generalist', hired: 12, target: 20 },
        { id: 'marketing_exec', title: 'Marketing Executive', hired: 16, target: 26 },
      ],
    },
    candidate_quality: {
      quality_score: 82.5,
      ai_recommended_percent: 74,
      ai_vs_hiring_success: {
        ai_recommendation: 248,
        hiring_success: 186,
        tooltip_percent_denominator: 520,
      },
      top_matching_skills: [
        { id: 'javascript', name: 'JavaScript', candidate_count: 84 },
        { id: 'python', name: 'Python', candidate_count: 72 },
        { id: 'react', name: 'React', candidate_count: 65 },
        { id: 'typescript', name: 'TypeScript', candidate_count: 61 },
        { id: 'sql', name: 'SQL', candidate_count: 58 },
        { id: 'communication', name: 'Communication', candidate_count: 52 },
        { id: 'nodejs', name: 'Node.js', candidate_count: 48 },
        { id: 'excel', name: 'Excel', candidate_count: 46 },
        { id: 'project_management', name: 'Project Management', candidate_count: 41 },
        { id: 'java', name: 'Java', candidate_count: 38 },
        { id: 'agile', name: 'Agile', candidate_count: 34 },
        { id: 'leadership', name: 'Leadership', candidate_count: 32 },
        { id: 'aws', name: 'AWS', candidate_count: 29 },
        { id: 'problem_solving', name: 'Problem Solving', candidate_count: 27 },
        { id: 'ui_ux', name: 'UI/UX', candidate_count: 24 },
        { id: 'docker', name: 'Docker', candidate_count: 22 },
        { id: 'data_analysis', name: 'Data Analysis', candidate_count: 20 },
        { id: 'customer_service', name: 'Customer Service', candidate_count: 18 },
        { id: 'git', name: 'Git', candidate_count: 16 },
        { id: 'negotiation', name: 'Negotiation', candidate_count: 14 },
      ],
      top_sources_by_quality: [
        { id: 'referral', title: 'Referral', hires: 42, quality_percent: 88 },
        { id: 'linkedin', title: 'Linkedin', hires: 56, quality_percent: 76 },
        { id: 'job_portal', title: 'Job Portal', hires: 68, quality_percent: 71 },
        { id: 'jobstreet', title: 'Jobstreet', hires: 45, quality_percent: 64 },
        { id: 'job_fair', title: 'Job Fair', hires: 28, quality_percent: 58 },
        { id: 'campus', title: 'Campus Hiring', hires: 22, quality_percent: 55 },
        { id: 'agency', title: 'Agency', hires: 19, quality_percent: 52 },
        { id: 'internal', title: 'Internal Transfer', hires: 14, quality_percent: 49 },
        { id: 'social_media', title: 'Social Media', hires: 12, quality_percent: 46 },
      ],
    },
  };
}
