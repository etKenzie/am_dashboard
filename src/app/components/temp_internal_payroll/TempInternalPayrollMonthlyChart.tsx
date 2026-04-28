'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTempInternalPayrollMonthly,
  TempInternalPayrollMonthlyResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TempInternalPayrollMonthlyChartProps {
  filters: {
    start_date: string;
    end_date: string;
    employer?: string;
    productType?: string;
    customerSegment?: string;
    sourcedTo?: string;
    project?: string;
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type RevenueTrendMetric =
  | 'total_invoice_amount'
  | 'total_management_fee'
  | 'total_headcount'
  | 'total_invoice_released';

const METRIC_CONFIG: Record<
  RevenueTrendMetric,
  { label: string; isCurrency: boolean; valueKey: keyof TempInternalPayrollMonthlyResponse['summaries'][string] }
> = {
  total_invoice_amount: {
    label: 'Total Invoice Amount',
    isCurrency: true,
    valueKey: 'total_invoice_amount',
  },
  total_management_fee: {
    label: 'Total Management Fee',
    isCurrency: true,
    valueKey: 'total_management_fee',
  },
  total_headcount: {
    label: 'Total Headcount',
    isCurrency: false,
    valueKey: 'total_headcount',
  },
  total_invoice_released: {
    label: 'Total Invoice Released',
    isCurrency: false,
    valueKey: 'total_invoice_released',
  },
};

const TempInternalPayrollMonthlyChart = ({ filters }: TempInternalPayrollMonthlyChartProps) => {
  const [chartData, setChartData] = useState<TempInternalPayrollMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<RevenueTrendMetric>('total_invoice_amount');
  const theme = useTheme();

  const fetchChartData = useCallback(async () => {
    if (!filters.start_date || !filters.end_date) return;
    setLoading(true);
    try {
      const response = await fetchTempInternalPayrollMonthly({
        start_date: filters.start_date,
        end_date: filters.end_date,
        employer: filters.employer,
        product_type: filters.productType,
        customer_segment: filters.customerSegment,
        sourced_to: filters.sourcedTo ?? '0',
        project: filters.project ?? '0',
      });
      setChartData(response);
    } catch {
      setChartData({ status: 'ok', summaries: {} });
    } finally {
      setLoading(false);
    }
  }, [
    filters.start_date,
    filters.end_date,
    filters.employer,
    filters.productType,
    filters.customerSegment,
    filters.sourcedTo,
    filters.project,
  ]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleMetricChange = (event: SelectChangeEvent<RevenueTrendMetric>) => {
    setSelectedMetric(event.target.value as RevenueTrendMetric);
  };

  const prepareChartData = () => {
    if (!chartData?.summaries) return { categories: [], series: [] };
    const months = Object.keys(chartData.summaries).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      return MONTH_NAMES.indexOf(monthA) - MONTH_NAMES.indexOf(monthB);
    });
    const categories = months;
    const metricConfig = METRIC_CONFIG[selectedMetric];
    const series = [
      {
        name: metricConfig.label,
        data: months.map((m) => chartData.summaries[m][metricConfig.valueKey] ?? 0),
      },
    ];
    return { categories, series };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      colors: [theme.palette.primary.main],
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: chartDataConfig.categories,
        labels: { style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' } },
        axisBorder: { show: false },
      },
      yaxis: {
        title: { text: METRIC_CONFIG[selectedMetric].label, style: { color: theme.palette.primary.main } },
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          formatter: (value: number) =>
            METRIC_CONFIG[selectedMetric].isCurrency
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value)
              : value.toLocaleString('en-US'),
        },
        axisTicks: { show: true },
        axisBorder: { show: true },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (value: number | null | undefined) => {
            const num = Number(value);
            if (!Number.isFinite(num)) return '—';
            return METRIC_CONFIG[selectedMetric].isCurrency
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(num)
              : num.toLocaleString('en-US');
          },
        },
      },
    }),
    [chartDataConfig.categories, selectedMetric, theme.palette.mode, theme.palette.primary.main]
  );

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h6" sx={{ margin: 0 }}>
            Revenue trend
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Metric</InputLabel>
            <Select value={selectedMetric} label="Metric" onChange={handleMetricChange}>
              <MenuItem value="total_invoice_amount">Total Invoice Amount</MenuItem>
              <MenuItem value="total_management_fee">Total Management Fee</MenuItem>
              <MenuItem value="total_headcount">Total Headcount</MenuItem>
              <MenuItem value="total_invoice_released">Total Invoice Released</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 400, position: 'relative', minHeight: 400, overflow: 'visible' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
            </Box>
          ) : chartData?.summaries && Object.keys(chartData.summaries).length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={chartDataConfig.series}
              type="line"
              height={350}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">No data for the selected period</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(TempInternalPayrollMonthlyChart);
