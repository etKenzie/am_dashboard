'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { CandidateGrowthChartData } from '../../api/recruitment/RecruitmentSlice';
import { recruitmentCardOuterSx } from './recruitmentStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CandidateGrowthChartProps {
  data: CandidateGrowthChartData;
  loading?: boolean;
}

const SERIES_COLORS = ['#C4B5FD', '#7C3AED'];

const CandidateGrowthChart = ({ data, loading = false }: CandidateGrowthChartProps) => {
  const theme = useTheme();

  const { categories, series } = data;
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
        <Typography variant="h6" sx={{ mb: 3 }}>
          Candidate growth
        </Typography>
        <Box sx={{ height: 380, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={24} />
            </Box>
          ) : hasData ? (
            <ReactApexChart options={chartOptions} series={series} type="bar" height={340} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">No growth data for the selected filters</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidateGrowthChart;
