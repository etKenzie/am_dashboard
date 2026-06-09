'use client';

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
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

function formatDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDefaultDateRange() {
  const now = new Date();
  const y = now.getFullYear();
  return {
    start: `${y}-01-01`,
    end: formatDateYmd(now),
  };
}

export default function RecruitmentOverview() {
  const defaultRange = getDefaultDateRange();

  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const [employer, setEmployer] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [customerSegment, setCustomerSegment] = useState('0');
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
      customer_segment: customerSegment,
      product_type: productType,
      start_date: startDate,
      end_date: endDate,
    }),
    [employer, sourcedTo, project, customerSegment, productType, startDate, endDate]
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
    () => toSelectOptions(filterOptions.segments),
    [filterOptions.segments]
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

        <Grid container spacing={2} sx={{ mb: 2 }} width="100%">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              fullWidth
              label="Start date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              fullWidth
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              inputProps={{ min: startDate || undefined }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select
                value={employer}
                label="Employer"
                onChange={(e: SelectChangeEvent<string>) => {
                  setEmployer(e.target.value);
                  setSourcedTo('0');
                  setProject('0');
                }}
              >
                {employerOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sourced To</InputLabel>
              <Select
                value={sourcedTo}
                label="Sourced To"
                onChange={(e: SelectChangeEvent<string>) => {
                  setSourcedTo(e.target.value);
                  setProject('0');
                }}
              >
                {sourcedToOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Project</InputLabel>
              <Select value={project} label="Project" onChange={(e: SelectChangeEvent<string>) => setProject(e.target.value)}>
                {projectOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Segment</InputLabel>
              <Select
                value={customerSegment}
                label="Segment"
                onChange={(e: SelectChangeEvent<string>) => setCustomerSegment(e.target.value)}
              >
                {segmentOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select value={productType} label="Product Type" onChange={(e: SelectChangeEvent<string>) => setProductType(e.target.value)}>
                {productTypeOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
