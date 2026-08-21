'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';
import SourcingBreakdownList from './SourcingBreakdownList';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface HiringRequirementChartProps {
  salaryRange: SourcingNamedCount[];
  minimumEducation: SourcingNamedCount[];
  loading?: boolean;
}

const SALARY_COLORS = ['#1E88E5', '#42A5F5', '#0D9488', '#FB8C00', '#E53935'];
const EDUCATION_COLORS = ['#6D4C41', '#8E24AA', '#1E88E5', '#43A047'];

const HiringRequirementChart = ({
  salaryRange,
  minimumEducation,
  loading = false,
}: HiringRequirementChartProps) => {
  const theme = useTheme();

  const labels = salaryRange.map((row) => row.label);
  const values = salaryRange.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '65%',
          distributed: true,
        },
      },
      colors: SALARY_COLORS,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
          return `${val.toLocaleString('en-US')} (${pct}%)`;
        },
        style: { fontSize: '11px', fontWeight: 600 },
      },
      xaxis: {
        categories: labels,
        labels: { formatter: (val: string) => Number(val).toLocaleString('en-US') },
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px' },
          maxWidth: 90,
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} roles (${pct}%)`;
          },
        },
      },
    }),
    [theme, labels, total],
  );

  return (
    <Card sx={(t) => ({ height: '100%', ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Hiring Requirement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Salary range demand, with minimum education mix.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Salary Range
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Total: {total.toLocaleString('en-US')} roles
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Roles', data: values }]}
              type="bar"
              height={Math.max(240, labels.length * 36)}
            />
            <SourcingBreakdownList
              title="Minimum Education"
              data={minimumEducation}
              colors={EDUCATION_COLORS}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HiringRequirementChart;
