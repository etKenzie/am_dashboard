'use client';

import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchTempInternalPayrollSummary,
  TempInternalPayrollSummaryResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import DashboardCard from '../shared/DashboardCard';
import CollectionRateCard from './CollectionRateCard';
import TempInternalPayrollMonthlyChart from './TempInternalPayrollMonthlyChart';
import TempInternalPayrollPaidUnpaidChart from './TempInternalPayrollPaidUnpaidChart';
import TempInternalPayrollReceivableRiskChart from './TempInternalPayrollReceivableRiskChart';

const PLACEHOLDER_SUMMARY: TempInternalPayrollSummaryResponse = {
  status: 'ok',
  total_nilai_invoice_released: 0,
  total_invoice_paid: 0,
  total_outstanding_invoice: 0,
  total_overview_invoice: 0,
  jumlah_invoice: 0,
  collection_rate: 60,
  average_days_to_payment: 0,
  on_time_payment_rate: 85, // simulated default for demo
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function TempInternalPayrollOverview() {
  const [summary, setSummary] = useState<TempInternalPayrollSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params: { month?: string; year?: string } = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const data = await fetchTempInternalPayrollSummary(params);
      setSummary(data);
    } catch (err) {
      console.warn('Temp internal payroll summary API not available, using placeholder:', err);
      setSummary(PLACEHOLDER_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Initialize month/year on client to avoid hydration mismatch
  useEffect(() => {
    const d = new Date();
    if (!month) setMonth((d.getMonth() + 1).toString().padStart(2, '0'));
    if (!year) setYear(d.getFullYear().toString());
  }, []);

  const data = summary ?? PLACEHOLDER_SUMMARY;

  const months = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    const name = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: num, label: name };
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleMonthChange = (e: SelectChangeEvent<string>) => {
    setMonth(e.target.value);
  };
  const handleYearChange = (e: SelectChangeEvent<string>) => {
    setYear(e.target.value);
  };

  const summaryCards = [
    { title: 'Total Nilai Invoice Released', value: data.total_nilai_invoice_released, isCurrency: true },
    { title: 'Total Invoice Paid', value: data.total_invoice_paid, isCurrency: true },
    { title: 'Total Outstanding Invoice', value: data.total_outstanding_invoice, isCurrency: true },
    { title: 'Total Overview Invoice', value: data.total_overview_invoice, isCurrency: true },
    { title: 'Jumlah Invoice', value: data.jumlah_invoice, isCurrency: false },
  ];

  return (
    <PageContainer title="Temp Internal Payroll" description="Internal payroll invoice summary (temp)">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Temp Internal Payroll
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Invoice summary and collection rate. This view will eventually replace the internal payroll overview.
        </Typography>

        <Box mb={3} display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Month</InputLabel>
            <Select value={month} label="Month" onChange={handleMonthChange}>
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={handleYearChange}>
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3} alignItems="stretch">
          {summaryCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
              <DashboardCard>
                <Box
                  p={2}
                  sx={{
                    height: '96px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '96px',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : card.isCurrency ? (
                      formatCurrency(card.value)
                    ) : (
                      formatNumber(card.value)
                    )}
                  </Box>
                </Box>
              </DashboardCard>
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CollectionRateCard
              title="Collection Rate"
              value={data.collection_rate}
              isLoading={loading}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <TempInternalPayrollMonthlyChart filters={{ month, year }} />
        </Box>

        <Grid container spacing={3} alignItems="stretch" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard>
              <Box
                p={2}
                sx={{
                  height: '96px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '96px',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Average Days to Payment
                </Typography>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatNumber(data.average_days_to_payment)
                  )}
                </Box>
              </Box>
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CollectionRateCard
              title="On Time Payment Rate"
              value={data.on_time_payment_rate}
              isLoading={loading}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <TempInternalPayrollPaidUnpaidChart filters={{ month, year }} />
        </Box>

        <Box mt={3}>
          <TempInternalPayrollReceivableRiskChart filters={{ month, year }} />
        </Box>
      </Box>
    </PageContainer>
  );
}
