'use client';

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import {
  IconClock,
  IconPercentage,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getMockRecruitmentDashboard,
  RecruitmentDashboardData,
  RecruitmentFilters,
} from '../../api/recruitment/RecruitmentSlice';
import {
  fetchProjectFilterOptions,
  fetchSourcedToFilterOptions,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import CandidateGrowthChart from './CandidateGrowthChart';
import CandidateQualityInsightsBreakdownSection from './CandidateQualityInsightsBreakdownSection';
import CandidateQualityInsightsSection from './CandidateQualityInsightsSection';
import FulfillmentPerformanceSection from './FulfillmentPerformanceSection';
import RecruitmentFunnelCard from './RecruitmentFunnelCard';
import RecruitmentMetricCard from './RecruitmentMetricCard';

const EMPLOYER_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'PT Valdo International' },
  { value: '2', label: 'PT Valdo Sumber Daya Mandiri' },
  { value: '94', label: 'PT Toko Pandai' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'BPO Bundling' },
  { value: '2', label: 'Staffing' },
  { value: '3', label: 'Infra & Technology' },
];

const CUSTOMER_SEGMENT_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '98', label: 'All BFSI' },
  { value: '3', label: 'BFSI Bank' },
  { value: '7', label: 'BFSI Insurance' },
  { value: '8', label: 'BFSI Multi Finance' },
  { value: '9', label: 'BFSI Others' },
  { value: '99', label: 'All non BFSI' },
  { value: '1', label: 'Non BFSI Logistic' },
  { value: '2', label: 'Non BFSI F&B' },
  { value: '4', label: 'Non BFSI Others' },
  { value: '5', label: 'Non BFSI Distribution' },
  { value: '6', label: 'Non BFSI E-commerce' },
];

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

export default function RecruitmentOverview() {
  const [employer, setEmployer] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [customerSegment, setCustomerSegment] = useState('0');
  const [productType, setProductType] = useState('0');
  const [sourcedToOptions, setSourcedToOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '0', label: 'All' },
  ]);
  const [projectOptions, setProjectOptions] = useState<Array<{ value: string; label: string }>>([
    { value: '0', label: 'All' },
  ]);
  const [dashboard, setDashboard] = useState<RecruitmentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const filters: RecruitmentFilters = useMemo(
    () => ({
      employer,
      sourced_to: sourcedTo,
      project,
      customer_segment: customerSegment,
      product_type: productType,
    }),
    [employer, sourcedTo, project, customerSegment, productType]
  );

  useEffect(() => {
    let cancelled = false;
    fetchSourcedToFilterOptions({ employer })
      .then((rows) => {
        if (cancelled) return;
        setSourcedToOptions([{ value: '0', label: 'All' }, ...rows.map((x) => ({ value: x.id_sourced_to, label: x.name }))]);
      })
      .catch(() => {
        if (!cancelled) setSourcedToOptions([{ value: '0', label: 'All' }]);
      });
    return () => {
      cancelled = true;
    };
  }, [employer]);

  useEffect(() => {
    let cancelled = false;
    fetchProjectFilterOptions({ employer, sourced_to: sourcedTo || '0' })
      .then((rows) => {
        if (cancelled) return;
        setProjectOptions([{ value: '0', label: 'All' }, ...rows.map((x) => ({ value: x.id_project, label: x.name }))]);
      })
      .catch(() => {
        if (!cancelled) setProjectOptions([{ value: '0', label: 'All' }]);
      });
    return () => {
      cancelled = true;
    };
  }, [employer, sourcedTo]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setDashboard(getMockRecruitmentDashboard(filters));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const summary = dashboard?.summary;
  const growth = dashboard?.candidate_growth ?? [];
  const funnel = dashboard?.funnel ?? [];
  const fulfillment = dashboard?.fulfillment;
  const candidateQuality = dashboard?.candidate_quality;

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

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select value={employer} label="Employer" onChange={(e: SelectChangeEvent<string>) => setEmployer(e.target.value)}>
                {EMPLOYER_OPTIONS.map((o) => (
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
              <Select value={sourcedTo} label="Sourced To" onChange={(e: SelectChangeEvent<string>) => setSourcedTo(e.target.value)}>
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
                {CUSTOMER_SEGMENT_OPTIONS.map((o) => (
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
                {PRODUCT_TYPE_OPTIONS.map((o) => (
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
            value={formatNumber(summary?.total_applicants ?? 0)}
            icon={IconUsers}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Candidates in Process"
            value={formatNumber(summary?.candidates_in_process ?? 0)}
            icon={IconUsersGroup}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Total Hired"
            value={formatNumber(summary?.total_hired ?? 0)}
            icon={IconUserCheck}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Hiring Conversion Rate"
            value={formatPercent(summary?.hiring_conversion_rate ?? 0)}
            icon={IconPercentage}
            loading={loading}
          />
          <RecruitmentMetricCard
            title="Average Time to Hire"
            value={
              summary != null
                ? `${formatNumber(summary.average_time_to_hire)} days`
                : '—'
            }
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
