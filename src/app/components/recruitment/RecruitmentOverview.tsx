'use client';

import {
  Box,
  Grid,
  Typography,
} from '@mui/material';
import {
  IconClock,
  IconPercentage,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EMPTY_RECRUITMENT_DASHBOARD,
  fetchRecruitmentDashboard,
  RecruitmentDashboardData,
  RecruitmentFilterOptions,
  RecruitmentFilters,
} from '../../api/recruitment/RecruitmentSlice';
import PageContainer from '../container/PageContainer';
import CandidateGrowthChart from './CandidateGrowthChart';
import CandidateQualityInsightsBreakdownSection from './CandidateQualityInsightsBreakdownSection';
import CandidateQualityInsightsSection from './CandidateQualityInsightsSection';
import FulfillmentPerformanceSection from './FulfillmentPerformanceSection';
import RecruitmentFunnelCard from './RecruitmentFunnelCard';
import RecruitmentMetricCard from './RecruitmentMetricCard';
import RecruitmentSegmentMultiSelect from './RecruitmentSegmentMultiSelect';
import RecruitmentSearchableSelect from './RecruitmentSearchableSelect';

const ALL_OPTION = { value: '0', label: 'All' };

const EMPTY_FILTER_OPTIONS: RecruitmentFilterOptions = {
  employers: [],
  sourced_to: [],
  projects: [],
  segments: [],
  product_types: [],
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

function toSelectOptions(items: Array<{ id: string; name: string }>) {
  return [ALL_OPTION, ...items.map((x) => ({ value: x.id, label: x.name }))];
}

function toMultiSelectOptions(items: Array<{ id: string; name: string }>) {
  return items.map((x) => ({ value: x.id, label: x.name }));
}

export default function RecruitmentOverview() {
  const [employer, setEmployer] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [customerSegments, setCustomerSegments] = useState<string[]>([]);
  const [productType, setProductType] = useState('0');
  const [filterOptions, setFilterOptions] = useState<RecruitmentFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [dashboard, setDashboard] = useState<RecruitmentDashboardData>(EMPTY_RECRUITMENT_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters: RecruitmentFilters = useMemo(
    () => ({
      employer,
      sourced_to: sourcedTo,
      project,
      customer_segments: customerSegments,
      product_type: productType,
    }),
    [employer, sourcedTo, project, customerSegments, productType]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecruitmentDashboard(filters);
      setDashboard(result.dashboard);
      setFilterOptions(result.filterOptions);
    } catch (err) {
      console.error('Failed to load recruitment dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recruitment data');
      setDashboard(EMPTY_RECRUITMENT_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const employerOptions = useMemo(
    () => toSelectOptions(filterOptions.employers),
    [filterOptions.employers]
  );
  const sourcedToOptions = useMemo(
    () => toSelectOptions(filterOptions.sourced_to),
    [filterOptions.sourced_to]
  );
  const projectOptions = useMemo(
    () => toSelectOptions(filterOptions.projects),
    [filterOptions.projects]
  );
  const segmentOptions = useMemo(
    () => toMultiSelectOptions(filterOptions.segments),
    [filterOptions.segments],
  );
  const productTypeOptions = useMemo(
    () => toSelectOptions(filterOptions.product_types),
    [filterOptions.product_types]
  );

  const summary = dashboard.summary;
  const growth = dashboard.candidate_growth;
  const funnel = dashboard.funnel;
  const fulfillment = dashboard.fulfillment;
  const candidateQuality = dashboard.candidate_quality;

  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;

  return (
    <PageContainer title="Recruitment" description="Recruitment metrics and candidate growth">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Recruitment
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Hiring funnel summary and month-to-month candidate growth.
        </Typography>

        {error && (
          <Typography variant="body2" color="error.main" mb={2}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <RecruitmentSearchableSelect
              label="Employer"
              value={employer}
              options={employerOptions}
              disabled={loading && employerOptions.length <= 1}
              onChange={(next) => {
                setEmployer(next);
                setSourcedTo('0');
                setProject('0');
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <RecruitmentSearchableSelect
              label="Sourced To"
              value={sourcedTo}
              options={sourcedToOptions}
              disabled={loading && sourcedToOptions.length <= 1}
              onChange={(next) => {
                setSourcedTo(next);
                setProject('0');
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <RecruitmentSearchableSelect
              label="Project"
              value={project}
              options={projectOptions}
              disabled={loading && projectOptions.length <= 1}
              onChange={setProject}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <RecruitmentSegmentMultiSelect
              label="Segment"
              value={customerSegments}
              options={segmentOptions}
              disabled={loading && segmentOptions.length === 0}
              onChange={setCustomerSegments}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <RecruitmentSearchableSelect
              label="Product Type"
              value={productType}
              options={productTypeOptions}
              disabled={loading && productTypeOptions.length <= 1}
              onChange={setProductType}
            />
          </Grid>
        </Grid>

        <Typography variant="h5" sx={sectionTitleSx}>
          Summary
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
            mb: 3,
          }}
        >
          <RecruitmentMetricCard
            title="Total Applicant"
            value={formatNumber(summary.total_applicants)}
            icon={IconUsers}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Candidates in Process"
            value={formatNumber(summary.candidates_in_process)}
            icon={IconUsersGroup}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Total Hired"
            value={formatNumber(summary.total_hired)}
            icon={IconUserCheck}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Hiring Conversion Rate"
            value={formatPercent(summary.hiring_conversion_rate)}
            icon={IconPercentage}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Average Time to Hire"
            value={`${formatNumber(summary.average_time_to_hire)} days`}
            icon={IconClock}
            loading={loading}
          />
        </Box>

        <Box mt={3}>
          <CandidateGrowthChart data={growth} loading={loading} />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          Recruitment Funnel Summary
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(7, minmax(0, 1fr))',
            },
            mb: 3,
          }}
        >
          {funnel.map((stage) => (
            <RecruitmentFunnelCard
              key={stage.id}
              title={stage.title}
              count={stage.count}
              passRate={stage.pass_rate}
              loading={loading}
            />
          ))}
        </Box>

        <Box mt={4}>
          <FulfillmentPerformanceSection data={fulfillment} loading={loading} />
        </Box>

        <Box mt={4}>
          <CandidateQualityInsightsSection data={candidateQuality} loading={loading} />
        </Box>

        <Box mt={4}>
          <CandidateQualityInsightsBreakdownSection data={candidateQuality} loading={loading} />
        </Box>
      </Box>
    </PageContainer>
  );
}
