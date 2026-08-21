'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingTrendPoint } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TargetVsCvReceivedChartProps {
  data: SourcingTrendPoint[];
  loading?: boolean;
}

const TargetVsCvReceivedChart = ({ data, loading = false }: TargetVsCvReceivedChartProps) => {
  const theme = useTheme();

  const categories = useMemo(() => data.map((row) => row.period_label), [data]);
  const targetSeries = useMemo(() => data.map((row) => row.sourcing_target), [data]);
  const receivedSeries = useMemo(() => data.map((row) => row.cv_received), [data]);
  const gapSeries = useMemo(() => data.map((row) => row.sourcing_gap), [data]);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      stroke: {
        curve: 'smooth',
        width: [3, 3, 2],
        dashArray: [0, 0, 5],
      },
      colors: ['#0D9488', '#1E88E5', '#FB8C00'],
      markers: {
        size: [4, 4, 0],
        strokeColors: '#fff',
        strokeWidth: 2,
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
      },
      xaxis: {
        categories,
        labels: { style: { fontSize: '12px' }, rotate: -45 },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
    }),
    [theme, categories],
  );

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Box mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Target vs CV Received vs Sourcing Gap
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Month-to-month sourcing target, CVs received, and gap.
          </Typography>
        </Box>

        <Box sx={{ height: 380, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : data.length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={[
                { name: 'Sourcing Target', data: targetSeries },
                { name: 'CV Received', data: receivedSeries },
                { name: 'Sourcing Gap', data: gapSeries },
              ]}
              type="line"
              height={360}
            />
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

export default TargetVsCvReceivedChart;
