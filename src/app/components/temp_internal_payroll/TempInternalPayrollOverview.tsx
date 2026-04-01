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
  fetchClientInvoiceTable,
  fetchClientOutstandingTable,
  fetchClientOverdueTable,
  fetchTempInternalPayrollSummary,
  TempInternalPayrollClientRankingRow,
  TempInternalPayrollSummaryResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';
import PageContainer from '../container/PageContainer';
import DashboardCard from '../shared/DashboardCard';
import ClientRankingTable from './ClientRankingTable';
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
  collection_rate: 0,
  average_days_to_payment: 0,
  on_time_payment_rate: 0,
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

const SOURCED_TO_OPTIONS = [{ value: '0', label: 'All' }];
const PROJECT_OPTIONS = [{ value: '0', label: 'All' }];

export default function TempInternalPayrollOverview() {
  const [summary, setSummary] = useState<TempInternalPayrollSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [byInvoice, setByInvoice] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOutstanding, setByOutstanding] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [byOverdue, setByOverdue] = useState<TempInternalPayrollClientRankingRow[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [outstandingLoading, setOutstandingLoading] = useState(false);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchOutstanding, setSearchOutstanding] = useState('');
  const [searchOverdue, setSearchOverdue] = useState('');
  const [debouncedSearchInvoice, setDebouncedSearchInvoice] = useState('');
  const [debouncedSearchOutstanding, setDebouncedSearchOutstanding] = useState('');
  const [debouncedSearchOverdue, setDebouncedSearchOverdue] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [employer, setEmployer] = useState('0');
  const [productType, setProductType] = useState('0');
  const [customerSegment, setCustomerSegment] = useState('0');
  const [sourcedTo, setSourcedTo] = useState('0');
  const [project, setProject] = useState('0');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchInvoice(searchInvoice.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInvoice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchOutstanding(searchOutstanding.trim()), 350);
    return () => clearTimeout(t);
  }, [searchOutstanding]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchOverdue(searchOverdue.trim()), 350);
    return () => clearTimeout(t);
  }, [searchOverdue]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        month: month || undefined,
        year: year || undefined,
        employer,
        product_type: productType,
        customer_segment: customerSegment,
        sourced_to: sourcedTo || '0',
        project: project || '0',
      };
      const data = await fetchTempInternalPayrollSummary(params);
      setSummary(data);
    } catch {
      setSummary(PLACEHOLDER_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [month, year, employer, productType, customerSegment, sourcedTo, project]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const clientFilters = {
    month,
    year,
    employer,
    product_type: productType,
    customer_segment: customerSegment,
    sourced_to: sourcedTo || '0',
    project: project || '0',
  };

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setInvoiceLoading(true);
    fetchClientInvoiceTable(clientFilters, debouncedSearchInvoice)
      .then((rows) => {
        if (!cancelled) setByInvoice(rows);
      })
      .catch(() => {
        if (!cancelled) setByInvoice([]);
      })
      .finally(() => {
        if (!cancelled) setInvoiceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchInvoice]);

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setOutstandingLoading(true);
    fetchClientOutstandingTable(clientFilters, debouncedSearchOutstanding)
      .then((rows) => {
        if (!cancelled) setByOutstanding(rows);
      })
      .catch(() => {
        if (!cancelled) setByOutstanding([]);
      })
      .finally(() => {
        if (!cancelled) setOutstandingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchOutstanding]);

  useEffect(() => {
    if (!month || !year) return;
    let cancelled = false;
    setOverdueLoading(true);
    fetchClientOverdueTable(clientFilters, debouncedSearchOverdue)
      .then((rows) => {
        if (!cancelled) setByOverdue(rows);
      })
      .catch(() => {
        if (!cancelled) setByOverdue([]);
      })
      .finally(() => {
        if (!cancelled) setOverdueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year, employer, productType, customerSegment, sourcedTo, project, debouncedSearchOverdue]);

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

  const handleMonthChange = (e: SelectChangeEvent<string>) => setMonth(e.target.value);
  const handleYearChange = (e: SelectChangeEvent<string>) => setYear(e.target.value);
  const handleEmployerChange = (e: SelectChangeEvent<string>) => setEmployer(e.target.value);
  const handleProductTypeChange = (e: SelectChangeEvent<string>) => setProductType(e.target.value);
  const handleCustomerSegmentChange = (e: SelectChangeEvent<string>) => setCustomerSegment(e.target.value);

  const summaryCards = [
    { title: 'Total Nilai Invoice Released', value: data.total_nilai_invoice_released, isCurrency: true },
    { title: 'Total Invoice Paid', value: data.total_invoice_paid, isCurrency: true },
    { title: 'Total Outstanding Invoice', value: data.total_outstanding_invoice, isCurrency: true },
    { title: 'Total Overdue Invoice', value: data.total_overview_invoice, isCurrency: true },
    { title: 'Jumlah Invoice', value: data.jumlah_invoice, isCurrency: false },
  ];

  return (
    <PageContainer title="Invoice" description="Invoice summary and collection insights">
      <Box>
        <Typography variant="h3" fontWeight="bold" mb={1}>
          Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Invoice summary and collection rate.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }} width="100%">
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={handleMonthChange}>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={handleYearChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employer</InputLabel>
              <Select value={employer} label="Employer" onChange={handleEmployerChange}>
                {EMPLOYER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select value={productType} label="Product Type" onChange={handleProductTypeChange}>
                {PRODUCT_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Customer Segment</InputLabel>
              <Select value={customerSegment} label="Customer Segment" onChange={handleCustomerSegmentChange}>
                {CUSTOMER_SEGMENT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sourced To</InputLabel>
              <Select value={sourcedTo} label="Sourced To" onChange={(e: SelectChangeEvent<string>) => setSourcedTo(e.target.value)}>
                {SOURCED_TO_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Project</InputLabel>
              <Select value={project} label="Project" onChange={(e: SelectChangeEvent<string>) => setProject(e.target.value)}>
                {PROJECT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

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
          <TempInternalPayrollMonthlyChart filters={{ month, year, employer, productType, customerSegment, sourcedTo, project }} />
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
          <TempInternalPayrollPaidUnpaidChart filters={{ month, year, employer, productType, customerSegment, sourcedTo, project }} />
        </Box>

        <Box mt={3}>
          <TempInternalPayrollReceivableRiskChart filters={{ employer, productType, customerSegment, sourcedTo, project }} />
        </Box>

        <Box mt={3}>
          <ClientRankingTable
            data={byInvoice}
            loading={invoiceLoading}
            error={null}
            title="Invoice"
            sortBy="total_invoice"
            displayFieldLabel="Total Invoice"
            formatValue={formatCurrency}
            searchValue={searchInvoice}
            onSearchChange={setSearchInvoice}
            showDetailColumns
          />
        </Box>

        <Box mt={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ClientRankingTable
            data={byOutstanding}
            loading={outstandingLoading}
            error={null}
            title="Outstanding Invoice"
            sortBy="outstanding_invoice"
            displayFieldLabel="Total Invoice"
            formatValue={formatCurrency}
            searchValue={searchOutstanding}
            onSearchChange={setSearchOutstanding}
            showDetailColumns
          />
          <ClientRankingTable
            data={byOverdue}
            loading={overdueLoading}
            error={null}
            title="Overdue Invoice"
            sortBy="overdue_invoice"
            displayFieldLabel="Total Invoice"
            formatValue={formatCurrency}
            searchValue={searchOverdue}
            onSearchChange={setSearchOverdue}
            showDetailColumns
          />
        </Box>
      </Box>
    </PageContainer>
  );
}
