'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchTempInternalPayrollClientRanking,
  TempInternalPayrollClientRankingRow,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import ClientRankingTable from './ClientRankingTable';
import KasbonOverviewFilters, { KasbonOverviewFilterValues } from '../kasbon/KasbonOverviewFilters';

const DUMMY_CLIENT_RANKING: TempInternalPayrollClientRankingRow[] = [
  { sourced_to: 'Acme Corp', project: 'Project Alpha', total_invoice: 450_000_000, outstanding_invoice: 120_000_000, overdue_invoice: 35_000_000 },
  { sourced_to: 'Beta Industries', project: 'Project Beta', total_invoice: 380_000_000, outstanding_invoice: 95_000_000, overdue_invoice: 28_000_000 },
  { sourced_to: 'Gamma Ltd', project: 'Project Gamma', total_invoice: 320_000_000, outstanding_invoice: 80_000_000, overdue_invoice: 42_000_000 },
  { sourced_to: 'Delta Solutions', project: 'Project Delta', total_invoice: 280_000_000, outstanding_invoice: 65_000_000, overdue_invoice: 18_000_000 },
  { sourced_to: 'Epsilon Group', project: 'Project Epsilon', total_invoice: 210_000_000, outstanding_invoice: 50_000_000, overdue_invoice: 12_000_000 },
  { sourced_to: 'Zeta Holdings', project: 'Project Zeta', total_invoice: 175_000_000, outstanding_invoice: 40_000_000, overdue_invoice: 8_000_000 },
  { sourced_to: 'Eta Partners', project: 'Project Eta', total_invoice: 140_000_000, outstanding_invoice: 32_000_000, overdue_invoice: 5_000_000 },
  { sourced_to: 'Theta Inc', project: 'Project Theta', total_invoice: 95_000_000, outstanding_invoice: 22_000_000, overdue_invoice: 3_000_000 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function TempInternalPayrollClientOverview() {
  const [data, setData] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KasbonOverviewFilterValues>({ month: '', year: '' });

  useEffect(() => {
    const d = new Date();
    setFilters({
      month: (d.getMonth() + 1).toString().padStart(2, '0'),
      year: d.getFullYear().toString(),
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!filters.month || !filters.year) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTempInternalPayrollClientRanking({
        month: filters.month,
        year: filters.year,
      });
      setData(res.results?.length ? res.results : DUMMY_CLIENT_RANKING);
    } catch (err) {
      console.warn('Client ranking API not available, using dummy data:', err);
      setData(DUMMY_CLIENT_RANKING);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [filters.month, filters.year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltersChange = (newFilters: KasbonOverviewFilterValues) => {
    setFilters(newFilters);
  };

  return (
    <PageContainer title="Client" description="Clients ranked by invoice metrics">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Client
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Clients ranked by Invoice, Outstanding Invoice, and Overdue Invoice.
        </Typography>

        <Box mb={3}>
          <KasbonOverviewFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </Box>

        {filters.month && filters.year ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <ClientRankingTable
                data={data}
                loading={loading}
                error={error}
                title="Clients by Invoice"
                sortBy="total_invoice"
                displayFieldLabel="Total Invoice"
                formatValue={formatCurrency}
              />
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClientRankingTable
                  data={data}
                  loading={loading}
                  error={error}
                  title="Clients by Outstanding Invoice"
                  sortBy="outstanding_invoice"
                  displayFieldLabel="Outstanding Invoice"
                  formatValue={formatCurrency}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClientRankingTable
                  data={data}
                  loading={loading}
                  error={error}
                  title="Clients by Overdue Invoice"
                  sortBy="overdue_invoice"
                  displayFieldLabel="Overdue Invoice"
                  formatValue={formatCurrency}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Please select month and year to view data
            </Typography>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
