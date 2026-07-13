'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import PageContainer from '../container/PageContainer';
import KaryawanOverdueTable from '../kasbon/KaryawanOverdueTable';
import KasbonFilters, { KasbonFilterValues, LoanDateModeToggle, LoanTypeValue } from '../kasbon/KasbonFilters';
import { applyLoanDateModeChange, getDefaultKasbonFilterDates, isKasbonDateFilterReady } from '../kasbon/kasbonDateHelpers';
import { areKasbonFiltersEqual } from '../kasbon/kasbonFilterHelpers';

interface LoanNonPerformingListProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanNonPerformingList: React.FC<LoanNonPerformingListProps> = ({ 
  title, 
  description, 
  requiredRoles 
}) => {
  const accessCheck = useCheckRoles(requiredRoles);
  console.log(`${title} Access Check:`, accessCheck);
  
  const [pendingLoanType, setPendingLoanType] = useState<LoanTypeValue>('all');
  const [appliedLoanType, setAppliedLoanType] = useState<LoanTypeValue>('all');

  const defaultFilterValues = (): KasbonFilterValues => ({
    ...getDefaultKasbonFilterDates(),
    employer: '',
    placement: '',
    project: '',
    branch: '',
    clientSegments: [],
    productType: '',
  });

  const [pendingFilters, setPendingFilters] = useState<KasbonFilterValues>(defaultFilterValues);
  const [appliedFilters, setAppliedFilters] = useState<KasbonFilterValues>(defaultFilterValues);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const defaults = defaultFilterValues();
    setPendingFilters(defaults);
    setAppliedFilters(defaults);
  }, []);

  const handlePendingFiltersChange = (newFilters: KasbonFilterValues) => {
    setPendingFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setAppliedLoanType(pendingLoanType);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    setPendingLoanType(event.target.value as LoanTypeValue);
  };

  const hasPendingChanges = useMemo(
    () => !areKasbonFiltersEqual(pendingFilters, appliedFilters) || pendingLoanType !== appliedLoanType,
    [pendingFilters, appliedFilters, pendingLoanType, appliedLoanType],
  );

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
          <Box mb={3}>
            <KaryawanOverdueTable
              onLoadingChange={setIsDataLoading}
              filters={{
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
              }}
            />
          </Box>
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

export default LoanNonPerformingList;
