'use client';

import { Box, CircularProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApplicantInsightsResponse,
  BadDebtRecoveryResponse,
  CoverageUtilizationResponse,
  fetchApplicantInsights,
  fetchBadDebtRecovery,
  fetchCoverageUtilization,
  fetchRepaymentRisk,
  RepaymentRiskResponse,
} from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import {
  applyLoanDateModeChange,
  getDefaultKasbonFilterDates,
  isKasbonDateFilterReady,
  kasbonDateParams,
  kasbonMonthYearParams,
} from '../kasbon/kasbonDateHelpers';
import { areKasbonFiltersEqual } from '../kasbon/kasbonFilterHelpers';
import KasbonFilters, {
  KasbonFilterValues,
  kasbonScopedLoanParams,
  LoanDateModeToggle,
  LoanTypeValue,
} from '../kasbon/KasbonFilters';
import AdminFeeRepaymentCard, { AdminFeeRepaymentCardData } from './AdminFeeRepaymentCard';
import BadDebtRecoveryCard, { BadDebtRecoveryCardData } from './BadDebtRecoveryCard';
import CoverageUtilizationMonthlyTrendChart from './CoverageUtilizationMonthlyTrendChart';
import DemographyAgeRangeList, { mapAgeRangeItems } from './DemographyAgeRangeList';
import GenderPieChart, { mapGenderItems } from './GenderPieChart';
import LoanCoverageCard, { LoanCoverageCardData } from './LoanCoverageCard';
import LoanDisbursementCard, { LoanDisbursementCardData } from './LoanDisbursementCard';
import LoanRequestCard, { LoanRequestCardData } from './LoanRequestCard';
import PerformanceCard, { PerformanceCardData } from './PerformanceCard';
import PrincipalRepaymentCard, { PrincipalRepaymentCardData } from './PrincipalRepaymentCard';
import RepaymentRiskMonthlyTrendChart from './RepaymentRiskMonthlyTrendChart';
import TopRejectReasonChart, { mapRejectReasons } from './TopRejectReasonChart';
import TotalExpectedRepaymentCard, {
  TotalExpectedRepaymentCardData,
} from './TotalExpectedRepaymentCard';

const EMPTY_SCOPE_FILTERS = {
  employer: '',
  placement: '',
  project: '',
  branch: '',
  clientSegments: [] as string[],
  productType: '',
};

function toPercent(rate: number | undefined | null): number {
  return (rate ?? 0) * 100;
}

const EMPTY_COVERAGE: LoanCoverageCardData = {
  eligiblePercent: 0,
  eligibleEmployees: 0,
  totalActiveEmployees: 0,
  coverageProject: 0,
};

const EMPTY_REQUEST: LoanRequestCardData = {
  penetrationPercent: 0,
  totalRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
};

const EMPTY_DISBURSEMENT: LoanDisbursementCardData = {
  newBorrowers: 0,
  totalDisbursed: 0,
  averageDisbursed: 0,
  processingTimeDays: 0,
};

const EMPTY_EXPECTED: TotalExpectedRepaymentCardData = {
  totalExpected: 0,
  collected: 0,
  unrecovered: 0,
  outstanding: 0,
};

const EMPTY_PRINCIPAL: PrincipalRepaymentCardData = {
  collectionRate: 0,
  principalCollected: 0,
  unrecoveredPrincipal: 0,
};

const EMPTY_ADMIN_FEE: AdminFeeRepaymentCardData = {
  collectionRate: 0,
  adminFeeCollected: 0,
  unrecoveredAdminFee: 0,
};

const EMPTY_PERFORMANCE: PerformanceCardData = {
  adminFeeProfit: 0,
  delinquenciesRate: 0,
};

const EMPTY_BAD_DEBT: BadDebtRecoveryCardData = {
  totalRecovery: 0,
  principal: 0,
  adminFee: 0,
  loanRequests: 0,
};

const LoanRedesignOverview = () => {
  const [pendingLoanType, setPendingLoanType] = useState<LoanTypeValue>('all');
  const [appliedLoanType, setAppliedLoanType] = useState<LoanTypeValue>('all');
  const [pendingFilters, setPendingFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    ...EMPTY_SCOPE_FILTERS,
  });
  const [appliedFilters, setAppliedFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    ...EMPTY_SCOPE_FILTERS,
  });

  const [coverageData, setCoverageData] = useState<CoverageUtilizationResponse | null>(null);
  const [repaymentData, setRepaymentData] = useState<RepaymentRiskResponse | null>(null);
  const [applicantInsightsData, setApplicantInsightsData] =
    useState<ApplicantInsightsResponse | null>(null);
  const [badDebtData, setBadDebtData] = useState<BadDebtRecoveryResponse | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [repaymentLoading, setRepaymentLoading] = useState(false);
  const [applicantInsightsLoading, setApplicantInsightsLoading] = useState(false);
  const [badDebtLoading, setBadDebtLoading] = useState(false);
  const [coverageChartLoading, setCoverageChartLoading] = useState(false);
  const [repaymentChartLoading, setRepaymentChartLoading] = useState(false);

  useEffect(() => {
    const defaults = {
      ...getDefaultKasbonFilterDates(),
      ...EMPTY_SCOPE_FILTERS,
    };
    setPendingFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  const fetchCoverageData = useCallback(
    async (currentFilters: KasbonFilterValues, currentLoanType: LoanTypeValue) => {
      setCoverageLoading(true);
      try {
        if (isKasbonDateFilterReady(currentFilters) && currentLoanType) {
          const response = await fetchCoverageUtilization({
            ...kasbonScopedLoanParams(currentFilters),
            ...kasbonDateParams(currentFilters),
            loan_type: currentLoanType,
          });
          setCoverageData(response);
        } else {
          setCoverageData(null);
        }
      } catch (err) {
        console.error('Failed to fetch coverage utilization data:', err);
        setCoverageData(null);
      } finally {
        setCoverageLoading(false);
      }
    },
    [],
  );

  const fetchRepaymentData = useCallback(
    async (currentFilters: KasbonFilterValues, currentLoanType: LoanTypeValue) => {
      setRepaymentLoading(true);
      try {
        if (isKasbonDateFilterReady(currentFilters) && currentLoanType) {
          const response = await fetchRepaymentRisk({
            ...kasbonScopedLoanParams(currentFilters),
            ...kasbonDateParams(currentFilters),
            loan_type: currentLoanType,
          });
          setRepaymentData(response);
        } else {
          setRepaymentData(null);
        }
      } catch (err) {
        console.error('Failed to fetch repayment risk data:', err);
        setRepaymentData(null);
      } finally {
        setRepaymentLoading(false);
      }
    },
    [],
  );

  const fetchApplicantInsightsData = useCallback(
    async (currentFilters: KasbonFilterValues, currentLoanType: LoanTypeValue) => {
      setApplicantInsightsLoading(true);
      try {
        const monthYear = kasbonMonthYearParams(currentFilters);
        if (isKasbonDateFilterReady(currentFilters) && currentLoanType && monthYear.month && monthYear.year) {
          const response = await fetchApplicantInsights({
            ...kasbonScopedLoanParams(currentFilters),
            ...monthYear,
            loan_type: currentLoanType,
          });
          setApplicantInsightsData(response);
        } else {
          setApplicantInsightsData(null);
        }
      } catch (err) {
        console.error('Failed to fetch applicant insights data:', err);
        setApplicantInsightsData(null);
      } finally {
        setApplicantInsightsLoading(false);
      }
    },
    [],
  );

  const fetchBadDebtRecoveryData = useCallback(
    async (currentFilters: KasbonFilterValues, currentLoanType: LoanTypeValue) => {
      setBadDebtLoading(true);
      try {
        const monthYear = kasbonMonthYearParams(currentFilters);
        if (isKasbonDateFilterReady(currentFilters) && currentLoanType && monthYear.month && monthYear.year) {
          const response = await fetchBadDebtRecovery({
            ...kasbonScopedLoanParams(currentFilters),
            ...monthYear,
            loan_type: currentLoanType,
          });
          setBadDebtData(response);
        } else {
          setBadDebtData(null);
        }
      } catch (err) {
        console.error('Failed to fetch bad debt recovery data:', err);
        setBadDebtData(null);
      } finally {
        setBadDebtLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isKasbonDateFilterReady(appliedFilters) || !appliedLoanType) return;
    fetchCoverageData(appliedFilters, appliedLoanType);
    fetchRepaymentData(appliedFilters, appliedLoanType);
    fetchApplicantInsightsData(appliedFilters, appliedLoanType);
    fetchBadDebtRecoveryData(appliedFilters, appliedLoanType);
  }, [
    appliedFilters,
    appliedLoanType,
    fetchCoverageData,
    fetchRepaymentData,
    fetchApplicantInsightsData,
    fetchBadDebtRecoveryData,
  ]);

  const hasPendingChanges = useMemo(
    () =>
      !areKasbonFiltersEqual(pendingFilters, appliedFilters) || pendingLoanType !== appliedLoanType,
    [pendingFilters, appliedFilters, pendingLoanType, appliedLoanType],
  );

  const isDataLoading =
    coverageLoading ||
    repaymentLoading ||
    applicantInsightsLoading ||
    badDebtLoading ||
    coverageChartLoading ||
    repaymentChartLoading;

  const handlePendingFiltersChange = (filters: KasbonFilterValues) => {
    setPendingFilters(filters);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    setPendingLoanType(event.target.value as LoanTypeValue);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setAppliedLoanType(pendingLoanType);
  };

  const coverageCardData = useMemo((): LoanCoverageCardData => {
    if (!coverageData) return EMPTY_COVERAGE;
    return {
      eligiblePercent: toPercent(coverageData.eligible_rate),
      eligibleEmployees: coverageData.total_eligible_employees ?? 0,
      totalActiveEmployees: coverageData.total_active_employees ?? 0,
      coverageProject: coverageData.total_coverage_project ?? 0,
    };
  }, [coverageData]);

  const requestCardData = useMemo((): LoanRequestCardData => {
    if (!coverageData) return EMPTY_REQUEST;
    return {
      penetrationPercent: toPercent(coverageData.penetration_rate),
      totalRequests: coverageData.total_loan_requests ?? 0,
      approvedRequests: coverageData.total_approved_requests ?? 0,
      rejectedRequests: coverageData.total_rejected_requests ?? 0,
    };
  }, [coverageData]);

  const disbursementCardData = useMemo((): LoanDisbursementCardData => {
    if (!coverageData) return EMPTY_DISBURSEMENT;
    return {
      newBorrowers: coverageData.total_new_borrowers ?? 0,
      totalDisbursed: coverageData.total_disbursed_amount ?? 0,
      averageDisbursed: coverageData.average_disbursed_amount ?? 0,
      processingTimeDays: Math.round(coverageData.average_approval_time ?? 0),
    };
  }, [coverageData]);

  const expectedRepaymentCardData = useMemo((): TotalExpectedRepaymentCardData => {
    if (!repaymentData) return EMPTY_EXPECTED;
    const expected = repaymentData.total_expected_repayment ?? 0;
    const unrecovered = repaymentData.total_unrecovered_repayment ?? 0;
    const outstanding = repaymentData.total_outstanding_repayment ?? 0;
    const collected =
      repaymentData.total_collected_repayment ??
      Math.max(0, expected - unrecovered - outstanding);
    return {
      totalExpected: expected,
      collected,
      unrecovered,
      outstanding,
    };
  }, [repaymentData]);

  const principalCardData = useMemo((): PrincipalRepaymentCardData => {
    if (!repaymentData) return EMPTY_PRINCIPAL;
    const collected = repaymentData.total_loan_principal_collected ?? 0;
    const unrecovered = repaymentData.total_unrecovered_loan_principal ?? 0;
    const collectionRate =
      repaymentData.principal_collection_rate != null
        ? toPercent(repaymentData.principal_collection_rate)
        : collected + unrecovered > 0
          ? (collected / (collected + unrecovered)) * 100
          : 0;
    return {
      collectionRate,
      principalCollected: collected,
      unrecoveredPrincipal: unrecovered,
    };
  }, [repaymentData]);

  const adminFeeCardData = useMemo((): AdminFeeRepaymentCardData => {
    if (!repaymentData) return EMPTY_ADMIN_FEE;
    const collected = repaymentData.total_admin_fee_collected ?? 0;
    const unrecovered = repaymentData.total_unrecovered_admin_fee ?? 0;
    const collectionRate =
      repaymentData.admin_fee_collection_rate != null
        ? toPercent(repaymentData.admin_fee_collection_rate)
        : collected + unrecovered > 0
          ? (collected / (collected + unrecovered)) * 100
          : 0;
    return {
      collectionRate,
      adminFeeCollected: collected,
      unrecoveredAdminFee: unrecovered,
    };
  }, [repaymentData]);

  const performanceCardData = useMemo((): PerformanceCardData => {
    if (!repaymentData) return EMPTY_PERFORMANCE;
    return {
      adminFeeProfit: repaymentData.admin_fee_profit ?? 0,
      delinquenciesRate: toPercent(repaymentData.delinquencies_rate),
    };
  }, [repaymentData]);

  const rejectReasonData = useMemo(
    () => mapRejectReasons(applicantInsightsData?.top_reject_reasons),
    [applicantInsightsData],
  );

  const genderData = useMemo(
    () => mapGenderItems(applicantInsightsData?.applicants_by_gender),
    [applicantInsightsData],
  );

  const ageRangeData = useMemo(
    () => mapAgeRangeItems(applicantInsightsData?.applicants_by_age_range),
    [applicantInsightsData],
  );

  const badDebtCardData = useMemo((): BadDebtRecoveryCardData => {
    if (!badDebtData) return EMPTY_BAD_DEBT;
    return {
      totalRecovery: badDebtData.total_recovery ?? 0,
      principal: badDebtData.total_principal_recovered ?? 0,
      adminFee: badDebtData.total_admin_fee_recovered ?? 0,
      loanRequests: badDebtData.loan_request_count ?? 0,
    };
  }, [badDebtData]);

  const chartFilters = {
    employer: appliedFilters.employer,
    placement: appliedFilters.placement,
    project: appliedFilters.project,
    branch: appliedFilters.branch,
    clientSegments: appliedFilters.clientSegments,
    productType: appliedFilters.productType,
    dateMode: appliedFilters.dateMode,
    month: appliedFilters.month,
    year: appliedFilters.year,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    loanType: appliedLoanType,
  };

  return (
    <PageContainer
      title="Client Performance"
      description="Loan coverage, utilization, and repayment risk"
    >
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
            Client Performance
          </Typography>
          <LoanDateModeToggle
            value={pendingFilters.dateMode}
            onChange={(dateMode) =>
              handlePendingFiltersChange(applyLoanDateModeChange(pendingFilters, dateMode))
            }
          />
        </Box>

        <Box mb={3}>
          <KasbonFilters
            filters={pendingFilters}
            onFiltersChange={handlePendingFiltersChange}
            onApply={handleApplyFilters}
            applyDisabled={
              !isKasbonDateFilterReady(pendingFilters) || !hasPendingChanges || isDataLoading
            }
            loanType={pendingLoanType}
            onLoanTypeChange={handleLoanTypeChange}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          User Coverage & Utilization
        </Typography>

        {coverageLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={180} mb={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              alignItems: 'stretch',
            }}
          >
            <LoanCoverageCard data={coverageCardData} />
            <LoanRequestCard data={requestCardData} />
            <LoanDisbursementCard data={disbursementCardData} />
          </Box>
        )}

        <Box mt={3}>
          <CoverageUtilizationMonthlyTrendChart
            filters={chartFilters}
            onLoadingChange={setCoverageChartLoading}
          />
        </Box>

        <Box
          mt={3}
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr 1fr',
            },
            alignItems: 'stretch',
          }}
        >
          {applicantInsightsLoading ? (
            <Box
              sx={{ gridColumn: '1 / -1' }}
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={280}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TopRejectReasonChart data={rejectReasonData} />
              <GenderPieChart data={genderData} />
              <DemographyAgeRangeList data={ageRangeData} />
            </>
          )}
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          Repayment Risk
        </Typography>

        {repaymentLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={180} mb={2}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TotalExpectedRepaymentCard data={expectedRepaymentCardData} />

            <Box
              mt={2}
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                alignItems: 'stretch',
              }}
            >
              <PrincipalRepaymentCard data={principalCardData} />
              <AdminFeeRepaymentCard data={adminFeeCardData} />
              <PerformanceCard data={performanceCardData} />
            </Box>
          </>
        )}

        <Box mt={3}>
          <RepaymentRiskMonthlyTrendChart
            filters={chartFilters}
            onLoadingChange={setRepaymentChartLoading}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          Bad Debt Recovery
        </Typography>

        {badDebtLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}>
            <CircularProgress />
          </Box>
        ) : (
          <BadDebtRecoveryCard data={badDebtCardData} />
        )}
      </Box>
    </PageContainer>
  );
};

export default LoanRedesignOverview;
