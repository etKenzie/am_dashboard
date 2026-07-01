'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, CircularProgress, SelectChangeEvent, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CoverageUtilizationResponse, fetchCoverageUtilization, fetchLoanPurpose, fetchRepaymentRisk, LoanPurposeResponse, RepaymentRiskResponse } from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import CoverageUtilizationChart from '../kasbon/CoverageUtilizationChart';
import KasbonFilters, { KasbonFilterValues, kasbonScopedLoanParams, LoanDateModeToggle, LoanTypeValue } from '../kasbon/KasbonFilters';
import { getDefaultKasbonFilterDates, applyLoanDateModeChange, isKasbonDateFilterReady, kasbonDateParams } from '../kasbon/kasbonDateHelpers';
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

  const [loanType, setLoanType] = useState<LoanTypeValue>('all');

  const [coverageUtilizationData, setCoverageUtilizationData] = useState<CoverageUtilizationResponse | null>(null);
  const [coverageUtilizationLoading, setCoverageUtilizationLoading] = useState(false);
  const [repaymentRiskData, setRepaymentRiskData] = useState<RepaymentRiskResponse | null>(null);
  const [repaymentRiskLoading, setRepaymentRiskLoading] = useState(false);
  const [loanPurposeData, setLoanPurposeData] = useState<LoanPurposeResponse | null>(null);
  const [loanPurposeLoading, setLoanPurposeLoading] = useState(false);
  
  const [filters, setFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    employer: '',
    placement: '',
    project: '',
    clientSegment: '',
    productType: '',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...getDefaultKasbonFilterDates(),
    }));
  }, []);

  const fetchLoanPurposeData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setLoanPurposeLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && loanType) {
        const response = await fetchLoanPurpose({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: loanType,
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
  }, [loanType]);

  const fetchCoverageUtilizationData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setCoverageUtilizationLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && loanType) {
        const response = await fetchCoverageUtilization({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: loanType,
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
  }, [loanType]);

  const fetchRepaymentRiskData = useCallback(async (currentFilters: KasbonFilterValues) => {
    setRepaymentRiskLoading(true);
    try {
      if (isKasbonDateFilterReady(currentFilters) && loanType) {
        const response = await fetchRepaymentRisk({
          ...kasbonScopedLoanParams(currentFilters),
          ...kasbonDateParams(currentFilters),
          loan_type: loanType,
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
  }, [loanType]);

  const handleFiltersChange = useCallback((newFilters: KasbonFilterValues) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    fetchLoanPurposeData(newFilters);
    fetchCoverageUtilizationData(newFilters);
    fetchRepaymentRiskData(newFilters);
  }, [fetchLoanPurposeData, fetchCoverageUtilizationData, fetchRepaymentRiskData]);

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    const newLoanType = event.target.value as LoanTypeValue;
    setLoanType(newLoanType);
    setCoverageUtilizationData(null);
    setRepaymentRiskData(null);
    setLoanPurposeData(null);
  };

  useEffect(() => {
    if (isKasbonDateFilterReady(filters) && loanType) {
      fetchLoanPurposeData(filters);
      fetchCoverageUtilizationData(filters);
      fetchRepaymentRiskData(filters);
    }
  }, [
    filters.dateMode,
    filters.month,
    filters.year,
    filters.startDate,
    filters.endDate,
    filters.employer,
    filters.placement,
    filters.project,
    filters.clientSegment,
    filters.productType,
    loanType,
    fetchLoanPurposeData,
    fetchCoverageUtilizationData,
    fetchRepaymentRiskData,
  ]);

  const chartFilters = {
    employer: filters.employer,
    placement: filters.placement,
    project: filters.project,
    clientSegment: filters.clientSegment,
    productType: filters.productType,
    dateMode: filters.dateMode,
    month: filters.month,
    year: filters.year,
    startDate: filters.startDate,
    endDate: filters.endDate,
    loanType,
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
            value={filters.dateMode}
            onChange={(dateMode) => handleFiltersChange(applyLoanDateModeChange(filters, dateMode))}
          />
        </Box>

        <Box mb={3}>
          <KasbonFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loanType={loanType}
            onLoanTypeChange={handleLoanTypeChange}
          />
        </Box>

        {loanType ? (
          <>
            <Box mb={3}>
              <UserCoverageUtilizationSummary
                coverageUtilizationData={coverageUtilizationData}
                isLoading={coverageUtilizationLoading}
              />
            </Box>

            <Box mb={3}>
              <CoverageUtilizationChart filters={chartFilters} />
            </Box>

            <Box mb={3}>
              {loanPurposeLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <CircularProgress />
                </Box>
              ) : loanPurposeData ? (
                <LoanPurposeChart filters={chartFilters} />
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
              <RepaymentRiskChart filters={chartFilters} />
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
