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
import { useMemo, useState } from 'react';
import { CandidateGrowthChartData } from '../../api/recruitment/RecruitmentSlice';
import { recruitmentCardOuterSx } from './recruitmentStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CHART_DATA_START_YEAR = 2022;
const SERIES_COLORS = ['#C4B5FD', '#7C3AED'];

interface CandidateGrowthChartProps {
  data: CandidateGrowthChartData;
  loading?: boolean;
}

function filterGrowthByYear(data: CandidateGrowthChartData, yearFilter: string): CandidateGrowthChartData {
  if (yearFilter === 'all') return data;

  const year = Number(yearFilter);
  const indices = data.categoryKeys
    .map((key, i) => (key.startsWith(`${year}-`) ? i : -1))
    .filter((i) => i >= 0);

  return {
    categoryKeys: indices.map((i) => data.categoryKeys[i]),
    categories: indices.map((i) => data.categories[i]),
    series: data.series.map((s) => ({
      name: s.name,
      data: indices.map((i) => s.data[i] ?? 0),
    })),
  };
}

const CandidateGrowthChart = ({ data, loading = false }: CandidateGrowthChartProps) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(currentYear));

  const yearOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (let y = currentYear; y >= CHART_DATA_START_YEAR; y--) {
      options.push({ value: String(y), label: String(y) });
    }
    options.push({ value: 'all', label: 'All' });
    return options;
  }, [currentYear]);

  const filteredData = useMemo(() => filterGrowthByYear(data, yearFilter), [data, yearFilter]);

  const { categories, series } = filteredData;
  const hasData = categories.length > 0 && series.length > 0;

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: series.length > 1 ? '70%' : '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
        },
      },
      colors: SERIES_COLORS,
      dataLabels: { enabled: false },
      legend: {
        show: series.length > 1,
        position: 'top',
        fontSize: '13px',
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          rotate: -35,
        },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
        },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
    }),
    [categories, series.length, theme.palette.mode]
  );

  return (
    <Card sx={(theme) => recruitmentCardOuterSx(theme)}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h6">Candidate growth</Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={yearFilter}
              label="Period"
              onChange={(e: SelectChangeEvent<string>) => setYearFilter(e.target.value)}
            >
              {yearOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 380, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
            </Box>
          ) : hasData ? (
            <ReactApexChart options={chartOptions} series={series} type="bar" height={340} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">No growth data for the selected period</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidateGrowthChart;
