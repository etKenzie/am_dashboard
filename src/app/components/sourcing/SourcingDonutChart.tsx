'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SourcingDonutChartProps {
  title: string;
  subtitle?: string;
  data: SourcingNamedCount[];
  loading?: boolean;
  colors?: string[];
  unitLabel?: string;
}

const DEFAULT_COLORS = ['#1E88E5', '#EC407A', '#8E24AA', '#43A047', '#FB8C00', '#0D9488'];

const SourcingDonutChart = ({
  title,
  subtitle,
  data,
  loading = false,
  colors = DEFAULT_COLORS,
  unitLabel = 'candidates',
}: SourcingDonutChartProps) => {
  const theme = useTheme();
  const labels = data.map((row) => row.label);
  const values = data.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartColors = colors.slice(0, Math.max(values.length, 1));

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'pie',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        parentHeightOffset: 0,
      },
      labels,
      colors: chartColors,
      legend: {
        position: 'bottom',
        fontSize: '12px',
        markers: { width: 8, height: 8, radius: 8 },
        itemMargin: { horizontal: 8, vertical: 2 },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: {
          fontSize: '12px',
          fontWeight: 700,
          colors: ['#fff'],
        },
        dropShadow: { enabled: false },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: -8,
            minAngleToShowLabel: 8,
          },
        },
      },
      stroke: {
        width: 2,
        colors: [theme.palette.background.paper],
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} ${unitLabel} (${pct}%)`;
          },
        },
      },
    }),
    [theme, labels, chartColors, total, unitLabel],
  );

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...aopCardOuterSx(t),
      })}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 || total === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <Typography color="text.secondary">No data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Total: {total.toLocaleString('en-US')} {unitLabel}
            </Typography>
            <Box sx={{ flex: 1, minHeight: 300, overflow: 'visible' }}>
              <ReactApexChart
                options={chartOptions}
                series={values}
                type="pie"
                height={300}
              />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SourcingDonutChart;
