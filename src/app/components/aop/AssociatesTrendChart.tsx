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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AopAssociatesTrend,
  AopFilters,
  AopTrendMetric,
  EMPTY_AOP_DASHBOARD,
  fetchAopDashboard,
} from '../../api/aop/AopSlice';
import {
  getLoanChartDateBounds,
  isKasbonDateFilterReady,
  type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import {
  isAopCurrentYearMonthMode,
  trimTrailingZeroPoints,
} from './aopChartHelpers';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface AopTrendChartFilters {
  employer: string;
  sourced_to: string;
  project: string;
  branch: string;
  client_segment: string;
  dateMode: LoanDateMode;
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
}

interface AssociatesTrendChartProps {
  filters: AopTrendChartFilters;
}

const AssociatesTrendChart = ({ filters }: AssociatesTrendChartProps) => {
  const theme = useTheme();
  const [data, setData] = useState<AopAssociatesTrend>(EMPTY_AOP_DASHBOARD.associates_trend);
  const [loading, setLoading] = useState(false);
  const [chartYear, setChartYear] = useState(filters.year ?? '');
  const [metric, setMetric] = useState<AopTrendMetric>('total_associates_on_payroll');

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  useEffect(() => {
    if (filters.dateMode === 'month' && filters.year) {
      setChartYear(filters.year);
    }
  }, [filters.dateMode, filters.year]);

  const dateBounds = useMemo(
    () => getLoanChartDateBounds(filters, chartYear),
    [filters, chartYear],
  );

  const loadTrend = useCallback(async () => {
    if (!dateBounds || !isKasbonDateFilterReady(filters)) return;

    const apiFilters: AopFilters = {
      employer: filters.employer,
      sourced_to: filters.sourced_to,
      project: filters.project,
      branch: filters.branch,
      client_segment: filters.client_segment,
      start_date: dateBounds.startDate,
      end_date: dateBounds.endDate,
    };

    setLoading(true);
    try {
      const result = await fetchAopDashboard(apiFilters);
      setData(result.associates_trend);
    } catch (err) {
      console.error('Failed to load associates trend:', err);
      setData(EMPTY_AOP_DASHBOARD.associates_trend);
    } finally {
      setLoading(false);
    }
  }, [dateBounds, filters]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  const enabledMetrics = useMemo(
    () => data.metric_options.filter((option) => option.enabled),
    [data.metric_options],
  );

  useEffect(() => {
    const isCurrentEnabled = enabledMetrics.some((option) => option.key === metric);
    if (!isCurrentEnabled && enabledMetrics.length > 0) {
      setMetric(enabledMetrics[0].key);
    }
  }, [enabledMetrics, metric]);

  const displayTrend = useMemo(() => {
    const categories = data.categories;
    const values = data.series[metric] ?? [];

    if (isAopCurrentYearMonthMode(filters.dateMode, chartYear)) {
      return trimTrailingZeroPoints(categories, values);
    }

    return { categories, values };
  }, [data.categories, data.series, metric, filters.dateMode, chartYear]);

  const seriesData = displayTrend.values;
  const chartCategories = displayTrend.categories;
  const metricLabel = data.metric_options.find((option) => option.key === metric)?.label ?? '';
  const hasData = chartCategories.length > 0 && seriesData.length > 0;

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#0D9488'],
      markers: { size: 5, strokeColors: '#fff', strokeWidth: 2 },
      xaxis: {
        categories: chartCategories,
        labels: { style: { fontSize: '12px' }, rotate: -45 },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => val.toLocaleString('en-US') },
      },
    }),
    [theme, chartCategories],
  );

  const handleMetricChange = (event: SelectChangeEvent<AopTrendMetric>) => {
    setMetric(event.target.value as AopTrendMetric);
  };

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Associates Trend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Month-to-month associate metrics.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {enabledMetrics.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel>Metric</InputLabel>
                <Select value={metric} label="Metric" onChange={handleMetricChange} disabled={loading}>
                  {enabledMetrics.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {filters.dateMode === 'month' && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={chartYear}
                  label="Year"
                  onChange={(e) => setChartYear(e.target.value)}
                  disabled={loading}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        <Box sx={{ height: 380, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : hasData ? (
            <ReactApexChart
              options={chartOptions}
              series={[{ name: metricLabel, data: seriesData }]}
              type="line"
              height={360}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">No trend data available</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssociatesTrendChart;
