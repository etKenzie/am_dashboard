'use client';

import {
  Box,
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
  fetchCustomerInsight,
  TempInternalPayrollClientRankingRow,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import ClientRankingTable from './ClientRankingTable';

const EMPLOYER_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'PT Valdo International' },
  { value: '2', label: 'PT Valdo Sumber Daya Mandiri' },
  { value: '94', label: 'PT Toko Pandai' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'BPO Bundling' },
  { value: '2', label: 'People' },
  { value: '3', label: 'Infra & Technology' },
  { value: '4', label: 'AkuMaju' },
];

const CUSTOMER_SEGMENT_OPTIONS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Non BFSI Logistic' },
  { value: '2', label: 'Non BFSI F&B' },
  { value: '3', label: 'BFSI Bank' },
  { value: '4', label: 'Non BFSI Others' },
  { value: '5', label: 'Non BFSI Distribution' },
  { value: '6', label: 'Non BFSI E-commerce' },
  { value: '7', label: 'BFSI Insurance' },
  { value: '8', label: 'BFSI Multi Finance' },
  { value: '9', label: 'BFSI Others' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function TempInternalPayrollClientOverview() {
  const [byInvoice, setByInvoice] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOutstanding, setByOutstanding] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOverdue, setByOverdue] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [employer, setEmployer] = useState('0');
  const [productType, setProductType] = useState('0');
  const [customerSegment, setCustomerSegment] = useState('0');

  useEffect(() => {
    const d = new Date();
    setMonth((d.getMonth() + 1).toString().padStart(2, '0'));
    setYear(d.getFullYear().toString());
  }, []);

  const fetchData = useCallback(async () => {
    if (!month || !year) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomerInsight({
        month,
        year,
        employer,
        product_type: productType,
        customer_segment: customerSegment,
      });
      setByInvoice(res.byInvoice ?? []);
      setByOutstanding(res.byOutstanding ?? []);
      setByOverdue(res.byOverdue ?? []);
    } catch {
      setByInvoice([]);
      setByOutstanding([]);
      setByOverdue([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [month, year, employer, productType, customerSegment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0');
    const name = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: num, label: name };
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  return (
    <PageContainer title="Client" description="Clients ranked by invoice metrics">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Client
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Clients ranked by Invoice, Outstanding Invoice, and Overdue Invoice.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e: SelectChangeEvent<string>) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e: SelectChangeEvent<string>) => setYear(e.target.value)}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select value={employer} label="Employer" onChange={(e: SelectChangeEvent<string>) => setEmployer(e.target.value)}>
                {EMPLOYER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select value={productType} label="Product Type" onChange={(e: SelectChangeEvent<string>) => setProductType(e.target.value)}>
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Customer Segment</InputLabel>
              <Select value={customerSegment} label="Customer Segment" onChange={(e: SelectChangeEvent<string>) => setCustomerSegment(e.target.value)}>
                {CUSTOMER_SEGMENT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {month && year ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <ClientRankingTable
                data={byInvoice}
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
                  data={byOutstanding}
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
                  data={byOverdue}
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
