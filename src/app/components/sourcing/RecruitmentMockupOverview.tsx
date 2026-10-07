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
import RecruitmentSearchableSelect from '../recruitment/RecruitmentSearchableSelect';
import {
  EMPTY_RECRUITMENT_EXECUTIVE,
  EMPTY_RECRUITMENT_FILTER_OPTIONS,
  fetchRecruitmentDashboard,
  type RecruitmentFilterOptions,
  type RecruitmentFilters,
} from '../../api/recruitment/RecruitmentSlice';
import CurrentRecruitmentFunnelSection from './CurrentRecruitmentFunnelSection';
import RecruitmentProductivitySection from './RecruitmentProductivitySection';
import NewCandidateGrowthSection from './NewCandidateGrowthSection';
import RecruitmentOverviewSection from './RecruitmentOverviewSection';
import type {
  CurrentRecruitmentFunnelStage,
  NewCandidateGrowthData,
  RecruitmentExecutiveKpis,
  RecruitmentProductivityMetric,
} from './sourcingDummyData';

const ALL_OPTION = { value: '0', label: 'All' };

type RecruitmentUiFilterState = AopUiFilterState & {
  recruitmentType: string;
  recruitmentPic: string;
  priority: string;
  role: string;
};

function createDefaultRecruitmentUiFilters(): RecruitmentUiFilterState {
  return {
    ...createDefaultAopUiFilters(),
    recruitmentType: '0',
    recruitmentPic: '0',
    priority: '0',
    role: '0',
  };
}

function areRecruitmentFiltersEqual(a: RecruitmentUiFilterState, b: RecruitmentUiFilterState): boolean {
  return (
    areAopFiltersEqual(a, b)
    && a.recruitmentType === b.recruitmentType
    && a.recruitmentPic === b.recruitmentPic
    && a.priority === b.priority
    && a.role === b.role
  );
}

function toPeriod(filters: RecruitmentUiFilterState): string {
  if (filters.year && filters.month) {
    return `${filters.year}-${String(filters.month).padStart(2, '0')}`;
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function toRecruitmentFilters(filters: RecruitmentUiFilterState): RecruitmentFilters {
  return {
    employer: filters.employer,
    sourced_to: filters.sourcedTo,
    project: filters.project,
    branch: filters.branch,
    customer_segments: [],
    product_type: '0',
    period: toPeriod(filters),
    priority: filters.priority,
    role: filters.role,
    recruitment_type: filters.recruitmentType,
    recruitment_pic: filters.recruitmentPic,
  };
}

function toSelectOptions(items: Array<{ id: string; name: string }>) {
  return [ALL_OPTION, ...items.map((x) => ({ value: x.id, label: x.name }))];
}

export default function RecruitmentMockupOverview() {
  const [pendingFilters, setPendingFilters] = useState<RecruitmentUiFilterState>(
    createDefaultRecruitmentUiFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<RecruitmentUiFilterState>(
    createDefaultRecruitmentUiFilters,
  );
  const [filterOptions, setFilterOptions] = useState<RecruitmentFilterOptions>(
    EMPTY_RECRUITMENT_FILTER_OPTIONS,
  );
  const [kpis, setKpis] = useState<RecruitmentExecutiveKpis>(EMPTY_RECRUITMENT_EXECUTIVE.kpis);
  const [newCandidateGrowth, setNewCandidateGrowth] = useState<NewCandidateGrowthData>(
    EMPTY_RECRUITMENT_EXECUTIVE.newCandidateGrowth,
  );
  const [currentRecruitmentFunnel, setCurrentRecruitmentFunnel] = useState<CurrentRecruitmentFunnelStage[]>(
    EMPTY_RECRUITMENT_EXECUTIVE.currentRecruitmentFunnel,
  );
  const [recruitmentProductivity, setRecruitmentProductivity] = useState<RecruitmentProductivityMetric[]>(
    EMPTY_RECRUITMENT_EXECUTIVE.recruitmentProductivity,
  );
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchRecruitmentDashboard(toRecruitmentFilters(appliedFilters));
        if (cancelled) return;
        setKpis(result.executive.kpis);
        setNewCandidateGrowth(result.executive.newCandidateGrowth);
        setCurrentRecruitmentFunnel(result.executive.currentRecruitmentFunnel);
        setRecruitmentProductivity(result.executive.recruitmentProductivity);
        setWarnings(result.executive.warnings);
        setFilterOptions(result.filterOptions);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load recruitment dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recruitment dashboard');
        setKpis(EMPTY_RECRUITMENT_EXECUTIVE.kpis);
        setNewCandidateGrowth(EMPTY_RECRUITMENT_EXECUTIVE.newCandidateGrowth);
        setCurrentRecruitmentFunnel(EMPTY_RECRUITMENT_EXECUTIVE.currentRecruitmentFunnel);
        setRecruitmentProductivity(EMPTY_RECRUITMENT_EXECUTIVE.recruitmentProductivity);
        setWarnings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters]);

  useEffect(() => {
    if (pendingFilters.employer === appliedFilters.employer) return;

    let cancelled = false;

    const loadOptions = async () => {
      try {
        const result = await fetchRecruitmentDashboard({
          ...toRecruitmentFilters({
            ...appliedFilters,
            employer: pendingFilters.employer,
            sourcedTo: '0',
            project: '0',
          }),
        });
        if (cancelled) return;
        setFilterOptions(result.filterOptions);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to refresh recruitment filter options:', err);
      }
    };

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [pendingFilters.employer, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
  };

  const hasPendingChanges = useMemo(
    () => !areRecruitmentFiltersEqual(pendingFilters, appliedFilters),
    [pendingFilters, appliedFilters],
  );

  const entitySelected = pendingFilters.employer !== '0';
  const hiringTypeSource =
    filterOptions.hiring_types.length > 0
      ? filterOptions.hiring_types
      : filterOptions.recruitment_types;

  const employerOptions = useMemo(
    () => toSelectOptions(filterOptions.employers),
    [filterOptions.employers],
  );
  const sourcedToOptions = useMemo(
    () => (entitySelected ? toSelectOptions(filterOptions.sourced_to) : [ALL_OPTION]),
    [entitySelected, filterOptions.sourced_to],
  );
  const projectOptions = useMemo(
    () => (entitySelected ? toSelectOptions(filterOptions.projects) : [ALL_OPTION]),
    [entitySelected, filterOptions.projects],
  );
  const branchOptions = useMemo(
    () => toSelectOptions(filterOptions.branches),
    [filterOptions.branches],
  );
  const recruitmentTypeOptions = useMemo(
    () => toSelectOptions(hiringTypeSource),
    [hiringTypeSource],
  );
  const recruitmentPicOptions = useMemo(
    () => toSelectOptions(filterOptions.recruitment_pics),
    [filterOptions.recruitment_pics],
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

        {warnings.length > 0 && (
          <Typography color="warning.main" variant="body2" sx={{ mb: 2 }}>
            {warnings.join(' ')}
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
                disabled={!entitySelected || (loading && sourcedToOptions.length <= 1)}
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
                disabled={!entitySelected || (loading && projectOptions.length <= 1)}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, project: next }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <RecruitmentSearchableSelect
                label="Recruitment PIC"
                value={pendingFilters.recruitmentPic}
                options={recruitmentPicOptions}
                disabled={loading && recruitmentPicOptions.length <= 1}
                onChange={(next) => setPendingFilters((prev) => ({ ...prev, recruitmentPic: next }))}
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
