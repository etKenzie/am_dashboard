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
    AopDashboardData,
    AopFilterOptions,
    AopFilters,
    EMPTY_AOP_DASHBOARD,
    fetchAopDashboard,
    fetchAopFilterOptions,
} from '../../api/aop/AopSlice';
import PageContainer from '../container/PageContainer';
import { LoanDateModeToggle } from '../kasbon/KasbonFilters';
import {
    applyLoanDateModeChange,
    formatLoanDate,
    getDefaultKasbonFilterDates,
    isKasbonDateFilterReady,
    kasbonDateParams,
    parseLoanDateString,
    type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import ClientScopeFilters from '../shared/ClientScopeFilters';
import AopMetricCard from './AopMetricCard';
import AssociatesEmploymentTypeSection from './AssociatesEmploymentTypeSection';
import AssociatesTrendChart from './AssociatesTrendChart';
import PayrollCompositionSection from './PayrollCompositionSection';
import { isAopCurrentYearMonthMode } from './aopChartHelpers';

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

export default function AopOverview() {
  const [employer, setEmployer] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');
  const [branch, setBranch] = useState('0');
  const [clientSegments, setClientSegments] = useState<string[]>([]);
  const [dateMode, setDateMode] = useState<LoanDateMode>('month');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
    const defaults = getDefaultKasbonFilterDates();
    setDateMode(defaults.dateMode);
    setMonth(defaults.month);
    setYear(defaults.year);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
  }, []);

  const dateFilterInputs = useMemo(
    () => ({ dateMode, month, year, startDate, endDate }),
    [dateMode, month, year, startDate, endDate],
  );

  const summaryDateParams = useMemo(
    () => kasbonDateParams(dateFilterInputs),
    [dateFilterInputs],
  );

  const summaryFilters: AopFilters = useMemo(
    () => ({
      employer,
      sourced_to: sourcedTo,
      project,
      branch,
      client_segments: clientSegments,
      start_date: summaryDateParams.start_date ?? '',
      end_date: summaryDateParams.end_date ?? '',
    }),
    [employer, sourcedTo, project, branch, clientSegments, summaryDateParams],
  );

  const trendChartFilters = useMemo(
    () => ({
      employer,
      sourced_to: sourcedTo,
      project,
      branch,
      client_segments: clientSegments,
      dateMode,
      month,
      year,
      startDate,
      endDate,
    }),
    [employer, sourcedTo, project, branch, clientSegments, dateMode, month, year, startDate, endDate],
  );

  const loadFilterOptions = useCallback(async () => {
    if (!isKasbonDateFilterReady(dateFilterInputs)) return;
    if (!summaryDateParams.start_date || !summaryDateParams.end_date) return;

    setFilterOptionsLoading(true);
    try {
      const options = await fetchAopFilterOptions({
        start_date: summaryDateParams.start_date,
        end_date: summaryDateParams.end_date,
        employer,
      });
      setFilterOptions(options);
    } catch (err) {
      console.error('Failed to load Associates On Payroll filter options:', err);
      setFilterOptions(EMPTY_FILTER_OPTIONS);
    } finally {
      setFilterOptionsLoading(false);
    }
  }, [dateFilterInputs, summaryDateParams.start_date, summaryDateParams.end_date, employer]);

  const loadDashboard = useCallback(async () => {
    if (!isKasbonDateFilterReady(dateFilterInputs)) return;
    if (!summaryFilters.start_date || !summaryFilters.end_date) return;

    setLoading(true);
    try {
      const result = await fetchAopDashboard(summaryFilters);
      setDashboard(result);
    } catch (err) {
      console.error('Failed to load Associates On Payroll dashboard:', err);
      setDashboard(EMPTY_AOP_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [summaryFilters, dateFilterInputs]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDateModeChange = (nextMode: LoanDateMode) => {
    const next = applyLoanDateModeChange(
      {
        dateMode,
        month,
        year,
        startDate,
        endDate,
        employer: '',
        placement: '',
        project: '',
        branch: '',
        clientSegments: [],
        productType: '',
      },
      nextMode,
    );
    setDateMode(next.dateMode);
    setMonth(next.month);
    setYear(next.year);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

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
    if (clientSegments.length === 0) return;
    const validIds = new Set(segmentOptions.map((option) => option.value));
    const next = clientSegments.filter((id) => validIds.has(id));
    if (next.length !== clientSegments.length) {
      setClientSegments(next);
    }
  }, [clientSegments, segmentOptions]);

  const filtersBusy = loading || filterOptionsLoading;
  const hideZeroChartValues = isAopCurrentYearMonthMode(dateMode, year);
  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;
  const { summary } = dashboard;

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
          <LoanDateModeToggle value={dateMode} onChange={handleDateModeChange} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {dateMode === 'month' ? (
            <Grid container spacing={2} width="100%">
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={month}
                    label="Month"
                    onChange={(e: SelectChangeEvent) => setMonth(e.target.value)}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    label="Year"
                    onChange={(e: SelectChangeEvent) => setYear(e.target.value)}
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
            </Grid>
          ) : (
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
                    disabled={filtersBusy}
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
                    disabled={filtersBusy}
                    minDate={parseLoanDateString(startDate) ?? undefined}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}

          <ClientScopeFilters
            disabled={filtersBusy}
            values={{
              employer,
              sourcedTo,
              project,
              branch,
              segments: clientSegments,
            }}
            options={{
              employers: employerOptions,
              sourcedTo: sourcedToOptions,
              projects: projectOptions,
              branches: branchOptions,
              segments: segmentOptions,
            }}
            onChange={(next) => {
              setEmployer(next.employer);
              setSourcedTo(next.sourcedTo);
              setProject(next.project);
              setBranch(next.branch);
              setClientSegments(next.segments);
            }}
          />
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
          <AssociatesTrendChart filters={trendChartFilters} />
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
      </Box>
    </PageContainer>
  );
}
