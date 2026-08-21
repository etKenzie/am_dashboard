'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';
import SourcingBreakdownList from './SourcingBreakdownList';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CandidateDemographicsChartProps {
  ageDistribution: SourcingNamedCount[];
  genderDistribution: SourcingNamedCount[];
  loading?: boolean;
}

const AGE_COLORS = ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1'];
const GENDER_COLORS = ['#1E88E5', '#EC407A', '#8E24AA'];

const CandidateDemographicsChart = ({
  ageDistribution,
  genderDistribution,
  loading = false,
}: CandidateDemographicsChartProps) => {
  const theme = useTheme();

  const labels = ageDistribution.map((row) => row.label);
  const values = ageDistribution.map((row) => row.value);
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
      colors: AGE_COLORS,
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
          maxWidth: 80,
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} candidates (${pct}%)`;
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
          Candidate Demographics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Age profile of candidates, with gender distribution.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Age
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Total: {total.toLocaleString('en-US')} candidates
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Candidates', data: values }]}
              type="bar"
              height={Math.max(260, labels.length * 34)}
            />
            <SourcingBreakdownList
              title="Gender Dist."
              data={genderDistribution}
              colors={GENDER_COLORS}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateDemographicsChart;
