'use client';

import { useCheckRoles } from '@/app/hooks/useCheckRoles';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ClientSummary, fetchClientSummary } from '../../api/loan/LoanSlice';
import PageContainer from '../container/PageContainer';
import ClientDelinquencyTable from '../kasbon/ClientDelinquencyTable';
import ClientPenetrationTable from '../kasbon/ClientPenetrationTable';
import ClientSummaryTable from '../kasbon/ClientSummaryTable';
import { formatClientSegmentParam } from '../kasbon/KasbonFilters';
import KasbonOverviewFilters, { KasbonOverviewFilterValues } from '../kasbon/KasbonOverviewFilters';
import { getMonthDateRange } from '../kasbon/kasbonDateHelpers';

interface LoanOverviewProps {
  title: string;
  description: string;
  requiredRoles: readonly string[];
}

const EMPTY_OVERVIEW_FILTERS: KasbonOverviewFilterValues = {
  month: '',
  year: '',
  employer: '',
  placement: '',
  project: '',
  branch: '',
  clientSegments: [],
  productType: '',
};

const LoanOverview: React.FC<LoanOverviewProps> = ({
  title,
  description,
  requiredRoles,
}) => {
  const accessCheck = useCheckRoles(requiredRoles);
  console.log(`${title} Access Check:`, accessCheck);

  const [loanType, setLoanType] = useState<'all' | 'kasbon' | 'extradana' | 'aku_cicil'>('all');
  const [filters, setFilters] = useState<KasbonOverviewFilterValues>(EMPTY_OVERVIEW_FILTERS);
  const [clientSummaryData, setClientSummaryData] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    setFilters({
      ...EMPTY_OVERVIEW_FILTERS,
      month: currentMonth,
      year: currentYear,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const dateRange = getMonthDateRange(filters.month, filters.year);
      if (!dateRange || !loanType) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchClientSummary({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          loan_type: loanType,
          employer: filters.employer || undefined,
          sourced_to: filters.placement || undefined,
          project: filters.project || undefined,
          branch: filters.branch || undefined,
          client_segment: formatClientSegmentParam(filters.clientSegments),
          product_type: filters.productType || undefined,
        });

        setClientSummaryData(response.results || []);
      } catch (err) {
        console.error('Failed to fetch client summary data:', err);
        setError('Failed to load data');
        setClientSummaryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filters.month,
    filters.year,
    filters.employer,
    filters.placement,
    filters.project,
    filters.branch,
    filters.clientSegments,
    filters.productType,
    loanType,
  ]);

  const handleFiltersChange = (newFilters: KasbonOverviewFilterValues) => {
    setFilters(newFilters);
  };

  const handleLoanTypeChange = (event: SelectChangeEvent<string>) => {
    const newLoanType = event.target.value as 'all' | 'kasbon' | 'extradana' | 'aku_cicil';
    setLoanType(newLoanType);
    setClientSummaryData([]);
    setError(null);
  };

  return (
    <PageContainer title={title} description={description}>
      <Box>
        <Box mb={3}>
          <Typography variant="h3" fontWeight="bold" mb={1}>
            {title}
          </Typography>
        </Box>

        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel>Loan Type *</InputLabel>
            <Select
              value={loanType}
              label="Loan Type *"
              onChange={handleLoanTypeChange}
              required
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="kasbon">Kasbon</MenuItem>
              <MenuItem value="extradana">Extradana</MenuItem>
              <MenuItem value="aku_cicil">Aku Cicil</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loanType ? (
          <>
            <Box mb={3}>
              <KasbonOverviewFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                loanType={loanType}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'stretch' }}>
                <ClientSummaryTable
                  data={clientSummaryData}
                  loading={loading}
                  error={error}
                  title="Clients by Total Disbursement"
                  sortBy="total_disbursement"
                  displayField="total_disbursement"
                  displayFieldLabel="Total Disbursement"
                  formatValue={(value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <ClientSummaryTable
                  data={clientSummaryData}
                  loading={loading}
                  error={error}
                  title="Clients by Total Requests"
                  sortBy="total_requests"
                  displayField="total_requests"
                  displayFieldLabel="Total Requests"
                  formatValue={(value: number) => value.toLocaleString()}
                />
              </Box>

              <ClientPenetrationTable
                data={clientSummaryData}
                loading={loading}
                error={error}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'stretch' }}>
                <ClientSummaryTable
                  data={clientSummaryData}
                  loading={loading}
                  error={error}
                  title="Clients by Highest Net Admin Fee"
                  sortBy="admin_fee_profit"
                  displayField="admin_fee_profit"
                  displayFieldLabel="Net Admin Fee"
                  formatValue={(value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <ClientDelinquencyTable
                  data={clientSummaryData}
                  loading={loading}
                  error={error}
                />
              </Box>
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
              borderRadius: 2,
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

export default LoanOverview;
