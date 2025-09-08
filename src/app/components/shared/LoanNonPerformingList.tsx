'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageContainer from '../container/PageContainer';
import KaryawanOverdueTable from '../kasbon/KaryawanOverdueTable';
import KasbonFilters, { KasbonFilterValues } from '../kasbon/KasbonFilters';

interface LoanNonPerformingListProps {
  loanType: 'kasbon' | 'extradana';
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const LoanNonPerformingList: React.FC<LoanNonPerformingListProps> = ({ 
  loanType, 
  title, 
  description, 
  requiredRoles 
}) => {
  // Check access for allowed roles
  const accessCheck = useCheckRoles(requiredRoles);
  
  // Log access check result for debugging
  console.log(`${title} Access Check:`, accessCheck);
  
  // Initialize filters with empty values to avoid hydration mismatch
  const [filters, setFilters] = useState<KasbonFilterValues>({
    month: '',
    year: '',
    employer: '',
    placement: '',
    project: ''
  });

  // Set initial date values in useEffect to avoid hydration issues
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    
    setFilters({
      month: currentMonth,
      year: currentYear,
      employer: '',
      placement: '',
      project: ''
    });
  }, []);

  const handleFiltersChange = (newFilters: KasbonFilterValues) => {
    console.log('Non-performing list filters changed:', newFilters);
    setFilters(newFilters);
  };

  return (
    <PageContainer title={title} description={description}>
      <Box>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h3" fontWeight="bold" mb={1}>
            {title}
          </Typography>
        </Box>

        {/* Filters */}
        <Box mb={3}>
          <KasbonFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Box>

        {/* Karyawan Overdue Table */}
        <Box mb={3}>
          <KaryawanOverdueTable
            filters={{
              employer: filters.employer,
              placement: filters.placement,
              project: filters.project,
              month: filters.month,
              year: filters.year,
              loanType: loanType
            }}
          />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default LoanNonPerformingList;
