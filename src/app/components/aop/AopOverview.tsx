'use client';

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  IconCash,
  IconCashOff,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AopAssociatesByBranch,
  AopDashboardData,
  AopFilterOptions,
  AopFilters,
  EMPTY_AOP_DASHBOARD,
  fetchAopBranchBreakdown,
  fetchAopFilterOptions,
  fetchAopRoleGroupingBreakdown,
  fetchAopSummary,
  fetchAopTopBreakdown,
} from '../../api/aop/AopSlice';
import PageContainer from '../container/PageContainer';
import { LoanDateModeToggle } from '../kasbon/KasbonFilters';
import {
  applyLoanDateModeChange,
  formatLoanDate,
  isKasbonDateFilterReady,
  kasbonDateParams,
  parseLoanDateString,
  type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import ClientScopeFilters from '../shared/ClientScopeFilters';
import AopMetricCard from './AopMetricCard';
import AssociatesByBranchChart from './AssociatesByBranchChart';
import AssociatesByRoleGroupingChart from './AssociatesByRoleGroupingChart';
import AssociatesByTermsOfPaymentChart from './AssociatesByTermsOfPaymentChart';
import AssociatesEmploymentTypeSection from './AssociatesEmploymentTypeSection';
import AssociatesTrendChart from './AssociatesTrendChart';
import PayrollCompositionSection from './PayrollCompositionSection';
import {
  areAopFiltersEqual,
  createDefaultAopUiFilters,
  isAopCurrentYearMonthMode,
  type AopUiFilterState,
} from './aopChartHelpers';

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

function toMultiSelectOptions(items: Array<{ id: string; name: string }>) {
  return items.map((x) => ({ value: x.id, label: x.name }));
}

function toSummaryFilters(filters: AopUiFilterState): AopFilters {
  const dateParams = kasbonDateParams(filters);
  return {
    employer: filters.employer,
    sourced_to: filters.sourcedTo,
    project: filters.project,
    branch: filters.branch,
    client_segments: filters.clientSegments,
    start_date: dateParams.start_date ?? '',
    end_date: dateParams.end_date ?? '',
  };
}

function toTrendChartFilters(filters: AopUiFilterState) {
  return {
    employer: filters.employer,
    sourced_to: filters.sourcedTo,
    project: filters.project,
    branch: filters.branch,
    client_segments: filters.clientSegments,
    dateMode: filters.dateMode,
    month: filters.month,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
}

export default function AopOverview() {
  const [pendingFilters, setPendingFilters] = useState<AopUiFilterState>(createDefaultAopUiFilters);
  const [appliedFilters, setAppliedFilters] = useState<AopUiFilterState>(createDefaultAopUiFilters);
  const [filterOptions, setFilterOptions] = useState<AopFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [dashboard, setDashboard] = useState<AopDashboardData>(EMPTY_AOP_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const monthNum = (i + 1).toString().padStart(2, '0');
        const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
        return { value: monthNum, label: monthName };
      }),
    [],
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  useEffect(() => {
    const defaults = createDefaultAopUiFilters();
    setPendingFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  const appliedSummaryFilters = useMemo(
    () => toSummaryFilters(appliedFilters),
    [appliedFilters],
  );

  const appliedTrendChartFilters = useMemo(
    () => toTrendChartFilters(appliedFilters),
    [appliedFilters],
  );

  const loadFilterOptions = useCallback(async (filters: AopUiFilterState) => {
    if (!isKasbonDateFilterReady(filters)) return;

    const summaryFilters = toSummaryFilters(filters);
    if (!summaryFilters.start_date || !summaryFilters.end_date) return;

    setFilterOptionsLoading(true);
    try {
      const options = await fetchAopFilterOptions(summaryFilters);
      setFilterOptions(options);
    } catch (err) {
      console.error('Failed to load Associates On Payroll filter options:', err);
      setFilterOptions(EMPTY_FILTER_OPTIONS);
    } finally {
      setFilterOptionsLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async (filters: AopUiFilterState) => {
    if (!isKasbonDateFilterReady(filters)) return;

    const summaryFilters = toSummaryFilters(filters);
    if (!summaryFilters.start_date || !summaryFilters.end_date) return;

    setLoading(true);
    try {
      const [
        summaryPart,
        associates_by_branch,
        associates_by_role_grouping,
        associates_by_terms_of_payment,
      ] = await Promise.all([
        fetchAopSummary(summaryFilters),
        filters.branch === '0'
          ? fetchAopBranchBreakdown(summaryFilters)
          : Promise.resolve([] as AopAssociatesByBranch[]),
        fetchAopRoleGroupingBreakdown(summaryFilters),
        fetchAopTopBreakdown(summaryFilters),
      ]);
      setDashboard((prev) => ({
        ...prev,
        ...summaryPart,
        associates_by_branch,
        associates_by_role_grouping,
        associates_by_terms_of_payment,
      }));
    } catch (err) {
      console.error('Failed to load Associates On Payroll dashboard:', err);
      setDashboard(EMPTY_AOP_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isKasbonDateFilterReady(appliedFilters)) return;
    loadFilterOptions(appliedFilters);
    loadDashboard(appliedFilters);
  }, [appliedFilters, loadFilterOptions, loadDashboard]);

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
  };

  const handleDateModeChange = (nextMode: LoanDateMode) => {
    setPendingFilters((prev) => {
      const next = applyLoanDateModeChange(
        {
          dateMode: prev.dateMode,
          month: prev.month,
          year: prev.year,
          startDate: prev.startDate,
          endDate: prev.endDate,
          employer: '',
          placement: '',
          project: '',
          branch: '',
          clientSegments: [],
          productType: '',
        },
        nextMode,
      );
      return { ...prev, ...next };
    });
  };

  const hasPendingChanges = useMemo(
    () => !areAopFiltersEqual(pendingFilters, appliedFilters),
    [pendingFilters, appliedFilters],
  );

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
    () => toMultiSelectOptions(filterOptions.segments),
    [filterOptions.segments],
  );

  useEffect(() => {
    if (pendingFilters.clientSegments.length === 0) return;
    const validIds = new Set(segmentOptions.map((option) => option.value));
    const next = pendingFilters.clientSegments.filter((id) => validIds.has(id));
    if (next.length !== pendingFilters.clientSegments.length) {
      setPendingFilters((prev) => ({ ...prev, clientSegments: next }));
    }
  }, [pendingFilters.clientSegments, segmentOptions]);

  const filtersBusy = loading || filterOptionsLoading;
  const hideZeroChartValues = isAopCurrentYearMonthMode(appliedFilters.dateMode, appliedFilters.year);
  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;
  const { summary } = dashboard;

  const applyButton = (
    <Button
      variant="contained"
      onClick={handleApplyFilters}
      disabled={!isKasbonDateFilterReady(pendingFilters) || !hasPendingChanges || filtersBusy}
      sx={{ width: { xs: '100%', md: 'auto' }, whiteSpace: 'nowrap' }}
    >
      Apply Filters
    </Button>
  );

  return (
    <PageContainer title="Associates On Payroll" description="Associates on Payroll metrics and trends">
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h3" fontWeight="bold">
            Associates On Payroll
          </Typography>
          <LoanDateModeToggle value={pendingFilters.dateMode} onChange={handleDateModeChange} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {pendingFilters.dateMode === 'month' ? (
            <Grid container spacing={2} width="100%" alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={pendingFilters.month}
                    label="Month"
                    onChange={(e: SelectChangeEvent) =>
                      setPendingFilters((prev) => ({ ...prev, month: e.target.value }))
                    }
                    disabled={filtersBusy}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={pendingFilters.year}
                    label="Year"
                    onChange={(e: SelectChangeEvent) =>
                      setPendingFilters((prev) => ({ ...prev, year: e.target.value }))
                    }
                    disabled={filtersBusy}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{ md: 'auto' }}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                {applyButton}
              </Grid>
            </Grid>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} width="100%" alignItems="center">
                <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                  <DatePicker
                    label="Start Date"
                    value={parseLoanDateString(pendingFilters.startDate)}
                    onChange={(date) => {
                      if (!date) return;
                      setPendingFilters((prev) => ({ ...prev, startDate: formatLoanDate(date) }));
                    }}
                    disabled={filtersBusy}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                  <DatePicker
                    label="End Date"
                    value={parseLoanDateString(pendingFilters.endDate)}
                    onChange={(date) => {
                      if (!date) return;
                      setPendingFilters((prev) => ({ ...prev, endDate: formatLoanDate(date) }));
                    }}
                    disabled={filtersBusy}
                    minDate={parseLoanDateString(pendingFilters.startDate) ?? undefined}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid
                  size={{ md: 'auto' }}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  {applyButton}
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}

          <ClientScopeFilters
            disabled={filtersBusy}
            values={{
              employer: pendingFilters.employer,
              sourcedTo: pendingFilters.sourcedTo,
              project: pendingFilters.project,
              branch: pendingFilters.branch,
              segments: pendingFilters.clientSegments,
            }}
            options={{
              employers: employerOptions,
              sourcedTo: sourcedToOptions,
              projects: projectOptions,
              branches: branchOptions,
              segments: segmentOptions,
            }}
            onChange={(next) => {
              setPendingFilters((prev) => ({
                ...prev,
                employer: next.employer,
                sourcedTo: next.sourcedTo,
                project: next.project,
                branch: next.branch,
                clientSegments: next.segments,
              }));
            }}
          />

          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
            {applyButton}
          </Box>
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
              lg: 'repeat(4, minmax(0, 1fr))',
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
          <AopMetricCard
            title="Non-Billable Associates"
            value={formatNumber(summary.non_billable_associates)}
            icon={IconCashOff}
            loading={loading}
          />
        </Box>

        <Box mt={4}>
          <AssociatesTrendChart filters={appliedTrendChartFilters} />
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
          <AssociatesEmploymentTypeSection
            data={dashboard.employment_type}
            loading={loading}
            hideZeroValues={hideZeroChartValues}
          />
          <PayrollCompositionSection
            data={dashboard.payroll_composition}
            loading={loading}
            hideZeroValues={hideZeroChartValues}
          />
        </Box>

        <Box mt={4}>
          <AssociatesByTermsOfPaymentChart
            data={dashboard.associates_by_terms_of_payment}
            loading={loading}
            hideZeroValues={hideZeroChartValues}
          />
        </Box>

        <Box
          mt={4}
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              lg: appliedFilters.branch === '0' ? '1fr 1fr' : '1fr',
            },
            alignItems: 'stretch',
          }}
        >
          {appliedFilters.branch === '0' && (
            <AssociatesByBranchChart
              data={dashboard.associates_by_branch}
              loading={loading}
              hideZeroValues={hideZeroChartValues}
            />
          )}
          <AssociatesByRoleGroupingChart
            data={dashboard.associates_by_role_grouping}
            loading={loading}
            hideZeroValues={hideZeroChartValues}
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
