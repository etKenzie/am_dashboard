'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, CircularProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CoverageUtilizationResponse, fetchCoverageUtilization, fetchLoanPurpose, fetchRepaymentRisk, LoanPurposeResponse, RepaymentRiskResponse } from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import CoverageUtilizationChart from '../kasbon/CoverageUtilizationChart';
import { applyLoanDateModeChange, getDefaultKasbonFilterDates, isKasbonDateFilterReady, kasbonDateParams } from '../kasbon/kasbonDateHelpers';
import { areKasbonFiltersEqual } from '../kasbon/kasbonFilterHelpers';
import KasbonFilters, { KasbonFilterValues, kasbonScopedLoanParams, LoanDateModeToggle, LoanTypeValue } from '../kasbon/KasbonFilters';
import LoanPurposeChart from '../kasbon/LoanPurposeChart';
import RepaymentRiskChart from '../kasbon/RepaymentRiskChart';
import RepaymentRiskSummary from '../kasbon/RepaymentRiskSummary';
import UserCoverageUtilizationSummary from '../kasbon/UserCoverageUtilizationSummary';

interface LoanDashboardProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanDashboard: React.FC<LoanDashboardProps> = ({ 
  title, 
  description, 
  requiredRoles 
}) => {
  const accessCheck = useCheckRoles(requiredRoles);
  console.log(`${title} Access Check:`, accessCheck);

  const [pendingLoanType, setPendingLoanType] = useState<LoanTypeValue>('all');
  const [appliedLoanType, setAppliedLoanType] = useState<LoanTypeValue>('all');

  const [coverageUtilizationData, setCoverageUtilizationData] = useState<CoverageUtilizationResponse | null>(null);
  const [coverageUtilizationLoading, setCoverageUtilizationLoading] = useState(false);
  const [repaymentRiskData, setRepaymentRiskData] = useState<RepaymentRiskResponse | null>(null);
  const [repaymentRiskLoading, setRepaymentRiskLoading] = useState(false);
  const [loanPurposeData, setLoanPurposeData] = useState<LoanPurposeResponse | null>(null);
  const [loanPurposeLoading, setLoanPurposeLoading] = useState(false);
  const [coverageChartLoading, setCoverageChartLoading] = useState(false);
  const [loanPurposeChartLoading, setLoanPurposeChartLoading] = useState(false);
  const [repaymentChartLoading, setRepaymentChartLoading] = useState(false);
  
  const [pendingFilters, setPendingFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    employer: '',
    placement: '',
    project: '',
    branch: '',
    clientSegments: [],
    productType: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    employer: '',
    placement: '',
    project: '',
    branch: '',
    clientSegments: [],
    productType: '',
  });

  useEffect(() => {
    const defaults = {
      ...getDefaultKasbonFilterDates(),
      employer: '',
      placement: '',
      project: '',
      branch: '',
      clientSegments: [],
      productType: '',
    };
    setPendingFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  const fetchLoanPurposeData = useCallback(async (
    currentFilters: KasbonFilterValues,
    currentLoanType: LoanTypeValue,
  ) => {
    setLoanPurposeLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && currentLoanType) {
        const response = await fetchLoanPurpose({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: currentLoanType,
        });
        setLoanPurposeData(response);
      } else {
        setLoanPurposeData(null);
      }
    } catch (err) {
      console.error('Failed to fetch loan purpose data:', err);
      setLoanPurposeData(null);
    } finally {
      setLoanPurposeLoading(false);
    }
  }, []);

  const fetchCoverageUtilizationData = useCallback(async (
    currentFilters: KasbonFilterValues,
    currentLoanType: LoanTypeValue,
  ) => {
    setCoverageUtilizationLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && currentLoanType) {
        const response = await fetchCoverageUtilization({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: currentLoanType,
        });
        setCoverageUtilizationData(response);
      } else {
        setCoverageUtilizationData(null);
      }
    } catch (err) {
      console.error('Failed to fetch coverage utilization data:', err);
      setCoverageUtilizationData(null);
    } finally {
      setCoverageUtilizationLoading(false);
    }
  }, []);

  const fetchRepaymentRiskData = useCallback(async (
    currentFilters: KasbonFilterValues,
    currentLoanType: LoanTypeValue,
  ) => {
    setRepaymentRiskLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && currentLoanType) {
        const response = await fetchRepaymentRisk({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: currentLoanType,
        });
        setRepaymentRiskData(response);
      } else {
        setRepaymentRiskData(null);
      }
    } catch (err) {
      console.error('Failed to fetch repayment risk data:', err);
      setRepaymentRiskData(null);
    } finally {
      setRepaymentRiskLoading(false);
    }
  }, []);

  const handlePendingFiltersChange = useCallback((newFilters: KasbonFilterValues) => {
    setPendingFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
    setAppliedLoanType(pendingLoanType);
  }, [pendingFilters, pendingLoanType]);

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    setPendingLoanType(event.target.value as LoanTypeValue);
  };

  useEffect(() => {
    if (!isKasbonDateFilterReady(appliedFilters) || !appliedLoanType) return;

    fetchLoanPurposeData(appliedFilters, appliedLoanType);
    fetchCoverageUtilizationData(appliedFilters, appliedLoanType);
    fetchRepaymentRiskData(appliedFilters, appliedLoanType);
  }, [
    appliedFilters,
    appliedLoanType,
    fetchLoanPurposeData,
    fetchCoverageUtilizationData,
    fetchRepaymentRiskData,
  ]);

  const hasPendingChanges = useMemo(
    () => !areKasbonFiltersEqual(pendingFilters, appliedFilters) || pendingLoanType !== appliedLoanType,
    [pendingFilters, appliedFilters, pendingLoanType, appliedLoanType],
  );

  const isDataLoading =
    coverageUtilizationLoading
    || repaymentRiskLoading
    || loanPurposeLoading
    || coverageChartLoading
    || loanPurposeChartLoading
    || repaymentChartLoading;

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
    <PageContainer title={title} description={description}>
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
            {title}
          </Typography>
          <LoanDateModeToggle
            value={pendingFilters.dateMode}
            onChange={(dateMode) => handlePendingFiltersChange(applyLoanDateModeChange(pendingFilters, dateMode))}
          />
        </Box>

        <Box mb={3}>
          <KasbonFilters
            filters={pendingFilters}
            onFiltersChange={handlePendingFiltersChange}
            onApply={handleApplyFilters}
            applyDisabled={!isKasbonDateFilterReady(pendingFilters) || !hasPendingChanges || isDataLoading}
            loanType={pendingLoanType}
            onLoanTypeChange={handleLoanTypeChange}
          />
        </Box>

        {appliedLoanType ? (
          <>
            <Box mb={3}>
              <UserCoverageUtilizationSummary
                coverageUtilizationData={coverageUtilizationData}
                isLoading={coverageUtilizationLoading}
              />
            </Box>

            <Box mb={3}>
              <CoverageUtilizationChart
                filters={chartFilters}
                onLoadingChange={setCoverageChartLoading}
              />
            </Box>

            <Box mb={3}>
              {loanPurposeLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <CircularProgress />
                </Box>
              ) : loanPurposeData ? (
                <LoanPurposeChart
                  filters={chartFilters}
                  onLoadingChange={setLoanPurposeChartLoading}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <Typography variant="body1" color="textSecondary">
                    No data available
                  </Typography>
                </Box>
              )}
            </Box>

            <Box mb={3}>
              <RepaymentRiskSummary
                repaymentRiskData={repaymentRiskData}
                isLoading={repaymentRiskLoading}
              />
            </Box>

            <Box mb={3}>
              <RepaymentRiskChart
                filters={chartFilters}
                onLoadingChange={setRepaymentChartLoading}
              />
            </Box>
          </>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '300px',
              border: '2px dashed #e0e0e0',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Please select a loan type to view data
            </Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default LoanDashboard;
