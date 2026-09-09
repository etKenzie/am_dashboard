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
  IconBrain,
  IconChartBar,
  IconClipboardList,
  IconFileDescription,
  IconPercentage,
  IconTargetArrow,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
  IconUserX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import AopMetricCard from '../aop/AopMetricCard';
import {
  areAopFiltersEqual,
  createDefaultAopUiFilters,
  type AopUiFilterState,
} from '../aop/aopChartHelpers';
import PageContainer from '../container/PageContainer';
import {
  applyLoanDateModeChange,
  formatLoanDate,
  isKasbonDateFilterReady,
  kasbonDateParams,
  parseLoanDateString,
  type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import { LoanDateModeToggle } from '../kasbon/KasbonFilters';
import ClientScopeFilters from '../shared/ClientScopeFilters';
import {
  EMPTY_SOURCING_DASHBOARD,
  fetchSourcingAnalytics,
  type SourcingFilters,
} from '../../api/sourcing/SourcingSlice';
import AiScoreDistributionChart from './AiScoreDistributionChart';
import CvBySkillChart from './CvBySkillChart';
import SourcingBreakdownList from './SourcingBreakdownList';
import SourcingDonutChart from './SourcingDonutChart';
import SourcingHorizontalBarChart from './SourcingHorizontalBarChart';
import TargetVsCvReceivedChart from './TargetVsCvReceivedChart';
import {
  EMPTY_SOURCING_FILTER_OPTIONS,
  type CandidateHiringProfileData,
  type SourcingExecutiveKpis,
  type SourcingFilterOptions,
  type SourcingNamedCount,
  type SourcingTrendPoint,
} from './sourcingDummyData';

const ALL_OPTION = { value: '0', label: 'All' };

function toSourcingFilters(filters: AopUiFilterState): SourcingFilters {
  const dateParams = kasbonDateParams(filters);
  const monthNum = filters.month ? Number(filters.month) : undefined;
  const yearNum = filters.year ? Number(filters.year) : undefined;

  return {
    employer: filters.employer,
    sourced_to: filters.sourcedTo,
    project: filters.project,
    branch: filters.branch,
    client_segments: filters.clientSegments,
    start_date: dateParams.start_date,
    end_date: dateParams.end_date,
    ...(filters.dateMode === 'month'
      ? {
          year: yearNum,
          month: monthNum,
        }
      : {}),
  };
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatSignedNumber(value: number): string {
  const formatted = Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatDecimal(value: number, digits = 1): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number): string {
  return `${formatDecimal(value, 1)}%`;
}

function toSelectOptions(items: Array<{ id: string; name: string }>) {
  return [ALL_OPTION, ...items.map((x) => ({ value: x.id, label: x.name }))];
}

function toMultiSelectOptions(items: Array<{ id: string; name: string }>) {
  return items.map((x) => ({ value: x.id, label: x.name }));
}

export default function SourcingOverview() {
  const [pendingFilters, setPendingFilters] = useState<AopUiFilterState>(createDefaultAopUiFilters);
  const [appliedFilters, setAppliedFilters] = useState<AopUiFilterState>(createDefaultAopUiFilters);
  const [filterOptions, setFilterOptions] = useState<SourcingFilterOptions>(EMPTY_SOURCING_FILTER_OPTIONS);
  const [kpis, setKpis] = useState<SourcingExecutiveKpis>(EMPTY_SOURCING_DASHBOARD.kpis);
  const [trend, setTrend] = useState<SourcingTrendPoint[]>(EMPTY_SOURCING_DASHBOARD.trend);
  const [aiScoreDistribution, setAiScoreDistribution] = useState<SourcingNamedCount[]>(
    EMPTY_SOURCING_DASHBOARD.aiScoreDistribution,
  );
  const [cvBySkill, setCvBySkill] = useState<SourcingNamedCount[]>(EMPTY_SOURCING_DASHBOARD.cvBySkill);
  const [candidateHiringProfile, setCandidateHiringProfile] = useState<CandidateHiringProfileData>(
    EMPTY_SOURCING_DASHBOARD.candidateHiringProfile,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!isKasbonDateFilterReady(appliedFilters)) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSourcingAnalytics(toSourcingFilters(appliedFilters));
        if (cancelled) return;
        setKpis(result.dashboard.kpis);
        setTrend(result.dashboard.trend);
        setAiScoreDistribution(result.dashboard.aiScoreDistribution);
        setCvBySkill(result.dashboard.cvBySkill);
        setCandidateHiringProfile(result.dashboard.candidateHiringProfile);
        setFilterOptions(result.filterOptions);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load sourcing analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sourcing data');
        setKpis(EMPTY_SOURCING_DASHBOARD.kpis);
        setTrend(EMPTY_SOURCING_DASHBOARD.trend);
        setAiScoreDistribution(EMPTY_SOURCING_DASHBOARD.aiScoreDistribution);
        setCvBySkill(EMPTY_SOURCING_DASHBOARD.cvBySkill);
        setCandidateHiringProfile(EMPTY_SOURCING_DASHBOARD.candidateHiringProfile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters]);

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

  const sectionTitleSx = { mb: 2, mt: 0, fontWeight: 600 } as const;

  const applyButton = (
    <Button
      variant="contained"
      onClick={handleApplyFilters}
      disabled={!isKasbonDateFilterReady(pendingFilters) || !hasPendingChanges || loading}
      sx={{ width: { xs: '100%', md: 'auto' }, whiteSpace: 'nowrap' }}
    >
      Apply Filters
    </Button>
  );

  const kpiCards = [
    {
      title: 'Sourcing Target',
      value: formatNumber(kpis.sourcing_target),
      icon: IconTargetArrow,
      iconColor: '#0D9488',
    },
    {
      title: 'CV Received',
      value: formatNumber(kpis.cv_received),
      icon: IconFileDescription,
      iconColor: '#2563EB',
    },
    {
      title: 'Sourcing Gap',
      value: formatNumber(kpis.sourcing_gap),
      icon: IconChartBar,
      iconColor: '#D97706',
    },
    {
      title: 'AVG AI Score',
      value: formatDecimal(kpis.avg_ai_score, 1),
      icon: IconBrain,
      iconColor: '#7C3AED',
    },
    {
      title: 'CV Stock Coverage',
      value: `${formatDecimal(kpis.cv_stock_coverage, 1)}x`,
      icon: IconClipboardList,
      iconColor: '#0891B2',
    },
    {
      title: 'Client Target',
      value: formatNumber(kpis.client_target),
      icon: IconUsers,
      iconColor: '#4F46E5',
    },
    {
      title: 'Hired by TA',
      value: formatNumber(kpis.hired),
      icon: IconUserCheck,
      iconColor: '#16A34A',
    },
    {
      title: 'On Board',
      value: formatNumber(kpis.on_board),
      icon: IconUserPlus,
      iconColor: '#059669',
    },
    {
      title: 'Hiring Gap',
      value: formatSignedNumber(kpis.hiring_gap),
      icon: IconUserX,
      iconColor: '#DC2626',
    },
    {
      title: 'CV to Hire Conversion',
      value: formatPercent(kpis.cv_to_hire_conversion),
      icon: IconPercentage,
      iconColor: '#DB2777',
    },
  ];

  return (
    <PageContainer title="Sourcing" description="Sourcing executive KPIs and trends">
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
            Sourcing
          </Typography>
          <LoanDateModeToggle value={pendingFilters.dateMode} onChange={handleDateModeChange} />
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
            disabled={loading}
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
          Executive KPI
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, minmax(0, 1fr))',
            },
            mb: 3,
          }}
        >
          {kpiCards.map((card) => (
            <AopMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              loading={loading}
              variant="stacked"
              compact
            />
          ))}
        </Box>

        <Box mt={4}>
          <TargetVsCvReceivedChart data={trend} loading={loading} />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          Sourcing Quality
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            alignItems: 'stretch',
          }}
        >
          <AiScoreDistributionChart
            data={aiScoreDistribution}
            avgAiScore={kpis.avg_ai_score}
            loading={loading}
          />
          <CvBySkillChart data={cvBySkill} loading={loading} />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          Candidate and Hiring Profile
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            alignItems: 'stretch',
            mb: 2,
          }}
        >
          <SourcingHorizontalBarChart
            title="Age Distribution"
            subtitle="Age profile of candidates."
            data={candidateHiringProfile.age_distribution}
            loading={loading}
            colors={['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1']}
            distributed
            unitLabel="candidates"
          />
          <SourcingDonutChart
            title="Gender Distribution"
            subtitle="Male / female mix of candidates."
            data={candidateHiringProfile.gender_distribution}
            loading={loading}
            colors={['#1E88E5', '#EC407A', '#8E24AA']}
            unitLabel="candidates"
          />
          <SourcingDonutChart
            title="Education Level"
            subtitle="Candidate education mix."
            data={candidateHiringProfile.minimum_education}
            loading={loading}
            colors={['#6D4C41', '#8E24AA', '#1E88E5', '#43A047']}
            unitLabel="candidates"
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            alignItems: 'stretch',
          }}
        >
          <SourcingBreakdownList
            title="Salary Range"
            subtitle="Salary range demand for open roles."
            data={candidateHiringProfile.salary_range}
            loading={loading}
            unitLabel="roles"
            barColor="#1E88E5"
          />
          <SourcingBreakdownList
            title="Working Type"
            subtitle="Onsite, hybrid, and remote mix for open roles."
            data={candidateHiringProfile.working_type}
            loading={loading}
            unitLabel="roles"
            barColor="#0D9488"
          />
          <SourcingBreakdownList
            title="Recruitment Type"
            subtitle="New hire vs replacement demand."
            data={candidateHiringProfile.recruitment_type}
            loading={loading}
            unitLabel="roles"
            barColor="#8E24AA"
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
