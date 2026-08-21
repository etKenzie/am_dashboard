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
import { LoanDateModeToggle } from '../kasbon/KasbonFilters';
import {
  applyLoanDateModeChange,
  formatLoanDate,
  isKasbonDateFilterReady,
  parseLoanDateString,
  type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import ClientScopeFilters from '../shared/ClientScopeFilters';
import {
  buildDummySourcingKpis,
  DUMMY_SOURCING_FILTER_OPTIONS,
  getDummyAiScoreDistribution,
  getDummyCandidateHiringProfile,
  getDummyCvBySkill,
  getDummySourcingTrend,
  type CandidateHiringProfileData,
  type SourcingExecutiveKpis,
  type SourcingFilterOptions,
  type SourcingNamedCount,
  type SourcingTrendPoint,
} from './sourcingDummyData';
import AiScoreDistributionChart from './AiScoreDistributionChart';
import CandidateDemographicsChart from './CandidateDemographicsChart';
import CvBySkillChart from './CvBySkillChart';
import HiringRequirementChart from './HiringRequirementChart';
import SourcingHorizontalBarChart from './SourcingHorizontalBarChart';
import TargetVsCvReceivedChart from './TargetVsCvReceivedChart';

const ALL_OPTION = { value: '0', label: 'All' };

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
  const [filterOptions, setFilterOptions] = useState<SourcingFilterOptions>(DUMMY_SOURCING_FILTER_OPTIONS);
  const [kpis, setKpis] = useState<SourcingExecutiveKpis>(() => buildDummySourcingKpis(createDefaultAopUiFilters()));
  const [trend, setTrend] = useState<SourcingTrendPoint[]>(() =>
    getDummySourcingTrend(createDefaultAopUiFilters().year),
  );
  const [aiScoreDistribution, setAiScoreDistribution] = useState<SourcingNamedCount[]>(() =>
    getDummyAiScoreDistribution(createDefaultAopUiFilters()),
  );
  const [cvBySkill, setCvBySkill] = useState<SourcingNamedCount[]>(() =>
    getDummyCvBySkill(createDefaultAopUiFilters()),
  );
  const [candidateHiringProfile, setCandidateHiringProfile] = useState<CandidateHiringProfileData>(() =>
    getDummyCandidateHiringProfile(createDefaultAopUiFilters()),
  );
  const [loading, setLoading] = useState(false);

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
    setFilterOptions(DUMMY_SOURCING_FILTER_OPTIONS);
    setKpis(buildDummySourcingKpis(defaults));
    setTrend(getDummySourcingTrend(defaults.year));
    setAiScoreDistribution(getDummyAiScoreDistribution(defaults));
    setCvBySkill(getDummyCvBySkill(defaults));
    setCandidateHiringProfile(getDummyCandidateHiringProfile(defaults));
  }, []);

  useEffect(() => {
    if (!isKasbonDateFilterReady(appliedFilters)) return;

    setLoading(true);
    const timer = window.setTimeout(() => {
      setKpis(buildDummySourcingKpis(appliedFilters));
      setTrend(getDummySourcingTrend(appliedFilters.year || String(new Date().getFullYear())));
      setAiScoreDistribution(getDummyAiScoreDistribution(appliedFilters));
      setCvBySkill(getDummyCvBySkill(appliedFilters));
      setCandidateHiringProfile(getDummyCandidateHiringProfile(appliedFilters));
      setLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
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
    },
    {
      title: 'CV Received',
      value: formatNumber(kpis.cv_received),
      icon: IconFileDescription,
    },
    {
      title: 'Sourcing Gap',
      value: formatNumber(kpis.sourcing_gap),
      icon: IconChartBar,
    },
    {
      title: 'AVG AI Score',
      value: formatDecimal(kpis.avg_ai_score, 1),
      icon: IconBrain,
    },
    {
      title: 'CV Stock Coverage',
      value: `${formatDecimal(kpis.cv_stock_coverage, 1)}x`,
      icon: IconClipboardList,
    },
    {
      title: 'Client Target',
      value: formatNumber(kpis.client_target),
      icon: IconUsers,
    },
    {
      title: 'Hired',
      value: formatNumber(kpis.hired),
      icon: IconUserCheck,
    },
    {
      title: 'On Board',
      value: formatNumber(kpis.on_board),
      icon: IconUserPlus,
    },
    {
      title: 'Hiring Gap',
      value: formatSignedNumber(kpis.hiring_gap),
      icon: IconUserX,
    },
    {
      title: 'CV to Hire Conversion',
      value: formatPercent(kpis.cv_to_hire_conversion),
      icon: IconPercentage,
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
              loading={loading}
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
          <AiScoreDistributionChart data={aiScoreDistribution} loading={loading} />
          <CvBySkillChart data={cvBySkill} loading={loading} />
        </Box>

        <Typography variant="h5" sx={{ ...sectionTitleSx, mt: 4 }}>
          Candidate and Hiring Profile
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            alignItems: 'stretch',
            mb: 2,
          }}
        >
          <CandidateDemographicsChart
            ageDistribution={candidateHiringProfile.age_distribution}
            genderDistribution={candidateHiringProfile.gender_distribution}
            loading={loading}
          />
          <HiringRequirementChart
            salaryRange={candidateHiringProfile.salary_range}
            minimumEducation={candidateHiringProfile.minimum_education}
            loading={loading}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            alignItems: 'stretch',
          }}
        >
          <SourcingHorizontalBarChart
            title="Working Type"
            subtitle="Onsite, hybrid, and remote mix for open roles."
            data={candidateHiringProfile.working_type}
            loading={loading}
            colors={['#0D9488', '#1E88E5', '#FB8C00']}
            distributed
            unitLabel="roles"
          />
          <SourcingHorizontalBarChart
            title="Recruitment Type"
            subtitle="New hire vs replacement demand."
            data={candidateHiringProfile.recruitment_type}
            loading={loading}
            colors={['#43A047', '#8E24AA']}
            distributed
            unitLabel="roles"
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
