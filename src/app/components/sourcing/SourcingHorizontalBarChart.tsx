'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SourcingHorizontalBarChartProps {
  title: string;
  subtitle?: string;
  data: SourcingNamedCount[];
  loading?: boolean;
  colors?: string[];
  distributed?: boolean;
  unitLabel?: string;
  reverseOrder?: boolean;
  height?: number;
}

const DEFAULT_BAR_COLOR = '#0D9488';

const SourcingHorizontalBarChart = ({
  title,
  subtitle,
  data,
  loading = false,
  colors,
  distributed = false,
  unitLabel = 'CVs',
  reverseOrder = false,
  height,
}: SourcingHorizontalBarChartProps) => {
  const theme = useTheme();

  const rows = useMemo(() => {
    const next = [...data];
    return reverseOrder ? next.reverse() : next;
  }, [data, reverseOrder]);

  const labels = rows.map((row) => row.label);
  const values = rows.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartColors = colors ?? [DEFAULT_BAR_COLOR];
  const chartHeight = height ?? Math.max(280, labels.length * 36);

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
          barHeight: distributed ? '55%' : '70%',
          distributed,
        },
      },
      colors: chartColors,
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
            return `${val.toLocaleString('en-US')} ${unitLabel} (${pct}%)`;
          },
        },
      },
    }),
    [theme, labels, chartColors, distributed, total, unitLabel],
  );

  return (
    <Card sx={(t) => ({ height: '100%', ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {total.toLocaleString('en-US')} {unitLabel}
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: unitLabel, data: values }]}
              type="bar"
              height={chartHeight}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SourcingHorizontalBarChart;
