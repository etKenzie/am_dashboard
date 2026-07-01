'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageContainer from '../container/PageContainer';
import KaryawanOverdueTable from '../kasbon/KaryawanOverdueTable';
import KasbonFilters, { KasbonFilterValues, LoanDateModeToggle, LoanTypeValue } from '../kasbon/KasbonFilters';
import { applyLoanDateModeChange, getDefaultKasbonFilterDates } from '../kasbon/kasbonDateHelpers';

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
  
  const [loanType, setLoanType] = useState<LoanTypeValue>('all');
  
  const [filters, setFilters] = useState<KasbonFilterValues>({
    ...getDefaultKasbonFilterDates(),
    employer: '',
    placement: '',
    project: '',
    clientSegment: '',
    productType: '',
  });

  useEffect(() => {
    setFilters({
      ...getDefaultKasbonFilterDates(),
      employer: '',
      placement: '',
      project: '',
      clientSegment: '',
      productType: '',
    });
  }, []);

  const handleFiltersChange = (newFilters: KasbonFilterValues) => {
    console.log('Non-performing list filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    setLoanType(event.target.value as LoanTypeValue);
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
          <Box mb={3}>
            <KaryawanOverdueTable
              filters={{
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
