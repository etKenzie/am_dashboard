'use client';

import { Box, Grid, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  IconCash,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AopDashboardData,
  AopFilterOptions,
  AopFilters,
  EMPTY_AOP_DASHBOARD,
  fetchAopDashboard,
} from '../../api/aop/AopSlice';
import {
  formatLoanDate,
  getYearToDateRange,
  parseLoanDateString,
} from '../kasbon/kasbonDateHelpers';
import PageContainer from '../container/PageContainer';
import RecruitmentSearchableSelect from '../recruitment/RecruitmentSearchableSelect';
import AssociatesEmploymentTypeSection from './AssociatesEmploymentTypeSection';
import AssociatesTrendChart from './AssociatesTrendChart';
import AopMetricCard from './AopMetricCard';
import PayrollCompositionSection from './PayrollCompositionSection';

const ALL_OPTION = { value: '0', label: 'All' };

const EMPTY_FILTER_OPTIONS: AopFilterOptions = {
  employers: [],
  sourced_to: [],
  projects: [],
  branches: [],
  segments: [],
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function toSelectOptions(items: Array<{ id: string; name: string }>) {
  return [ALL_OPTION, ...items.map((x) => ({ value: x.id, label: x.name }))];
}

export default function AopOverview() {
  const [employer, setEmployer] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [branch, setBranch] = useState('0');
  const [clientSegment, setClientSegment] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOptions, setFilterOptions] = useState<AopFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [dashboard, setDashboard] = useState<AopDashboardData>(EMPTY_AOP_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { startDate: start, endDate: end } = getYearToDateRange();
    setStartDate(start);
    setEndDate(end);
  }, []);

  const filters: AopFilters = useMemo(
    () => ({
      employer,
      sourced_to: sourcedTo,
      project,
      branch,
      client_segment: clientSegment,
      start_date: startDate,
      end_date: endDate,
    }),
    [employer, sourcedTo, project, branch, clientSegment, startDate, endDate],
  );

  const loadDashboard = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const result = await fetchAopDashboard(filters);
      setDashboard(result.dashboard);
      setFilterOptions(result.filterOptions);
    } catch (err) {
      console.error('Failed to load Associates On Payroll dashboard:', err);
      setDashboard(EMPTY_AOP_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [filters, startDate, endDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const employerOptions = useMemo(
    () => toSelectOptions(filterOptions.employers),
    [filterOptions.employers],
  );
  const sourcedToOptions = useMemo(
    () => toSelectOptions(filterOptions.sourced_to),
    [filterOptions.sourced_to],
  );
  const projectOptions = useMemo(
    () => toSelectOptions(filterOptions.projects),
    [filterOptions.projects],
  );
  const branchOptions = useMemo(
    () => toSelectOptions(filterOptions.branches),
    [filterOptions.branches],
  );
  const segmentOptions = useMemo(
    () => toSelectOptions(filterOptions.segments),
    [filterOptions.segments],
  );

  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;
  const { summary } = dashboard;

  return (
    <PageContainer title="Associates On Payroll" description="Associates on Payroll metrics and trends">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={3}>
          Associates On Payroll
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} width="100%">
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Start Date"
                  value={parseLoanDateString(startDate)}
                  onChange={(date) => {
                    if (!date) return;
                    setStartDate(formatLoanDate(date));
                  }}
                  disabled={loading}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="End Date"
                  value={parseLoanDateString(endDate)}
                  onChange={(date) => {
                    if (!date) return;
                    setEndDate(formatLoanDate(date));
                  }}
                  disabled={loading}
                  minDate={parseLoanDateString(startDate) ?? undefined}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Grid container spacing={2} width="100%">
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
                  setBranch('0');
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
                  setBranch('0');
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
              <RecruitmentSearchableSelect
                label="Branch"
                value={branch}
                options={branchOptions}
                disabled={loading && branchOptions.length <= 1}
                onChange={setBranch}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Client Segment"
                value={clientSegment}
                options={segmentOptions}
                disabled={loading && segmentOptions.length <= 1}
                onChange={setClientSegment}
              />
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h5" sx={sectionTitleSx}>
          Associates Summary
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            mb: 3,
          }}
        >
          <AopMetricCard
            title="Total Associates on Payroll"
            value={formatNumber(summary.total_associates_on_payroll)}
            icon={IconUsers}
            loading={loading}
          />
          <AopMetricCard
            title="First Payroll Associates"
            value={formatNumber(summary.first_payroll_associates)}
            icon={IconUserCheck}
            loading={loading}
          />
          <AopMetricCard
            title="Billable Associates"
            value={formatNumber(summary.billable_associates)}
            icon={IconCash}
            loading={loading}
          />
        </Box>

        <Box mt={4}>
          <AssociatesTrendChart data={dashboard.associates_trend} loading={loading} />
        </Box>

        <Box
          mt={4}
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            alignItems: 'stretch',
          }}
        >
          <AssociatesEmploymentTypeSection data={dashboard.employment_type} loading={loading} />
          <PayrollCompositionSection data={dashboard.payroll_composition} loading={loading} />
        </Box>
      </Box>
    </PageContainer>
  );
}
