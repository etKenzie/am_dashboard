'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CvBySkillChartProps {
  data: SourcingNamedCount[];
  loading?: boolean;
}

const BAR_COLOR = '#0D9488';

const CvBySkillChart = ({ data, loading = false }: CvBySkillChartProps) => {
  const theme = useTheme();

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data],
  );
  const labels = sorted.map((row) => row.label);
  const values = sorted.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartHeight = Math.max(320, labels.length * 36);

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
          barHeight: '70%',
          distributed: false,
        },
      },
      colors: [BAR_COLOR],
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
          maxWidth: 140,
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} CVs (${pct}%)`;
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
          CV by Skill
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          CV count by primary skill for the selected period.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No skill data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {total.toLocaleString('en-US')} CVs across {labels.length} skills
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'CVs', data: values }]}
              type="bar"
              height={chartHeight}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CvBySkillChart;
