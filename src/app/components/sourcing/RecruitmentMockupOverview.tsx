'use client';

import {
  Box,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  areAopFiltersEqual,
  createDefaultAopUiFilters,
  type AopUiFilterState,
} from '../aop/aopChartHelpers';
import PageContainer from '../container/PageContainer';
import {
  isKasbonDateFilterReady,
  kasbonDateParams,
} from '../kasbon/kasbonDateHelpers';
import RecruitmentSearchableSelect from '../recruitment/RecruitmentSearchableSelect';
import {
  EMPTY_SOURCING_DASHBOARD,
  fetchSourcingAnalytics,
  type SourcingFilters,
} from '../../api/sourcing/SourcingSlice';
import CurrentRecruitmentFunnelSection from './CurrentRecruitmentFunnelSection';
import RecruitmentProductivitySection from './RecruitmentProductivitySection';
import NewCandidateGrowthSection from './NewCandidateGrowthSection';
import RecruitmentOverviewSection from './RecruitmentOverviewSection';
import {
  EMPTY_SOURCING_FILTER_OPTIONS,
  type SourcingExecutiveKpis,
  type SourcingFilterOptions,
  type NewCandidateGrowthData,
  type CurrentRecruitmentFunnelStage,
  type RecruitmentProductivityMetric,
} from './sourcingDummyData';

const ALL_OPTION = { value: '0', label: 'All' };

type SourcingUiFilterState = AopUiFilterState & {
  recruitmentType: string;
  sourcingPic: string;
  priority: string;
  role: string;
};

function createDefaultSourcingUiFilters(): SourcingUiFilterState {
  return {
    ...createDefaultAopUiFilters(),
    recruitmentType: '0',
    sourcingPic: '0',
    priority: '0',
    role: '0',
  };
}

function areSourcingFiltersEqual(a: SourcingUiFilterState, b: SourcingUiFilterState): boolean {
  return (
    areAopFiltersEqual(a, b)
    && a.recruitmentType === b.recruitmentType
    && a.sourcingPic === b.sourcingPic
    && a.priority === b.priority
    && a.role === b.role
  );
}

function toSourcingFilters(filters: SourcingUiFilterState): SourcingFilters {
  const dateParams = kasbonDateParams(filters);
  const monthNum = filters.month ? Number(filters.month) : undefined;
  const yearNum = filters.year ? Number(filters.year) : undefined;

  return {
    employer: filters.employer,
    sourced_to: filters.sourcedTo,
    project: filters.project,
    branch: filters.branch,
    client_segments: filters.clientSegments,
    recruitment_type: filters.recruitmentType,
    sourcing_pic: filters.sourcingPic,
    priority: filters.priority,
    role: filters.role,
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

function toSelectOptions(items: Array<{ id: string; name: string }>) {
  return [ALL_OPTION, ...items.map((x) => ({ value: x.id, label: x.name }))];
}

export default function RecruitmentMockupOverview() {
  const [pendingFilters, setPendingFilters] = useState<SourcingUiFilterState>(createDefaultSourcingUiFilters);
  const [appliedFilters, setAppliedFilters] = useState<SourcingUiFilterState>(createDefaultSourcingUiFilters);
  const [filterOptions, setFilterOptions] = useState<SourcingFilterOptions>(EMPTY_SOURCING_FILTER_OPTIONS);
  const [kpis, setKpis] = useState<SourcingExecutiveKpis>(EMPTY_SOURCING_DASHBOARD.kpis);
  const [newCandidateGrowth, setNewCandidateGrowth] = useState<NewCandidateGrowthData>(
    EMPTY_SOURCING_DASHBOARD.newCandidateGrowth,
  );
  const [currentRecruitmentFunnel, setCurrentRecruitmentFunnel] = useState<CurrentRecruitmentFunnelStage[]>(
    EMPTY_SOURCING_DASHBOARD.currentRecruitmentFunnel,
  );
  const [recruitmentProductivity, setRecruitmentProductivity] = useState<RecruitmentProductivityMetric[]>(
    EMPTY_SOURCING_DASHBOARD.recruitmentProductivity,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setNewCandidateGrowth(result.dashboard.newCandidateGrowth);
        setCurrentRecruitmentFunnel(result.dashboard.currentRecruitmentFunnel);
        setRecruitmentProductivity(result.dashboard.recruitmentProductivity);
        setFilterOptions(result.filterOptions);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load sourcing analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sourcing data');
        setKpis(EMPTY_SOURCING_DASHBOARD.kpis);
        setNewCandidateGrowth(EMPTY_SOURCING_DASHBOARD.newCandidateGrowth);
        setCurrentRecruitmentFunnel(EMPTY_SOURCING_DASHBOARD.currentRecruitmentFunnel);
        setRecruitmentProductivity(EMPTY_SOURCING_DASHBOARD.recruitmentProductivity);
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

  const hasPendingChanges = useMemo(
    () => !areSourcingFiltersEqual(pendingFilters, appliedFilters),
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
  const recruitmentTypeOptions = useMemo(
    () => toSelectOptions(filterOptions.recruitment_types),
    [filterOptions.recruitment_types],
  );
  const sourcingPicOptions = useMemo(
    () => toSelectOptions(filterOptions.sourcing_pics),
    [filterOptions.sourcing_pics],
  );
  const priorityOptions = useMemo(
    () => toSelectOptions(filterOptions.priorities),
    [filterOptions.priorities],
  );
  const roleOptions = useMemo(
    () => toSelectOptions(filterOptions.roles),
    [filterOptions.roles],
  );

  const applyButton = (
    <Button
      variant="contained"
      onClick={handleApplyFilters}
      disabled={!hasPendingChanges || loading}
      sx={{ width: { xs: '100%', md: 'auto' }, whiteSpace: 'nowrap' }}
    >
      Apply Filters
    </Button>
  );

  return (
    <PageContainer title="Recruitment Mockup" description="Recruitment mockup KPIs and filters">
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
            Recruitment Mockup
          </Typography>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Grid container spacing={2} width="100%">
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Entity"
                value={pendingFilters.employer}
                options={employerOptions}
                disabled={loading && employerOptions.length <= 1}
                onChange={(next) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    employer: next,
                    sourcedTo: '0',
                    project: '0',
                    branch: '0',
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Branch"
                value={pendingFilters.branch}
                options={branchOptions}
                disabled={loading && branchOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, branch: next }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Client"
                value={pendingFilters.sourcedTo}
                options={sourcedToOptions}
                disabled={loading && sourcedToOptions.length <= 1}
                onChange={(next) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    sourcedTo: next,
                    project: '0',
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Project"
                value={pendingFilters.project}
                options={projectOptions}
                disabled={loading && projectOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, project: next }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Recruitment PIC"
                value={pendingFilters.sourcingPic}
                options={sourcingPicOptions}
                disabled={loading && sourcingPicOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, sourcingPic: next }))}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} width="100%" alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
              <RecruitmentSearchableSelect
                label="Hiring Type"
                value={pendingFilters.recruitmentType}
                options={recruitmentTypeOptions}
                disabled={loading && recruitmentTypeOptions.length <= 1}
                onChange={(next) =>
                  setPendingFilters((prev) => ({ ...prev, recruitmentType: next }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
              <RecruitmentSearchableSelect
                label="Priority"
                value={pendingFilters.priority}
                options={priorityOptions}
                disabled={loading && priorityOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, priority: next }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
              <RecruitmentSearchableSelect
                label="Role"
                value={pendingFilters.role}
                options={roleOptions}
                disabled={loading && roleOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, role: next }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 'auto' }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {applyButton}
            </Grid>
          </Grid>
        </Box>

        <RecruitmentOverviewSection kpis={kpis} loading={loading} />

        <NewCandidateGrowthSection data={newCandidateGrowth} loading={loading} />

        <CurrentRecruitmentFunnelSection stages={currentRecruitmentFunnel} loading={loading} />

        <RecruitmentProductivitySection metrics={recruitmentProductivity} loading={loading} />
      </Box>
    </PageContainer>
  );
}
