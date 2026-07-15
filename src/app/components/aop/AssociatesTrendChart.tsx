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
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AopAssociatesTrend,
  AopFilters,
  AopTrendMetric,
  EMPTY_AOP_DASHBOARD,
  fetchAopTrend,
} from '../../api/aop/AopSlice';
import {
  getLoanChartDateBounds,
  isKasbonDateFilterReady,
  type LoanDateMode,
} from '../kasbon/kasbonDateHelpers';
import {
  alignTrendValuesToCategories,
  getStableTrendCategories,
  isAopCurrentYearMonthMode,
} from './aopChartHelpers';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface AopTrendChartFilters {
  employer: string;
  sourced_to: string;
  project: string;
  branch: string;
  client_segments: string[];
  dateMode: LoanDateMode;
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
}

const TOTAL_LINE_COLOR = '#0D9488';
const EMPLOYER_LINE_COLORS = ['#1E88E5', '#FB8C00', '#8E24AA', '#43A047', '#E53935'];

interface TrendSeriesItem {
  name: string;
  data: (number | null)[];
  color: string;
}

function seriesHasTrendData(values: (number | null)[]): boolean {
  return values.some((value) => value !== null && value !== 0);
}

function averageSeriesValue(values: (number | null)[]): number | null {
  const numeric = values.filter((value): value is number => value !== null);
  if (numeric.length === 0 || !seriesHasTrendData(values)) return null;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function formatAverage(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

type TrendGroupMode = 'overall' | 'employer';

const GROUP_MODE_OPTIONS: Array<{ value: TrendGroupMode; label: string }> = [
  { value: 'overall', label: 'Overall' },
  { value: 'employer', label: 'Employer' },
];

interface AssociatesTrendChartProps {
  filters: AopTrendChartFilters;
}

const AssociatesTrendChart = ({ filters }: AssociatesTrendChartProps) => {
  const theme = useTheme();
  const [data, setData] = useState<AopAssociatesTrend>(EMPTY_AOP_DASHBOARD.associates_trend);
  const [loading, setLoading] = useState(false);
  const [chartYear, setChartYear] = useState(filters.year ?? '');
  const [metric, setMetric] = useState<AopTrendMetric>('total_associates_on_payroll');
  const [groupMode, setGroupMode] = useState<TrendGroupMode>('overall');
  const [hiddenSeriesNames, setHiddenSeriesNames] = useState<Set<string>>(() => new Set());
  const apexChartRef = useRef<ApexCharts | null>(null);
  const metricLabelRef = useRef('Total');

  const chartEvents = useMemo(
    () => ({
      mounted: (chart: ApexCharts) => {
        apexChartRef.current = chart;
      },
      updated: (chart: ApexCharts) => {
        apexChartRef.current = chart;
      },
    }),
    [],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  const isAllEmployers = filters.employer === '0';

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
      client_segments: filters.client_segments,
      start_date: dateBounds.startDate,
      end_date: dateBounds.endDate,
    };

    setLoading(true);
    try {
      const result = await fetchAopTrend(apiFilters);
      setData(result);
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

  const enabledMetricKeys = useMemo(
    () => enabledMetrics.map((option) => option.key),
    [enabledMetrics],
  );

  const chartCategories = useMemo(() => {
    if (isAopCurrentYearMonthMode(filters.dateMode, chartYear)) {
      return getStableTrendCategories(data.categories, data.series, enabledMetricKeys);
    }
    return data.categories;
  }, [chartYear, data.categories, data.series, enabledMetricKeys, filters.dateMode]);

  const displayTrend = useMemo(() => {
    const values = alignTrendValuesToCategories(data.series[metric] ?? [], chartCategories.length);
    const employers = (data.employer_series[metric] ?? []).map((employer) => ({
      ...employer,
      values: alignTrendValuesToCategories(employer.values, chartCategories.length),
    }));

    return { categories: chartCategories, values, employerSeries: employers };
  }, [chartCategories, data.employer_series, data.series, metric]);

  const metricLabel = data.metric_options.find((option) => option.key === metric)?.label ?? 'Total';
  metricLabelRef.current = metricLabel;
  const canShowEmployerGroup = isAllEmployers && displayTrend.employerSeries.length > 0;

  useEffect(() => {
    if (!canShowEmployerGroup && groupMode === 'employer') {
      setGroupMode('overall');
    }
  }, [canShowEmployerGroup, groupMode]);

  const allSeriesMeta = useMemo<TrendSeriesItem[]>(() => {
    const totalLine: TrendSeriesItem = {
      name: 'Overall',
      data: displayTrend.values,
      color: TOTAL_LINE_COLOR,
    };

    const employerLines = displayTrend.employerSeries
      .map((employer, index) => ({ employer, index }))
      .filter(({ employer }) => seriesHasTrendData(employer.values))
      .map(({ employer, index }) => ({
        name: employer.label,
        data: employer.values,
        color: EMPLOYER_LINE_COLORS[index % EMPLOYER_LINE_COLORS.length],
      }));

    if (!canShowEmployerGroup || groupMode === 'overall') {
      return [totalLine];
    }

    return employerLines;
  }, [canShowEmployerGroup, displayTrend, groupMode]);

  const seriesSignature = useMemo(
    () => allSeriesMeta.map((series) => series.name).join('|'),
    [allSeriesMeta],
  );

  useEffect(() => {
    setHiddenSeriesNames(new Set());
  }, [seriesSignature, groupMode]);

  const visibleSeriesMeta = useMemo(
    () => allSeriesMeta.filter((series) => !hiddenSeriesNames.has(series.name)),
    [allSeriesMeta, hiddenSeriesNames],
  );

  const toggleSeries = useCallback(
    (name: string) => {
      setHiddenSeriesNames((prev) => {
        const isHidden = prev.has(name);
        if (!isHidden) {
          const visibleCount = allSeriesMeta.filter((series) => !prev.has(series.name)).length;
          if (visibleCount <= 1) return prev;
        }
        const next = new Set(prev);
        if (isHidden) next.delete(name);
        else next.add(name);
        return next;
      });
    },
    [allSeriesMeta],
  );

  const visibleChartSeries = useMemo(
    () => visibleSeriesMeta.map(({ name, data: seriesData }) => ({ name, data: seriesData })),
    [visibleSeriesMeta],
  );

  const visibleColors = useMemo(
    () => visibleSeriesMeta.map((series) => series.color),
    [visibleSeriesMeta],
  );

  const showLegend = allSeriesMeta.length > 1;

  const averageAnnotations = useMemo(
    () =>
      visibleSeriesMeta
        .map((series) => {
          const average = averageSeriesValue(series.data);
          if (average === null) return null;

          return {
            y: average,
            borderColor: series.color,
            strokeDashArray: 6,
            borderWidth: 2,
            opacity: 0.9,
            label: {
              show: true,
              text: `Avg ${formatAverage(average)}`,
              borderColor: series.color,
              style: {
                color: '#fff',
                background: series.color,
                fontSize: '11px',
                fontWeight: 600,
              },
              position: 'right',
            },
          };
        })
        .filter((annotation): annotation is NonNullable<typeof annotation> => annotation !== null),
    [visibleSeriesMeta],
  );

  const hasData =
    chartCategories.length > 0 &&
    visibleChartSeries.some(
      (series) =>
        series.data.length > 0 &&
        series.data.some((value) => value !== null && value !== 0),
    );

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        id: 'aop-associates-trend',
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
        events: chartEvents,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 400,
          animateGradually: {
            enabled: false,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 400,
          },
        },
      },
      stroke: { curve: 'smooth', width: showLegend ? 2 : 3 },
      colors: visibleColors,
      markers: {
        size: showLegend ? 4 : 5,
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: showLegend ? 7 : 6 },
      },
      legend: { show: false },
      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } },
        active: { filter: { type: 'none' } },
      },
      xaxis: {
        categories: chartCategories,
        labels: { style: { fontSize: '12px' }, rotate: -45 },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
        forceNiceScale: true,
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        shared: true,
        intersect: false,
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        fillSeriesColor: false,
        x: { show: true },
        y: {
          formatter: (val: number) => val.toLocaleString('en-US'),
          title: {
            formatter: (seriesName: string) =>
              seriesName === 'Overall' ? metricLabelRef.current : seriesName,
          },
        },
      },
    }),
    [theme, chartCategories, showLegend, visibleColors, chartEvents],
  );

  useEffect(() => {
    const chart = apexChartRef.current;
    if (!chart) return;

    chart.updateOptions({ annotations: { yaxis: [] } }, false, false);

    const timer = window.setTimeout(() => {
      chart.updateOptions(
        { annotations: { yaxis: averageAnnotations } },
        false,
        false,
      );
    }, 420);

    return () => window.clearTimeout(timer);
  }, [averageAnnotations]);

  const handleMetricChange = (event: SelectChangeEvent<AopTrendMetric>) => {
    setMetric(event.target.value as AopTrendMetric);
  };

  const handleGroupModeChange = (event: SelectChangeEvent<TrendGroupMode>) => {
    setGroupMode(event.target.value as TrendGroupMode);
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
            {canShowEmployerGroup && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>View</InputLabel>
                <Select
                  value={groupMode}
                  label="View"
                  onChange={handleGroupModeChange}
                  disabled={loading}
                >
                  {GROUP_MODE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
          ) : visibleChartSeries.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                {allSeriesMeta.length === 0
                  ? 'No trend data available'
                  : 'All series hidden — click a legend item to show again'}
              </Typography>
            </Box>
          ) : hasData ? (
            <>
              <ReactApexChart
                options={chartOptions}
                series={visibleChartSeries}
                type="line"
                height={showLegend ? 320 : 360}
              />
              {showLegend && (
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="center"
                  gap={1.5}
                  sx={{ mt: 1 }}
                >
                  {allSeriesMeta.map((series) => {
                    const isHidden = hiddenSeriesNames.has(series.name);
                    return (
                      <Stack
                        key={series.name}
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        onClick={() => toggleSeries(series.name)}
                        sx={{
                          cursor: 'pointer',
                          opacity: isHidden ? 0.45 : 1,
                          textDecoration: isHidden ? 'line-through' : 'none',
                          borderRadius: 1,
                          px: 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: series.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {series.name}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </>
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
