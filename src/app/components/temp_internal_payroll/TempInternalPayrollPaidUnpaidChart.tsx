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
  fetchTempInternalPayrollPaidUnpaid,
  TempInternalPayrollPaidUnpaidResponse,
} from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TempInternalPayrollPaidUnpaidChartProps {
  filters: { month: string; year: string };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getPlaceholderPaidUnpaidData(
  startMonthYear: string,
  endMonthYear: string
): TempInternalPayrollPaidUnpaidResponse {
  const [startMM, startYYYY] = startMonthYear.split('-').map(Number);
  const [endMM, endYYYY] = endMonthYear.split('-').map(Number);
  const start = new Date(startYYYY, startMM - 1);
  const end = new Date(endYYYY, endMM - 1);
  const summaries: Record<string, { paid: number; unpaid: number }> = {};
  const cursor = new Date(start.getFullYear(), start.getMonth());
  while (cursor <= end) {
    const key = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
    const base = 40_000_000 + cursor.getMonth() * 3_000_000;
    summaries[key] = {
      paid: base + Math.floor(Math.random() * 15_000_000),
      unpaid: Math.floor(Math.random() * 20_000_000) + 5_000_000,
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return { status: 'ok', summaries };
}

const TempInternalPayrollPaidUnpaidChart = ({ filters }: TempInternalPayrollPaidUnpaidChartProps) => {
  const [chartData, setChartData] = useState<TempInternalPayrollPaidUnpaidResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [startMonthYear, setStartMonthYear] = useState<string>('');
  const [endMonthYear, setEndMonthYear] = useState<string>('');
  const theme = useTheme();

  const generateMonthYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options: { value: string; label: string }[] = [];
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = currentYear - yearOffset;
      for (let month = 1; month <= 12; month++) {
        const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
        const monthNum = month.toString().padStart(2, '0');
        options.push({ value: `${monthNum}-${year}`, label: `${monthName} ${year}` });
      }
    }
    return options.reverse();
  };

  const monthYearOptions = generateMonthYearOptions();

  useEffect(() => {
    if (filters.month && filters.year) {
      const selectedMonth = parseInt(filters.month);
      const selectedYear = parseInt(filters.year);
      let defaultStartMonth = selectedMonth - 3; // default 3 months range
      let defaultStartYear = selectedYear;
      if (defaultStartMonth <= 0) {
        defaultStartMonth += 12;
        defaultStartYear -= 1;
      }
      if (defaultStartMonth < 1) {
        defaultStartMonth = 1;
        defaultStartYear = selectedYear - 1;
      }
      const defaultStartValue = `${defaultStartMonth.toString().padStart(2, '0')}-${defaultStartYear}`;
      const endValue = `${filters.month}-${filters.year}`;
      if (!startMonthYear && !endMonthYear) {
        setStartMonthYear(defaultStartValue);
        setEndMonthYear(endValue);
      } else if (endMonthYear !== endValue) {
        setEndMonthYear(endValue);
        setStartMonthYear(defaultStartValue);
      }
    }
  }, [filters.month, filters.year]);

  const fetchChartData = useCallback(async () => {
    if (!startMonthYear || !endMonthYear) return;
    setLoading(true);
    try {
      const response = await fetchTempInternalPayrollPaidUnpaid({
        start_month: startMonthYear,
        end_month: endMonthYear,
      });
      setChartData(response);
    } catch (err) {
      console.warn('Temp internal payroll paid/unpaid API not available, using placeholder:', err);
      setChartData(getPlaceholderPaidUnpaidData(startMonthYear, endMonthYear));
    } finally {
      setLoading(false);
    }
  }, [startMonthYear, endMonthYear]);

  useEffect(() => {
    if (startMonthYear && endMonthYear) fetchChartData();
  }, [startMonthYear, endMonthYear, fetchChartData]);

  const handleStartMonthYearChange = (e: SelectChangeEvent<string>) => setStartMonthYear(e.target.value);
  const handleEndMonthYearChange = (e: SelectChangeEvent<string>) => setEndMonthYear(e.target.value);

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
    // Paid first (bottom), Unpaid second (top) — stacked vertically
    const series = [
      { name: 'Paid', data: months.map((m) => chartData.summaries[m].paid) },
      { name: 'Unpaid', data: months.map((m) => chartData.summaries[m].unpaid) },
    ];
    return { categories, series };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions: any = useMemo(
    () => ({
      chart: {
        type: 'bar',
        stacked: true,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '65%',
          stacked: true,
          borderRadius: 0,
        },
      },
      colors: [theme.palette.success.main, theme.palette.error.main], // Paid (bottom), Unpaid (top)
      stroke: { show: true, width: 1, colors: ['transparent'] },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
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
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          formatter: (value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
        },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
        },
      },
    }),
    [
      chartDataConfig.categories,
      theme.palette.mode,
      theme.palette.success.main,
      theme.palette.error.main,
    ]
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ margin: 0 }}>
            Invoice Trends — Paid vs Unpaid
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Start Month</InputLabel>
              <Select value={startMonthYear} label="Start Month" onChange={handleStartMonthYearChange}>
                {monthYearOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>End Month</InputLabel>
              <Select value={endMonthYear} label="End Month" onChange={handleEndMonthYearChange}>
                {monthYearOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
              type="bar"
              height={350}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">Select start and end month to view data</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(TempInternalPayrollPaidUnpaidChart);
