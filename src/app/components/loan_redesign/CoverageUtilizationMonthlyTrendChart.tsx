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
  CoverageUtilizationMonthlyResponse,
  fetchCoverageUtilizationMonthly,
} from '../../api/loan/LoanSlice';
import { formatClientSegmentParam } from '../kasbon/KasbonFilters';
import type { LoanTrendChartFilters } from '../kasbon/kasbonDateHelpers';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type SeriesKey = 'Requests' | 'Approvals' | 'Rejections' | 'New Borrowers';

const SERIES_META: Array<{ name: SeriesKey; color: string }> = [
  { name: 'Requests', color: '#2563EB' },
  { name: 'Approvals', color: '#16A34A' },
  { name: 'Rejections', color: '#DC2626' },
  { name: 'New Borrowers', color: '#D97706' },
];

type ChartSeriesData = {
  categories: string[];
  series: Record<SeriesKey, number[]>;
};

const EMPTY_CHART: ChartSeriesData = {
  categories: [],
  series: {
    Requests: [],
    Approvals: [],
    Rejections: [],
    'New Borrowers': [],
  },
};

function buildSeriesFromMonthly(
  monthlyData: CoverageUtilizationMonthlyResponse['monthly_data'] | undefined,
  year: string,
): ChartSeriesData {
  if (!monthlyData) return EMPTY_CHART;

  const months = Object.keys(monthlyData)
    .filter((key) => key.endsWith(` ${year}`))
    .sort((a, b) => {
      const monthA = MONTH_NAMES.indexOf(a.split(' ')[0]);
      const monthB = MONTH_NAMES.indexOf(b.split(' ')[0]);
      return monthA - monthB;
    });

  const categories: string[] = [];
  const series: Record<SeriesKey, number[]> = {
    Requests: [],
    Approvals: [],
    Rejections: [],
    'New Borrowers': [],
  };

  months.forEach((key) => {
    const row = monthlyData[key];
    const requests = row.total_loan_requests ?? 0;
    const approvals = row.total_approved_requests ?? 0;
    const rejections = row.total_rejected_requests ?? 0;
    const newBorrowers = row.total_first_borrow ?? 0;
    if (requests === 0 && approvals === 0 && rejections === 0 && newBorrowers === 0) return;

    const monthIndex = MONTH_NAMES.indexOf(key.split(' ')[0]);
    categories.push(MONTH_LABELS[monthIndex] ?? key.split(' ')[0]);
    series.Requests.push(requests);
    series.Approvals.push(approvals);
    series.Rejections.push(rejections);
    series['New Borrowers'].push(newBorrowers);
  });

  return { categories, series };
}

interface CoverageUtilizationMonthlyTrendChartProps {
  filters: LoanTrendChartFilters;
  onLoadingChange?: (loading: boolean) => void;
}

const CoverageUtilizationMonthlyTrendChart = ({
  filters,
  onLoadingChange,
}: CoverageUtilizationMonthlyTrendChartProps) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(filters.year || String(currentYear));
  const [hiddenSeries, setHiddenSeries] = useState<Set<SeriesKey>>(() => new Set());
  const [chartData, setChartData] = useState<CoverageUtilizationMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => String(currentYear - i)),
    [currentYear],
  );

  useEffect(() => {
    if (filters.dateMode === 'month' && filters.year) {
      setYear(filters.year);
    }
  }, [filters.dateMode, filters.year]);

  const fetchChartData = useCallback(async () => {
    if (!year || !filters.loanType) return;

    setLoading(true);
    try {
      const response = await fetchCoverageUtilizationMonthly({
        employer: filters.employer || undefined,
        sourced_to: filters.placement || undefined,
        project: filters.project || undefined,
        client_segment: formatClientSegmentParam(filters.clientSegments),
        product_type: filters.productType || undefined,
        start_date: `${year}-01-01`,
        end_date: `${year}-12-31`,
        loan_type: filters.loanType,
      });
      setChartData(response);
    } catch (error) {
      console.error('Failed to fetch coverage utilization monthly data:', error);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [
    year,
    filters.employer,
    filters.placement,
    filters.project,
    filters.clientSegments,
    filters.productType,
    filters.loanType,
  ]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const chartSeriesData = useMemo(
    () => (chartData ? buildSeriesFromMonthly(chartData.monthly_data, year) : EMPTY_CHART),
    [chartData, year],
  );

  const visibleMeta = useMemo(
    () => SERIES_META.filter((series) => !hiddenSeries.has(series.name)),
    [hiddenSeries],
  );

  const series = useMemo(
    () =>
      visibleMeta.map(({ name }) => ({
        name,
        data: chartSeriesData.series[name],
      })),
    [visibleMeta, chartSeriesData],
  );

  const colors = useMemo(() => visibleMeta.map((item) => item.color), [visibleMeta]);

  const toggleSeries = useCallback((name: SeriesKey) => {
    setHiddenSeries((prev) => {
      const isHidden = prev.has(name);
      if (!isHidden) {
        const visibleCount = SERIES_META.filter((item) => !prev.has(item.name)).length;
        if (visibleCount <= 1) return prev;
      }
      const next = new Set(prev);
      if (isHidden) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      colors,
      stroke: {
        curve: 'smooth',
        width: 2.5,
      },
      markers: {
        size: 3.5,
        hover: { sizeOffset: 2 },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 4,
      },
      xaxis: {
        categories: chartSeriesData.categories,
        title: { text: year },
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => Number(val).toLocaleString('en-US'),
          style: { fontSize: '12px' },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        y: {
          formatter: (val: number) =>
            val == null ? '—' : Number(val).toLocaleString('en-US'),
        },
      },
      noData: {
        text: 'No data for this year',
      },
    }),
    [theme, year, colors, chartSeriesData.categories],
  );

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value);
    setHiddenSeries(new Set());
  };

  return (
    <Card
      sx={(t) => ({
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
        boxShadow: t.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.06)',
      })}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
              }}
            >
              Coverage Utilization Monthly Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Requests, approvals, rejections, and new borrowers across the full year
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="coverage-trend-year-label">Year</InputLabel>
            <Select
              labelId="coverage-trend-year-label"
              label="Year"
              value={year}
              onChange={handleYearChange}
            >
              {yearOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={360}>
            <CircularProgress />
          </Box>
        ) : (
          <ReactApexChart
            key={`coverage-trend-${year}`}
            options={chartOptions}
            series={series}
            type="line"
            height={360}
          />
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mt: 1,
          }}
        >
          {SERIES_META.map((item) => {
            const isHidden = hiddenSeries.has(item.name);
            return (
              <Box
                key={item.name}
                component="button"
                type="button"
                onClick={() => toggleSeries(item.name)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  opacity: isHidden ? 0.4 : 1,
                  p: 0.25,
                  color: 'text.secondary',
                  fontFamily: 'inherit',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ textDecoration: isHidden ? 'line-through' : 'none' }}
                >
                  {item.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CoverageUtilizationMonthlyTrendChart;
