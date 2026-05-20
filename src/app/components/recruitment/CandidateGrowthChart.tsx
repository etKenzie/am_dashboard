'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { CandidateGrowthPoint } from '../../api/recruitment/RecruitmentSlice';
import { recruitmentCardOuterSx } from './recruitmentStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CandidateGrowthChartProps {
  data: CandidateGrowthPoint[];
  loading?: boolean;
}

/** Top of bar — light purple */
const PURPLE_GRADIENT_TOP = '#C4B5FD';
/** Bottom of bar — medium purple */
const PURPLE_GRADIENT_BOTTOM = '#A78BFA';

const CandidateGrowthChart = ({ data, loading = false }: CandidateGrowthChartProps) => {
  const theme = useTheme();

  const categories = data.map((d) => d.month);
  const series = [{ name: 'Candidates', data: data.map((d) => d.count) }];

  const chartOptions: any = useMemo(
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
          columnWidth: '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
        },
      },
      colors: [PURPLE_GRADIENT_TOP],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.25,
          gradientToColors: [PURPLE_GRADIENT_BOTTOM],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
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
    [categories, theme.palette.mode]
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
          ) : data.length > 0 ? (
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
